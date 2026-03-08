from rag.models import get_embedding_model
import numpy as np
from rag.embedding_cache import embed_text

model = None

def get_model():
    global model
    if model is None:
        model = get_embedding_model()
    return model

TOPIC_TAXONOMY: list[tuple[str, str]] = sorted([
    # Physics
    ("projectile motion",       "physics"),
    ("simple harmonic motion",  "physics"),
    ("electric field",          "physics"),
    ("magnetic field",          "physics"),
    ("electromagnetic induction","physics"),
    ("gravitational potential", "physics"),
    ("nuclear fission",         "physics"),
    ("nuclear fusion",          "physics"),
    ("radioactive decay",       "physics"),
    ("wave optics",             "physics"),
    ("ray optics",              "physics"),
    ("thermodynamics",          "physics"),
    ("electromagnetism",        "physics"),
    ("electrostatics",          "physics"),
    ("kinematics",              "physics"),
    ("dynamics",                "physics"),
    ("gravitation",             "physics"),
    ("momentum",                "physics"),
    ("friction",                "physics"),
    ("oscillation",             "physics"),
    ("resonance",               "physics"),
    ("refraction",              "physics"),
    ("diffraction",             "physics"),
    ("interference",            "physics"),
    ("capacitor",               "physics"),
    ("resistance",              "physics"),
    ("current",                 "physics"),
    ("voltage",                 "physics"),
    ("induction",               "physics"),
    ("entropy",                 "physics"),
    ("torque",                  "physics"),
    ("pressure",                "physics"),
    ("quantum",                 "physics"),
    ("relativity",              "physics"),
    ("photon",                  "physics"),
    ("electron",                "physics"),
    ("nucleus",                 "physics"),
    ("circuits",                "physics"),
    ("rotation",                "physics"),
    ("waves",                   "physics"),
    ("optics",                  "physics"),
    ("energy",                  "physics"),
    ("force",                   "physics"),
    ("work",                    "physics"),
    ("power",                   "physics"),
    ("velocity",                "physics"),
    ("acceleration",            "physics"),
    # Math
    ("differential equation",   "math"),
    ("linear algebra",          "math"),
    ("number theory",           "math"),
    ("set theory",              "math"),
    ("complex numbers",         "math"),
    ("quadratic formula",       "math"),
    ("binomial theorem",        "math"),
    ("pythagorean theorem",     "math"),
    ("trigonometric identities","math"),
    ("integration by parts",    "math"),
    ("chain rule",              "math"),
    ("product rule",            "math"),
    ("quotient rule",           "math"),
    ("taylor series",           "math"),
    ("fourier series",          "math"),
    ("matrix multiplication",   "math"),
    ("eigenvalue",              "math"),
    ("determinant",             "math"),
    ("probability",             "math"),
    ("statistics",              "math"),
    ("combinatorics",           "math"),
    ("permutation",             "math"),
    ("trigonometry",            "math"),
    ("integration",             "math"),
    ("differentiation",         "math"),
    ("derivative",              "math"),
    ("integral",                "math"),
    ("calculus",                "math"),
    ("algebra",                 "math"),
    ("geometry",                "math"),
    ("polynomial",              "math"),
    ("quadratic",               "math"),
    ("logarithm",               "math"),
    ("exponential",             "math"),
    ("fraction",                "math"),
    ("inequality",              "math"),
    ("sequence",                "math"),
    ("series",                  "math"),
    ("vectors",                 "math"),
    ("matrices",                "math"),
    ("limits",                  "math"),
    ("parabola",                "math"),
    ("hyperbola",               "math"),
    ("ellipse",                 "math"),
    ("triangle",                "math"),
    ("circle",                  "math"),
], key=lambda x: -len(x[0]))

# ---------------------------------
# Topic Embedding Cache
# ---------------------------------
_TOPIC_EMBED_CACHE: dict[str, dict[str, np.ndarray]] = {"physics": {}, "math": {}}

def _initialize_topic_embeddings():

    model = get_model()

    for topic, subject in TOPIC_TAXONOMY:

        if topic not in _TOPIC_EMBED_CACHE[subject]:

            emb: np.ndarray = np.asarray(
                model.encode(
                    topic,
                    normalize_embeddings=True
                )
            )

            _TOPIC_EMBED_CACHE[subject][topic] = emb

def _extract_topics(
    text: str,
    subject: str,
    limit: int = 5
) -> list[str]:
    """Match text against taxonomy using keyword + semantic fallback."""

    haystack = (text or "").lower()
    found: list[str] = []

    # ---- Exact keyword match first (existing behavior preserved)
    for topic, topic_subject in TOPIC_TAXONOMY:
        if topic_subject != subject:
            continue

        if topic in haystack and topic not in found:
            found.append(topic)

        if len(found) >= limit:
            return found

    # ---- Semantic fallback only if nothing found
    if not found:
        semantic_matches = _semantic_topic_match(
            text=text,
            subject=subject,
            limit=limit
        )

        for t in semantic_matches:
            if t not in found:
                found.append(t)

    return found[:limit]

def _semantic_topic_match(
    text: str,
    subject: str,
    limit: int = 3,
    threshold: float = 0.55
) -> list[str]:

    topic_embedding_model = get_model()
    if topic_embedding_model is None:
        return []
        
    if not _TOPIC_EMBED_CACHE[subject]:
        _initialize_topic_embeddings()
    
    if not text.strip():
        return []

    if subject not in _TOPIC_EMBED_CACHE:
        return []

    try:
        query_emb = embed_text(text)

        scored: list[tuple[str, float]] = []

        for topic, topic_emb in _TOPIC_EMBED_CACHE[subject].items():
            score = float(np.dot(query_emb, topic_emb))
            if score >= threshold:
                scored.append((topic, score))

        scored.sort(key=lambda x: -x[1])

        return [topic for topic, _ in scored[:limit]]

    except Exception:
        return []
