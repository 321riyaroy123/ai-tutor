import os
import sys
import re
import traceback
from datetime import datetime
from typing import List

if sys.platform == "win32":
    import types
    sys.modules["pwd"] = types.SimpleNamespace(getpwuid=lambda x: None)

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
from sympy import symbols, solve, Eq, sympify, latex
from transformers import pipeline
import torch

os.environ["TOKENIZERS_PARALLELISM"] = "false"

def log_issue(message: str):
    with open("issues.txt", "a", encoding="utf-8") as f:
        f.write(f"{datetime.now()} - {message}\n")

def log_response(query: str, response: str):
    with open("responses.txt", "a", encoding="utf-8") as f:
        f.write(f"{datetime.now()} - Query: {query}\nResponse: {response}\n\n{'='*60}\n\n")

def solve_equation(equation_str: str):
    """Solve mathematical equations using SymPy and return LaTeX."""
    x = symbols('x')
    try:
        equation_str = equation_str.strip()
        if "=" in equation_str:
            left, right = equation_str.split("=", 1)
            left_expr = sympify(left.strip())
            right_expr = sympify(right.strip())
            eq = Eq(left_expr, right_expr)
        else:
            expr = sympify(equation_str)
            eq = Eq(expr, 0)
        
        solutions = solve(eq, x)
        
        # Format with LaTeX
        latex_eq = latex(eq)
        latex_sol = [latex(sol) for sol in solutions]
        
        return {
            "solutions": solutions,
            "latex_equation": latex_eq,
            "latex_solutions": latex_sol
        }
    except Exception as e:
        return None

def get_formula_info(query: str) -> dict:
    """Get standard formulas with LaTeX formatting."""
    query_lower = query.lower()
    
    formulas = {
        "quadratic formula": {
            "name": "Quadratic Formula",
            "formula": r"x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}",
            "description": "For equations of the form ax² + bx + c = 0",
            "variables": {
                "a": "coefficient of x²",
                "b": "coefficient of x",
                "c": "constant term"
            }
        },
        "newton's second law": {
            "name": "Newton's Second Law",
            "formula": r"F = ma",
            "description": "Force equals mass times acceleration",
            "variables": {
                "F": "Force (in Newtons)",
                "m": "mass (in kilograms)",
                "a": "acceleration (in m/s²)"
            }
        },
        "pythagorean theorem": {
            "name": "Pythagorean Theorem",
            "formula": r"a^2 + b^2 = c^2",
            "description": "In a right triangle, the square of the hypotenuse equals the sum of squares of the other sides"
        },
        "kinetic energy": {
            "name": "Kinetic Energy",
            "formula": r"KE = \frac{1}{2}mv^2",
            "description": "The energy of motion"
        }
    }
    
    for key, info in formulas.items():
        if key in query_lower:
            return info
    
    return None

def enhance_prompt(input_dict: dict):
    """Enhance prompt with formulas, SymPy solutions, and LaTeX."""
    try:
        question = input_dict.get("question", "")
        context = input_dict.get("context", "")
        
        enhanced_context = context
        
        # Check for known formulas first
        formula_info = get_formula_info(question)
        if formula_info:
            formula_text = f"\n\n[FORMULA REFERENCE]\n"
            formula_text += f"Name: {formula_info['name']}\n"
            formula_text += f"Formula: {formula_info['formula']}\n"
            formula_text += f"Description: {formula_info['description']}\n"
            
            if 'variables' in formula_info:
                formula_text += "Variables:\n"
                for var, desc in formula_info['variables'].items():
                    formula_text += f"  - {var}: {desc}\n"
            
            enhanced_context = f"{context}\n{formula_text}"
        
        # Check for equation solving
        math_keywords = ["solve", "equation", "find x", "calculate x"]
        if any(keyword in question.lower() for keyword in math_keywords):
            patterns = [
                r"([xX0-9\+\-\*/\^\(\)\s]+(?:=\s*[xX0-9\+\-\*/\^\(\)\s]+)?)",
                r"(?:solve|find|calculate)\s+(.+?)(?:\?|$)",
            ]
            for pat in patterns:
                m = re.search(pat, question, re.IGNORECASE)
                if m:
                    equation_str = m.group(1)
                    equation_str = re.sub(
                        r"^(solve|find|calculate|compute)\b",
                        "",
                        equation_str,
                        flags=re.I
                    ).strip()
                    if equation_str:
                        result = solve_equation(equation_str)
                        if result:
                            sol_text = f"\n\n[SYMBOLIC SOLUTION]\n"
                            sol_text += f"Equation: {result['latex_equation']}\n"
                            sol_text += f"Solutions: {', '.join(result['latex_solutions'])}\n"
                            enhanced_context = f"{enhanced_context}\n{sol_text}"
                            break
        
        return {"context": enhanced_context, "question": question}
    except Exception as e:
        log_issue(f"enhance_prompt error: {e}\n{traceback.format_exc()}")
        return {"context": input_dict.get("context", ""), "question": input_dict.get("question", "")}

