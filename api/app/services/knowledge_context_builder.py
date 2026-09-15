from typing import Any

from api.app.services.adaptive_tutoring_policy import (
    build_adaptive_tutoring_policy,
)


def build_student_knowledge_context(
    knowledge_state: dict[str, Any] | None,
    concept_id: str,
) -> str:
    """
    Build a compact pedagogical summary of the student's current
    knowledge for a specific concept.

    This context is intended for the tutor LLM, not for persistence.
    """

    if not knowledge_state:
        return (
            "STUDENT KNOWLEDGE STATE:\n"
            "No previous knowledge data is available for this concept.\n"
            "Treat the student's current understanding as unknown."
        )

    concepts = knowledge_state.get("concepts", [])

    concept_state = next(
        (
            concept
            for concept in concepts
            if concept.get("concept_id") == concept_id
        ),
        None,
    )

    if concept_state is None:
        return (
            "STUDENT KNOWLEDGE STATE:\n"
            f"No previous knowledge data is available for "
            f"concept '{concept_id}'.\n"
            "Treat the student's current understanding as unknown."
        )

    mastery = float(concept_state.get("mastery", 0.0))
    confidence = float(concept_state.get("confidence", 0.0))
    misconceptions = concept_state.get("misconceptions", [])
    evidence_count = int(concept_state.get("evidence_count", 0))

    policy = build_adaptive_tutoring_policy(
        mastery=mastery,
        confidence=confidence,
        misconceptions=misconceptions,
    )

    lines = [
        "STUDENT KNOWLEDGE STATE:",
        f"Concept ID: {concept_id}",
        f"Estimated mastery: {mastery:.2f}",
        f"Assessment confidence: {confidence:.2f}",
        f"Evidence observations: {evidence_count}",
        "",
        "ADAPTIVE TUTORING POLICY:",
        f"Difficulty: {policy.difficulty}",
        f"Explanation depth: {policy.explanation_depth}",
        f"Content strategy: {policy.content_strategy}",
        f"Guidance strategy: {policy.guidance_strategy}",
    ]

    if misconceptions:
        lines.append("")
        lines.append("Active misconceptions:")

        for misconception in misconceptions:
            if isinstance(misconception, dict):
                misconception_id = misconception.get(
                    "misconception_id",
                    "unknown",
                )
                lines.append(f"- {misconception_id}")
            else:
                lines.append(f"- {misconception}")
    else:
        lines.extend(
            [
                "",
                "Active misconceptions: none currently identified.",
            ]
        )

    return "\n".join(lines)