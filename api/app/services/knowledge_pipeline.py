from __future__ import annotations

from typing import Any, Optional

from api.app.services.evidence_extractor import EvidenceExtractionResult
from api.app.services.knowledge_state_service import (
    process_extracted_evidence,
)


async def process_student_response(
    user_email: str,
    subject: str,
    student_response: str,
    concept_context: str,
    ontology_context: str,
    evidence_extractor,
    interaction_id: Optional[str] = None,
) -> dict[str, Any]:
    """
    End-to-end knowledge-state pipeline.

    1. Extract evidence from the student's response.
    2. Validate the extracted evidence.
    3. Apply deterministic knowledge-state inference.
    4. Persist the resulting state.
    """

    extraction: EvidenceExtractionResult = (
        evidence_extractor.extract(
            student_response=student_response,
            concept_context=concept_context,
            ontology_context=ontology_context,
        )
    )

    results = []

    for evidence in extraction.evidence:
        result = await process_extracted_evidence(
            user_email=user_email,
            subject=subject,
            evidence=evidence,
            interaction_id=interaction_id,
        )

        results.append(result)

    return {
        "student_response": student_response,
        "evidence": extraction.evidence,
        "results": results,
    }