class RagAgent:
    def __init__(
        self,
        pdf_folder: str = r"data/openstax",
        persist_dir: str = "faiss_db",
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        retriever_k: int = 3,  # Increased from 2
    ):
        self.pdf_folder = pdf_folder
        self.persist_dir = persist_dir
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.embedding_model = embedding_model
        self.retriever_k = retriever_k

        self.db = None
        self.retriever = None
        self.pipe = None
        self.model_type = None

        # Improved prompt template
        self.prompt = PromptTemplate.from_template(
"""You are a knowledgeable STEM tutor. Using the reference material provided, answer the student's question clearly and accurately.

Reference Material:
{context}

Student Question: {question}

Provide a clear, step-by-step explanation. For formulas, describe what each variable means and give an example if appropriate.

Tutor's Answer:"""
        )

        self._setup_vectorstore()
        self._setup_llm()

    def _load_pdfs(self) -> List:
        docs = []
        if not os.path.exists(self.pdf_folder):
            print(f"⚠️ PDF folder not found: {self.pdf_folder}")
            log_issue(f"PDF folder not found: {self.pdf_folder}")
            return docs
        
        pdf_files = [f for f in os.listdir(self.pdf_folder) if f.lower().endswith(".pdf")]
        if not pdf_files:
            print(f"⚠️ No PDF files found in {self.pdf_folder}")
            log_issue(f"No PDF files in {self.pdf_folder}")
            return docs
            
        for filename in pdf_files:
            try:
                filepath = os.path.join(self.pdf_folder, filename)
                loader = PyPDFLoader(filepath)
                loaded = loader.load()
                docs.extend(loaded)
                print(f"📄 Loaded {filename} ({len(loaded)} pages)")
            except Exception as e:
                log_issue(f"Error loading {filename}: {e}\n{traceback.format_exc()}")
                print(f"❌ Failed to load {filename}: {e}")
        
        return docs

    def _chunk_documents(self, docs: List):
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        return splitter.split_documents(docs)

    def _setup_vectorstore(self):
        """Build or load FAISS index."""
        try:
            if os.path.exists(self.persist_dir):
                faiss_files = [f for f in os.listdir(self.persist_dir) if f.endswith(".faiss")]
                if faiss_files:
                    print("📦 Loading existing FAISS index...")
                    embedding_function = HuggingFaceEmbeddings(
                        model_name=self.embedding_model,
                        model_kwargs={"device": "cpu"}
                    )
                    self.db = FAISS.load_local(
                        self.persist_dir, 
                        embedding_function, 
                        allow_dangerous_deserialization=True
                    )
                    self.retriever = self.db.as_retriever(search_kwargs={"k": self.retriever_k})
                    print(f"✅ FAISS index loaded with {self.db.index.ntotal} vectors")
                    return

            print("📚 Building new FAISS index...")
            all_docs = self._load_pdfs()
            
            if not all_docs:
                print("⚠️ No PDFs found to index. Continuing without retrieval.")
                log_issue("No PDFs loaded - running without retrieval")
                return

            chunks = self._chunk_documents(all_docs)
            print(f"✂️ Created {len(chunks)} chunks")

            embedding_function = HuggingFaceEmbeddings(
                model_name=self.embedding_model,
                model_kwargs={"device": "cpu"}
            )

            print("🔄 Creating embeddings (this may take a few minutes)...")
            self.db = FAISS.from_documents(chunks, embedding_function)
            self.retriever = self.db.as_retriever(search_kwargs={"k": self.retriever_k})

            os.makedirs(self.persist_dir, exist_ok=True)
            self.db.save_local(self.persist_dir)

            print(f"✅ FAISS vectorstore created with {len(chunks)} chunks")
        except Exception as e:
            log_issue(f"_setup_vectorstore error: {e}\n{traceback.format_exc()}")
            print(f"❌ Vectorstore setup failed: {e}")

    def _setup_llm(self):
        """Setup LLM - try Flan-T5-base or Flan-T5-large for better quality."""
        try:
            # Try Flan-T5-large first (better quality)
            print("⚙️ Attempting to load Flan-T5-large...")
            self.pipe = pipeline(
                "text2text-generation",
                model="google/flan-t5-large",
                device=-1,
            )
            self.model_type = "text2text"
            print("✅ Loaded Flan-T5-large (best quality)")
            
        except Exception as e:
            log_issue(f"Flan-T5-large failed: {e}")
            print("🔁 Falling back to Flan-T5-base...")
            try:
                self.pipe = pipeline(
                    "text2text-generation",
                    model="google/flan-t5-base",
                    device=-1,
                )
                self.model_type = "text2text"
                print("✅ Loaded Flan-T5-base")
            except Exception as e2:
                log_issue(f"All models failed: {e2}")
                print("❌ Could not load any model!")
                self.pipe = None

    def _format_docs(self, docs: List) -> str:
        if not docs:
            return ""
        formatted = []
        for i, d in enumerate(docs):
            content = getattr(d, "page_content", str(d))[:600]  # Increased from 400
            formatted.append(f"[Source {i+1}]\n{content}")
        return "\n\n".join(formatted)

    def _retrieve(self, query: str) -> List:
        try:
            if self.retriever:
                docs = self.retriever.get_relevant_documents(query)
                return docs
            return []
        except Exception as e:
            log_issue(f"_retrieve error: {e}\n{traceback.format_exc()}")
            return []

    def _clean_response(self, text: str) -> str:
        """Clean up generated response."""
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Check for repetition
        words = text.split()
        if len(words) >= 10:
            first_phrase = ' '.join(words[:10])
            if text.count(first_phrase) >= 3:
                idx = text.find(first_phrase)
                text = text[idx:idx+300]
                last_period = text.rfind('.')
                if last_period > 50:
                    text = text[:last_period+1]
        
        return text

    def _generate(self, prompt_text: str) -> str:
        """Generate response with proper parameters."""
        try:
            if self.pipe is None:
                return "Error: Model not initialized."
            
            print(f"\n🔍 Generating response...")
            
            # Generate - remove max_new_tokens to avoid conflict
            result = self.pipe(
                prompt_text,
                max_length=600,  # Only use max_length
                min_length=50,
                do_sample=True,
                temperature=0.8,
                top_p=0.92,
                repetition_penalty=1.3,
                no_repeat_ngram_size=3,
                early_stopping=True,
            )
            
            print(f"🔍 Raw output: {result}")
            
            if isinstance(result, list) and len(result) > 0:
                item = result[0]
                if isinstance(item, dict):
                    generated = item.get("generated_text", "")
                    
                    if generated:
                        cleaned = self._clean_response(generated)
                        print(f"✅ Generated {len(cleaned)} characters")
                        return cleaned
            
            return "I apologize, but I couldn't generate a proper response."
            
        except Exception as e:
            error_msg = f"Generation error: {str(e)}"
            print(f"❌ {error_msg}")
            log_issue(f"{error_msg}\n{traceback.format_exc()}")
            return f"Error: {str(e)}"

    def answer(self, question: str) -> str:
        """Main RAG pipeline with enhanced formula support."""
        try:
            print(f"\n{'='*60}")
            print(f"📝 Question: {question}")
            
            # Retrieve context
            docs = self._retrieve(question)
            print(f"📚 Retrieved {len(docs)} documents")
            
            # Format context
            if docs:
                context = self._format_docs(docs)
            else:
                context = "No specific textbook material found. Using general knowledge."
            
            # Enhance with formulas and SymPy
            enhanced = enhance_prompt({"question": question, "context": context})
            
            # Build prompt
            full_prompt = self.prompt.format(
                context=enhanced["context"][:2000],  # Limit context
                question=enhanced["question"]
            )
            
            print(f"📋 Prompt built ({len(full_prompt)} chars)")
            
            # Generate
            if self.pipe is None:
                return "Error: Language model not initialized."
            
            response = self._generate(full_prompt)
            
            # Log
            log_response(question, response)
            
            print(f"✅ Complete")
            print(f"{'='*60}\n")
            
            return response
            
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            print(f"❌ {error_msg}")
            log_issue(f"{error_msg}\n{traceback.format_exc()}")
            return error_msg

if __name__ == "__main__":
    rag = RagAgent(pdf_folder=r"data/openstax", persist_dir="faiss_db")

    test_queries = [
        "What is Newton's Second Law of Motion?",
        "Explain the quadratic formula",
        "Solve x^2 - 5x + 6 = 0"
    ]

    for q in test_queries:
        print(f"📘 Query: {q}")
        print("-" * 60)
        resp = rag.answer(q)
        print(f"Answer:\n{resp}\n")
        print("="*60 + "\n")