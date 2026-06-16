import pickle
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_PATH = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDINGS_DIR = Path("embeddings")
EMBEDDER = SentenceTransformer(MODEL_PATH)


class SubjectRetriever:
    def __init__(self, subject: str):
        self.subject = subject
        index_path = EMBEDDINGS_DIR / f"{subject}_index.faiss"
        chunks_path = EMBEDDINGS_DIR / f"{subject}_chunks.pkl"

        self.index = faiss.read_index(str(index_path))

        with open(chunks_path, "rb") as f:
            self.chunks = pickle.load(f)

    def retrieve(self, query: str, top_k: int = 8, final_k: int = 3):
        query_embedding = EMBEDDER.encode(
            [f"query: {query}"],
            convert_to_numpy=True,
        )

        norms = np.linalg.norm(query_embedding, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        query_embedding = query_embedding / norms

        scores, indices = self.index.search(query_embedding, top_k)

        final_chunks = [
            self.chunks[idx]
            for idx in indices[0][:final_k]
            if 0 <= idx < len(self.chunks)
        ]

        if not final_chunks:
            return "", [], [], 0.0

        rerank_texts = [chunk["text"] for chunk in candidate_chunks]
        top_texts = rerank_texts[:final_k]

        final_chunks = []
        for text in top_texts:
            for chunk in candidate_chunks:
                if chunk["text"] == text:
                    final_chunks.append(chunk)
                    break

        context = "\n".join(chunk["text"] for chunk in final_chunks)
        pages = list({chunk.get("page", 0) for chunk in final_chunks})
        sources = list({chunk.get("source", "unknown") for chunk in final_chunks})
        base_conf = float(max(scores[0])) if len(scores[0]) > 0 else 0.0

        return context, pages, sources, base_conf
