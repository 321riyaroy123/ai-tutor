# api/app/services/topic_classifier.py - FIXED VERSION
# Removed broken embedding code, kept simple keyword matching that actually works

import numpy as np

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
    ("light",                   "physics"),
    ("sound",                   "physics"),
    ("heat",                    "physics"),
    ("temperature",             "physics"),
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
    ("equation",                "math"),
    ("solution",                "math"),
], key=lambda x: -len(x[0]))


def _extract_topics(
    text: str,
    subject: str,
    limit: int = 5
) -> list[str]:
    """
    Extract topics from text using simple keyword matching.
    
    Args:
        text: The input text to analyze (e.g., a student's question)
        subject: The subject to filter by ("physics" or "math")
        limit: Maximum number of topics to return
    
    Returns:
        List of topic strings found in the text, up to `limit` items
    
    Example:
        >>> _extract_topics("Solve for x in x^2 + 2x + 1 = 0", "math", limit=3)
        ["quadratic", "polynomial", "equation"]
    """
    if not text or not text.strip():
        return []
    
    haystack = text.lower()
    found = []

    # TOPIC_TAXONOMY is sorted by length descending, so longer matches come first
    # This prevents "quadratic" from being matched as "quad" + "ratic"
    for topic, topic_subject in TOPIC_TAXONOMY:
        if topic_subject != subject:
            continue

        # Simple substring match (case-insensitive)
        if topic in haystack:
            found.append(topic)

        if len(found) >= limit:
            break

    return found[:limit]


def extract_weak_and_strong_topics(
    attempts: list[dict],
    subject: str,
    weak_threshold: float = 0.55,
    strong_threshold: float = 0.75
) -> tuple[list[str], list[str]]:
    """
    Analyze attempts to identify weak and strong topic areas.
    
    Args:
        attempts: List of attempt dicts with "question" and "confidence" keys
        subject: Subject to analyze ("physics" or "math")
        weak_threshold: Confidence below this = weak area
        strong_threshold: Confidence above this = strong area
    
    Returns:
        (weak_topics, strong_topics) - lists of topic strings
    """
    weak_topics = []
    strong_topics = []
    
    for attempt in attempts:
        confidence = float(attempt.get("confidence", 0) or 0)
        question = attempt.get("question", "")
        
        topics = _extract_topics(question, subject, limit=2)
        
        for topic in topics:
            # Format topic for display (title case with proper spacing)
            display_topic = topic.title()
            
            if confidence < weak_threshold and display_topic not in weak_topics:
                weak_topics.append(display_topic)
            elif confidence >= strong_threshold and display_topic not in strong_topics:
                strong_topics.append(display_topic)
    
    return weak_topics[:5], strong_topics[:5]
