from dataclasses import dataclass


@dataclass(frozen=True)
class AdaptiveTutoringPolicy:
    difficulty: str
    explanation_depth: str
    content_strategy: str
    guidance_strategy: str


def build_adaptive_tutoring_policy(
    mastery: float,
    confidence: float,
    misconceptions: list,
) -> AdaptiveTutoringPolicy:

    if misconceptions:
        return AdaptiveTutoringPolicy(
            difficulty="remedial",
            explanation_depth="deep",
            content_strategy="misconception_remediation",
            guidance_strategy="directly address the misconception",
        )

    if confidence < 0.30:
        return AdaptiveTutoringPolicy(
            difficulty="diagnostic",
            explanation_depth="moderate",
            content_strategy="diagnostic_examples",
            guidance_strategy="assess understanding before increasing difficulty",
        )

    if mastery < 0.30:
        return AdaptiveTutoringPolicy(
            difficulty="foundational",
            explanation_depth="deep",
            content_strategy="foundational_concepts",
            guidance_strategy="build from prerequisites and intuition",
        )

    if mastery < 0.55:
        return AdaptiveTutoringPolicy(
            difficulty="basic",
            explanation_depth="moderate",
            content_strategy="direct_application",
            guidance_strategy="clarify gaps with guided practice",
        )

    if mastery < 0.75:
        return AdaptiveTutoringPolicy(
            difficulty="intermediate",
            explanation_depth="moderate",
            content_strategy="multi_step_reasoning",
            guidance_strategy="encourage independent reasoning",
        )

    return AdaptiveTutoringPolicy(
        difficulty="advanced",
        explanation_depth="concise",
        content_strategy="transfer_and_edge_cases",
        guidance_strategy="challenge the student's reasoning",
    )