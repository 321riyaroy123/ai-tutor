# rag/reranker.py

_reranker_model = None


def _get_reranker():
    global _reranker_model
    if _reranker_model is None:
        from sentence_transformers import CrossEncoder
        print("Loading reranker model...")
        _reranker_model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
        print("Reranker loaded.")
    return _reranker_model


def rerank(query: str, candidate_chunks: list[str], top_n: int = 3):
    model = _get_reranker()
    pairs = [(query, chunk) for chunk in candidate_chunks]
    scores = model.predict(pairs)

    ranked = sorted(
        zip(candidate_chunks, scores),
        key=lambda x: x[1],
        reverse=True,
    )

    top_chunks = [chunk for chunk, _ in ranked[:top_n]]
    top_scores = [score for _, score in ranked[:top_n]]

    return top_chunks, top_scores