import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from rag.reranker import rerank

MODEL_PATH = "models/bge-base-en-v1.5"

class SubjectRetriever:

    def __init__(self, subject):
        self.subject = subject

        self.index = faiss.read_index(f"api/rag/{subject}_index.faiss")

        with open(f"api/rag/{subject}_chunks.pkl", "rb") as f:
            self.chunks = pickle.load(f)

        self.embedder = SentenceTransformer(MODEL_PATH)

    def retrieve(self, query, top_k=8, final_k=3):

        # -----------------------------
        # Embed Query
        # -----------------------------
        query_embedding = self.embedder.encode(
            [f"query: {query}"],
            convert_to_numpy=True
        )

        query_embedding = query_embedding / np.linalg.norm(
            query_embedding, axis=1, keepdims=True
        )

        # -----------------------------
        # FAISS Search
        # -----------------------------
        scores, indices = self.index.search(query_embedding, top_k)

        candidate_chunks = []
        for idx in indices[0]:
            candidate_chunks.append(self.chunks[idx])

        # -----------------------------
        # Rerank
        # -----------------------------
        rerank_texts = [c["text"] for c in candidate_chunks]
        top_texts, _ = rerank(query, rerank_texts, final_k)

        final_chunks = []
        for text in top_texts:
            for c in candidate_chunks:
                if c["text"] == text:
                    final_chunks.append(c)
                    break

        # -----------------------------
        # Build Return Values
        # -----------------------------
        context = "\n".join([c["text"] for c in final_chunks])

        pages = list({c.get("page", 0) for c in final_chunks})

        sources = list({c.get("source", "unknown") for c in final_chunks})

        base_conf = float(max(scores[0])) if len(scores[0]) > 0 else 0.0

        return context, pages, sources, base_conf