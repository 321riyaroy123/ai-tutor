from fastapi import APIRouter
from pathlib import Path
from pypdf import PdfReader
from rag.chunker import chunk_text   # ← your own chunker
import json
import uuid

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

# ---- Paths ----
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data" / "openstax"
CHUNK_DIR = BASE_DIR / "data" / "processed"
DB_DIR    = BASE_DIR / "rag_db"

CHUNK_DIR.mkdir(parents=True, exist_ok=True)

# ---- Helpers ----
def extract_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    return "\n".join(page.extract_text() for page in reader.pages if page.extract_text())

# ---- Route ----
@router.post("/")
def ingest_documents():
    from sentence_transformers import SentenceTransformer
    import chromadb

    embedder      = SentenceTransformer("all-MiniLM-L6-v2")
    chroma_client = chromadb.PersistentClient(path=str(DB_DIR))
    collection    = chroma_client.get_or_create_collection(name="ai-tutor")

    all_chunks        = []
    documents_ingested = 0

    for pdf_file in DATA_DIR.glob("*.pdf"):
        text = extract_text(pdf_file)

        # chunk_text returns a list of dicts: {"page": int, "text": str}
        chunks = chunk_text(text, clean_math=False)

        for chunk in chunks:
            embedding = embedder.encode(chunk["text"]).tolist()
            chunk_id  = str(uuid.uuid4())

            collection.add(
                documents=[chunk["text"]],
                embeddings=[embedding],
                ids=[chunk_id],
                metadatas=[{"source": pdf_file.name, "page": chunk.get("page", 0)}]
            )

            all_chunks.append({
                "id":     chunk_id,
                "source": pdf_file.name,
                "page":   chunk.get("page", 0),
                "text":   chunk["text"]
            })

        documents_ingested += 1

    with open(CHUNK_DIR / "chunks.json", "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2)

    return {
        "status":             "success",
        "documents_ingested": documents_ingested,
        "total_chunks":       len(all_chunks)
    }