# rag/build_subject_index.py  — updated to use Gemini embeddings

import pickle
from pathlib import Path

import faiss
import numpy as np

# Ensure repo root is on sys.path so absolute imports like `rag.chunker` work
import os
import sys

_repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _repo_root not in sys.path:
    sys.path.insert(0, _repo_root)

# Try package-relative import first, then absolute
try:
    from .chunker import chunk_text
except Exception:
    from rag.chunker import chunk_text
from sentence_transformers import SentenceTransformer

MODEL_PATH = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDER = SentenceTransformer(MODEL_PATH)
EMBEDDINGS_DIR = Path("embeddings")

def build_subject_index(text_path: str, subject: str):
    print(f"Building index for {subject}...")

    with open(text_path, "r", encoding="utf-8") as f:
        text = f.read()

    clean_math = subject.lower() == "math"
    chunks = chunk_text(text, clean_math=clean_math)
    print(f"Total chunks: {len(chunks)}")

    embeddings = []
    for i, chunk in enumerate(chunks):
        emb = EMBEDDER.encode(
            [f"passage: {chunk['text']}"],
            convert_to_numpy=True,
        )[0]
        embeddings.append(emb)
        if i % 50 == 0:
            print(f"  Embedded {i}/{len(chunks)}")

    embeddings = np.array(embeddings, dtype=np.float32)

    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    embeddings = embeddings / norms

    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    EMBEDDINGS_DIR.mkdir(exist_ok=True)
    faiss.write_index(index, str(EMBEDDINGS_DIR / f"{subject}_index.faiss"))

    with open(EMBEDDINGS_DIR / f"{subject}_chunks.pkl", "wb") as f:
        pickle.dump(chunks, f)

    print(f"{subject} index built successfully")


build_subject_index("data/math_book.txt", "math")
build_subject_index("data/physics.txt", "physics")
