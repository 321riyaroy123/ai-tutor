from __future__ import annotations

import math
from typing import Any, Optional

DEFAULT_PRIOR = 0.5
CONFIDENCE_TAU = 4.0

EVIDENCE_LIKELIHOODS = {
    "correct": {"known": 0.90, "unknown": 0.25},
    "partial": {"known": 0.65, "unknown": 0.45},
    "incorrect": {"known": 0.20, "unknown": 0.70},
    "uncertain": {"known": 0.30, "unknown": 0.60},
    "misconception": {"known": 0.10, "unknown": 0.65},
}


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))


def update_mastery(prior_mastery: float, evidence_type: str, evidence_strength: float = 1.0) -> float:
    if evidence_type not in EVIDENCE_LIKELIHOODS:
        raise ValueError(f"Unknown evidence type: {evidence_type}")
    prior = clamp(prior_mastery)
    strength = clamp(evidence_strength)
    likelihoods = EVIDENCE_LIKELIHOODS[evidence_type]
    p_known = strength * likelihoods["known"] + (1.0 - strength) * 0.5
    p_unknown = strength * likelihoods["unknown"] + (1.0 - strength) * 0.5
    numerator = p_known * prior
    denominator = numerator + p_unknown * (1.0 - prior)
    return prior if denominator == 0 else clamp(numerator / denominator)


def calculate_confidence(effective_evidence: float, tau: float = CONFIDENCE_TAU) -> float:
    if tau <= 0:
        raise ValueError("tau must be greater than zero")
    return clamp(1.0 - math.exp(-max(0.0, effective_evidence) / tau))


def update_misconception(current_confidence: float, detected: bool, evidence_strength: float = 1.0, decay_rate: float = 0.10) -> float:
    current = clamp(current_confidence)
    strength = clamp(evidence_strength)
    if detected:
        return clamp(current + (1.0 - current) * strength)
    return clamp(current * (1.0 - decay_rate * strength))


def apply_evidence(prior_mastery: float, evidence_type: str, evidence_strength: float = 1.0,
                   effective_evidence: float = 0.0, misconception_id: Optional[str] = None,
                   misconception_confidence: float = 0.0, misconception_detected: bool = False) -> dict[str, Any]:
    new_mastery = update_mastery(prior_mastery, evidence_type, evidence_strength)
    new_effective_evidence = max(0.0, effective_evidence) + clamp(evidence_strength)
    new_confidence = calculate_confidence(new_effective_evidence)
    new_misconception_confidence = None
    if misconception_id:
        new_misconception_confidence = update_misconception(
            misconception_confidence, misconception_detected, evidence_strength
        )
    return {
        "mastery": new_mastery,
        "confidence": new_confidence,
        "effective_evidence": new_effective_evidence,
        "misconception": ({
            "misconception_id": misconception_id,
            "confidence": new_misconception_confidence,
            "active": new_misconception_confidence >= 0.5,
        } if misconception_id else None),
    }
