import pickle
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from rag.chunker import chunk_text

MODEL_PATH = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDINGS_DIR = Path("embeddings")


def build_subject_index(text_path: str, subject: str):
    """
    Builds a FAISS index for a specific subject.
    Saves:
        embeddings/{subject}_index.faiss
        embeddings/{subject}_chunks.pkl
    """

    print(f"Building index for {subject}...")

    with open(text_path, "r", encoding="utf-8") as f:
        text = f.read()

    clean_math = subject.lower() == "math"
    chunks = chunk_text(text, clean_math=clean_math)

    print(f"Total chunks for {subject}: {len(chunks)}")

    embedder = SentenceTransformer(MODEL_PATH)
    texts = [f"passage: {chunk['text']}" for chunk in chunks]
    embeddings = embedder.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=True,
    )

    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    embeddings = (embeddings / norms).astype(np.float32)

    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    EMBEDDINGS_DIR.mkdir(exist_ok=True)
    faiss.write_index(index, str(EMBEDDINGS_DIR / f"{subject}_index.faiss"))

    with open(EMBEDDINGS_DIR / f"{subject}_chunks.pkl", "wb") as f:
        pickle.dump(chunks, f)

    print(f"{subject} index built successfully")
