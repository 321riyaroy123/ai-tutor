from typing import Any


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

    lines = [
        "STUDENT KNOWLEDGE STATE:",
        f"Concept ID: {concept_id}",
        f"Estimated mastery: {mastery:.2f}",
        f"Assessment confidence: {confidence:.2f}",
        f"Evidence observations: {evidence_count}",
    ]

    if misconceptions:
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
        lines.append(
            "Active misconceptions: none currently identified."
        )

    lines.extend(
        [
            "",
            "TUTORING GUIDANCE:",
            _build_tutoring_guidance(
                mastery=mastery,
                confidence=confidence,
                misconceptions=misconceptions,
            ),
        ]
    )

    return "\n".join(lines)


def _build_tutoring_guidance(
    mastery: float,
    confidence: float,
    misconceptions: list,
) -> str:
    """
    Convert knowledge estimates into teaching guidance.
    """

    if misconceptions:
        return (
            "Actively address the identified misconception(s). "
            "Do not simply provide the correct answer. Help the "
            "student compare their understanding with the correct "
            "concept and explain why the misconception fails."
        )

    if confidence < 0.30:
        return (
            "There is limited evidence about the student's understanding. "
            "Do not assume either mastery or lack of knowledge. "
            "Use the student's response and conversation to assess "
            "their current level."
        )

    if mastery < 0.35:
        return (
            "The student appears to have limited understanding. "
            "Start from foundational intuition, explain prerequisites "
            "when necessary, and use simple examples."
        )

    if mastery < 0.70:
        return (
            "The student appears to have partial understanding. "
            "Build on what they likely know, clarify gaps, and use "
            "conceptual questions to strengthen understanding."
        )

    return (
        "The student appears to have strong understanding. "
        "Avoid unnecessarily repeating basic definitions. "
        "Use deeper reasoning, applications, edge cases, or "
        "challenging conceptual questions."
    )