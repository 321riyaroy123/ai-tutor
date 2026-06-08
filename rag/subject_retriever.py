# rag/subject_retriever.py

import pickle
from pathlib import Path

import faiss
import numpy as np

from rag.models import get_embedding_model

EMBEDDINGS_DIR = Path("embeddings")


class SubjectRetriever:
    def __init__(self, subject: str):
        self.subject = subject
        index_path = EMBEDDINGS_DIR / f"{subject}_index.faiss"
        chunks_path = EMBEDDINGS_DIR / f"{subject}_chunks.pkl"

        self.index = faiss.read_index(str(index_path))

        with open(chunks_path, "rb") as f:
            self.chunks = pickle.load(f)

    def retrieve(self, query: str, top_k: int = 8, final_k: int = 3):
        embedder = get_embedding_model()

        query_embedding = embedder.encode(
            [f"query: {query}"],
            convert_to_numpy=True,
        )

        norms = np.linalg.norm(query_embedding, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        query_embedding = query_embedding / norms

        # Step 1: broad FAISS retrieval
        scores, indices = self.index.search(query_embedding, top_k)
        candidate_chunks = [
            self.chunks[idx]
            for idx in indices[0]
            if 0 <= idx < len(self.chunks)
        ]

        if not candidate_chunks:
            return "", [], [], 0.0

        # Step 2: rerank the candidates — lazy loads CrossEncoder on first call
        try:
            from rag.reranker import rerank

            candidate_texts = [chunk["text"] for chunk in candidate_chunks]
            top_texts, top_scores = rerank(query, candidate_texts, top_n=final_k)

            # Step 3: recover full chunk dicts from the reranked texts
            text_to_chunk = {chunk["text"]: chunk for chunk in candidate_chunks}
            final_chunks = [text_to_chunk[t] for t in top_texts if t in text_to_chunk]
            base_conf = float(top_scores[0]) if top_scores else 0.0
        except Exception:
            # Reranker unavailable or OOM — fall back to FAISS ordering
            final_chunks = candidate_chunks[:final_k]
            base_conf = float(max(scores[0])) if len(scores[0]) > 0 else 0.0

        context = "\n".join(chunk["text"] for chunk in final_chunks)
        pages = list({chunk.get("page", 0) for chunk in final_chunks})
        sources = list({chunk.get("source", "unknown") for chunk in final_chunks})

        return context, pages, sources, base_conf