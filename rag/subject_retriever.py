# rag/subject_retriever.py

import pickle
from pathlib import Path

import faiss
import numpy as np

from rag.gemini_embedder import embed_query

EMBEDDINGS_DIR = Path("embeddings")


class SubjectRetriever:
    def __init__(self, subject: str):
        self.subject = subject
        index_path = EMBEDDINGS_DIR / f"{subject}_index.faiss"
        chunks_path = EMBEDDINGS_DIR / f"{subject}_chunks.pkl"

        self.index = faiss.read_index(str(index_path))

        with open(chunks_path, "rb") as f:
            self.chunks = pickle.load(f)

    def retrieve(self, query: str, top_k: int = 5, final_k: int = 3):
        query_embedding = np.array(embed_query(query), dtype=np.float32).reshape(1, -1)

        norm = np.linalg.norm(query_embedding)
        if norm > 0:
            query_embedding = query_embedding / norm

        scores, indices = self.index.search(query_embedding, top_k)

        final_chunks = [
            self.chunks[idx]
            for idx in indices[0][:final_k]
            if 0 <= idx < len(self.chunks)
        ]

        if not final_chunks:
            return "", [], [], 0.0

        context = "\n".join(chunk["text"] for chunk in final_chunks)
        pages = list({chunk.get("page", 0) for chunk in final_chunks})
        sources = list({chunk.get("source", "unknown") for chunk in final_chunks})
        base_conf = float(scores[0][0]) if len(scores[0]) > 0 else 0.0

        return context, pages, sources, base_conf