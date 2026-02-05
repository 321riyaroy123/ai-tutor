from sentence_transformers import SentenceTransformer
import chromadb
from pathlib import Path

# ---- Paths ----
BASE_DIR = Path(__file__).resolve().parents[1]
DB_DIR = BASE_DIR / "rag_db"

# ---- Models ----
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ---- Chroma Client ----
chroma_client = chromadb.PersistentClient(path=str(DB_DIR))
collection = chroma_client.get_collection(name="ai_tutor")


def retrieve(
    query: str,
    top_k: int = 5
) -> list[dict]:
    """
    Retrieve top-k relevant chunks for a query.

    Returns:
        [
            {
                "text": "...",
                "source": "Physics_Vol_1.pdf",
                "score": float
            }
        ]
    """

    # Encode query
    query_embedding = embedder.encode(query).tolist()

    # Query Chroma
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    retrieved_chunks = []

    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0]
    ):
        retrieved_chunks.append({
            "text": doc,
            "source": meta.get("source", "unknown"),
            "score": round(1 - dist, 4)  # similarity proxy
        })

    return retrieved_chunks
