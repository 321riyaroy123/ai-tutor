import faiss
import os
import pickle
import numpy as np
from sentence_transformers import SentenceTransformer
from rag.chunker import chunk_text


def build_faiss_index(text_paths):
    """
    Builds ONE unified FAISS index from multiple textbooks.
    """

    os.makedirs("embeddings", exist_ok=True)

    if isinstance(text_paths, str):
        text_paths = [text_paths]

    all_chunks = []

    for path in text_paths:
        print(f"Processing: {path}")

        with open(path, "r", encoding="utf-8") as f:
            text = f.read()

        clean_math = "math" in path.lower()

        chunks = chunk_text(text, clean_math=clean_math)

        for c in chunks:
            c["source"] = os.path.basename(path)

        all_chunks.extend(chunks)

    print(f"Total combined chunks: {len(all_chunks)}")

    embedder = SentenceTransformer("models/bge-base-en-v1.5")

    texts = [f"passage: {c['text']}" for c in all_chunks]

    embeddings = embedder.encode(
        texts,
        convert_to_numpy=True,
        show_progress_bar=True
    )

    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    embeddings = embeddings / norms
    embeddings = embeddings.astype(np.float32)

    index = faiss.IndexFlatIP(int(embeddings.shape[1]))
    index.add(embeddings)

    faiss.write_index(index, "embeddings/faiss_index.bin")

    with open("embeddings/chunks.pkl", "wb") as f:
        pickle.dump(all_chunks, f)

    print("✅ Unified FAISS index built successfully")
