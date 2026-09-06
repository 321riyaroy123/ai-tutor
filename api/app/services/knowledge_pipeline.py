from __future__ import annotations
from typing import Any, Optional

from api.app.ontology.retriever import OntologyRetriever
from api.app.services.evidence_extractor import EvidenceExtractionResult
from api.app.services.knowledge_state_service import (
    process_extracted_evidence,
)

async def process_student_response(
    user_email: str,
    subject: str,
    student_response: str,
    concept_id: str,
    evidence_extractor,
    ontology_retriever: Optional[OntologyRetriever] = None,
    interaction_id: Optional[str] = None,
) -> dict[str, Any]:
    """
    End-to-end knowledge-state pipeline.

    1. Validate the target concept against the ontology.
    2. Build concept and ontology context.
    3. Extract evidence from the student's response.
    4. Validate the extracted evidence.
    5. Apply deterministic knowledge-state inference.
    6. Persist the resulting state.
    """

    if ontology_retriever is None:
        ontology_retriever = OntologyRetriever()

    concept = ontology_retriever.get_concept(concept_id)

    if concept is None:
        raise ValueError(
            f"Unknown concept ID: {concept_id}"
        )

    concept_context = ontology_retriever.get_concept_context(
        concept_id=concept_id,
        include_prerequisites=False,
    )

    ontology_context = ontology_retriever.get_concept_context(
        concept_id=concept_id,
        include_prerequisites=True,
    )

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
        "concept_id": concept_id,
        "student_response": student_response,
        "evidence": extraction.evidence,
        "results": results,
    }