from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.app.dependencies import get_current_user
from api.app.ontology.retriever import OntologyRetriever
from api.app.services.evidence_generator import (
    generate_evidence_with_gemini,
)
from api.app.services.knowledge_pipeline import (
    process_student_response,
)
from api.app.services.llm_evidence_extractor import (
    LLMEvidenceExtractor,
)
from api.app.utils.serialization import (
    serialize_mongo_document,
)


router = APIRouter(
    prefix="/knowledge",
    tags=["Knowledge"],
)


class EvaluateResponseRequest(BaseModel):
    subject: str
    concept_id: str
    student_response: str
    interaction_id: Optional[str] = None


@router.post("/evaluate")
async def evaluate_student_response(
    req: EvaluateResponseRequest,
    current_user: str = Depends(get_current_user),
):
    subject = req.subject.strip().lower()
    concept_id = req.concept_id.strip()
    student_response = req.student_response.strip()

    if not student_response:
        raise HTTPException(
            status_code=400,
            detail="Student response is required",
        )

    if subject != "physics":
        raise HTTPException(
            status_code=400,
            detail=(
                "Knowledge evaluation is currently "
                "available only for physics"
            ),
        )

    ontology_retriever = OntologyRetriever()

    try:
        ontology_retriever.get_concept_context(
            concept_id,
            include_prerequisites=False,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    evidence_extractor = LLMEvidenceExtractor(
        generator=generate_evidence_with_gemini,
    )

    result = await process_student_response(
        user_email=current_user,
        subject=subject,
        student_response=student_response,
        concept_id=concept_id,
        evidence_extractor=evidence_extractor,
        ontology_retriever=ontology_retriever,
        interaction_id=req.interaction_id,
    )

    return serialize_mongo_document(result)