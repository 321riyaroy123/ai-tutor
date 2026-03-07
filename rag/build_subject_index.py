import os
import faiss
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from rag.chunker import chunk_text


MODEL_PATH = "models/bge-base-en-v1.5"


def build_subject_index(text_path: str, subject: str):
    """
    Builds a FAISS index for a specific subject.
    Saves:
        rag/{subject}_index.faiss
        rag/{subject}_chunks.pkl
    """

    print(f"Building index for {subject}...")

    with open(text_path, "r", encoding="utf-8") as f:
        text = f.read()

    clean_math = subject.lower() == "math"

    chunks = chunk_text(text, clean_math=clean_math)

    print(f"Total chunks for {subject}: {len(chunks)}")

    embedder = SentenceTransformer(MODEL_PATH)

    texts = [f"passage: {c['text']}" for c in chunks]

    embeddings = embedder.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=True
    )

    # Normalize for cosine similarity
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    embeddings = embeddings / norms
    embeddings = embeddings.astype(np.float32)

    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    os.makedirs("embeddings", exist_ok=True)

    faiss.write_index(index, f"embeddings/{subject}_index.faiss")

    with open(f"embeddings/{subject}_chunks.pkl", "wb") as f:
        pickle.dump(chunks, f)

    print(f"✅ {subject} index built successfully")
