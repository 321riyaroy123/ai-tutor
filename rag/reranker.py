from sentence_transformers import CrossEncoder

# Load once at startup
reranker_model = CrossEncoder(
    "cross-encoder/ms-marco-MiniLM-L-6-v2"
)

def rerank(query, candidate_chunks, top_n=3):
    pairs = [(query, chunk) for chunk in candidate_chunks]

    scores = reranker_model.predict(pairs)

    # Sort by score descending
    ranked = sorted(
        zip(candidate_chunks, scores),
        key=lambda x: x[1],
        reverse=True
    )

    top_chunks = [chunk for chunk, _ in ranked[:top_n]]
    top_scores = [score for _, score in ranked[:top_n]]

    return top_chunks, top_scores
