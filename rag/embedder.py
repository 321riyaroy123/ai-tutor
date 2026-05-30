import os
import pickle
from pathlib import Path

import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

from rag.chunker import chunk_text

EMBEDDINGS_DIR = Path("embeddings")


def build_faiss_index(text_paths):
    """
    Builds ONE unified FAISS index from multiple textbooks.
    """

    EMBEDDINGS_DIR.mkdir(exist_ok=True)

    if isinstance(text_paths, str):
        text_paths = [text_paths]

    all_chunks = []

    for path in text_paths:
        print(f"Processing: {path}")

        with open(path, "r", encoding="utf-8") as f:
            text = f.read()

        clean_math = "math" in path.lower()
        chunks = chunk_text(text, clean_math=clean_math)

        for chunk in chunks:
            chunk["source"] = os.path.basename(path)

        all_chunks.extend(chunks)

    print(f"Total combined chunks: {len(all_chunks)}")

    embedder = SentenceTransformer("models/bge-base-en-v1.5")
    texts = [f"passage: {chunk['text']}" for chunk in all_chunks]
    embeddings = embedder.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=True,
    )

    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    embeddings = (embeddings / norms).astype(np.float32)

    index = faiss.IndexFlatIP(int(embeddings.shape[1]))
    index.add(embeddings)

    faiss.write_index(index, str(EMBEDDINGS_DIR / "faiss_index.bin"))

    with open(EMBEDDINGS_DIR / "chunks.pkl", "wb") as f:
        pickle.dump(all_chunks, f)

    print("Unified FAISS index built successfully")
