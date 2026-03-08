from functools import lru_cache
from rag.models import get_embedding_model

@lru_cache(maxsize=2048)
def embed_text(text: str):
    model = get_embedding_model()
    return model.encode(text, normalize_embeddings=True)