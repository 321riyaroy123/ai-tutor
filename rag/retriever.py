import faiss
import pickle
import numpy as np
from rag.reranker import rerank
from sentence_transformers import SentenceTransformer

index = faiss.read_index("embeddings/faiss_index.bin")

with open("embeddings/chunks.pkl", "rb") as f:
    chunks = pickle.load(f)

embedder = SentenceTransformer("models/bge-base-en-v1.5")

def retrieve_context(query, top_k=8, final_k=3, score_threshold=0.35):
    query_embedding = embedder.encode(
        [f"query: {query}"],
        convert_to_numpy=True
    )

    query_embedding = query_embedding / np.linalg.norm(
        query_embedding, axis=1, keepdims=True
    )

    scores, indices = index.search(query_embedding, top_k)

    faiss_scores = scores[0]

    candidate_chunks = []
    candidate_scores = []

    for score, idx in zip(faiss_scores, indices[0]):
        if score >= score_threshold:
            candidate_chunks.append(chunks[idx])
            candidate_scores.append(score)

    if not candidate_chunks:
        return "", [], scores[0]

    # Rerank using text only
    rerank_texts = [c["text"] for c in candidate_chunks]
    top_texts, rerank_scores = rerank(
        query,
        rerank_texts,
        final_k
    )


    for score, idx in zip(faiss_scores, indices[0]):
        candidate_chunks.append(chunks[idx])
        candidate_scores.append(score)

    # Rerank using text only
    rerank_texts = [c["text"] for c in candidate_chunks]
    top_texts, rerank_scores = rerank(query, rerank_texts, final_k)

    # Map back
    final_chunks = []
    for text in top_texts:
        for c in candidate_chunks:
            if c["text"] == text:
                final_chunks.append(c)
                break

    context = "\n".join([c["text"] for c in final_chunks])
    pages = list(set([c.get("page", 0) for c in final_chunks]))
    sources = list(set([c.get("source", "unknown") for c in final_chunks]))

    # Use FAISS similarity as confidence base
    base_confidence = float(max(faiss_scores)) if len(faiss_scores) > 0 else 0.0

    return context, pages, sources, base_confidence

