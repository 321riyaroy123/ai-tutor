from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator


EVIDENCE_TYPES = {
    "correct",
    "partial",
    "incorrect",
    "uncertain",
    "misconception",
}


class Evidence(BaseModel):
    """
    Structured observation extracted from a student's response.
    """

    concept_id: str = Field(
        ...,
        min_length=1,
    )

    evidence_type: str

    evidence_strength: float = Field(
        ...,
        ge=0.0,
        le=1.0,
    )

    misconception_id: Optional[str] = None

    reasoning: str = Field(
        ...,
        min_length=1,
    )

    source: str = "llm"

    @field_validator("evidence_type")
    @classmethod
    def validate_evidence_type(cls, value: str) -> str:
        if value not in EVIDENCE_TYPES:
            raise ValueError(
                f"Invalid evidence type: {value}"
            )

        return value


class EvidenceExtractionResult(BaseModel):
    """
    Collection of evidence extracted from one student interaction.
    """

    evidence: list[Evidence] = Field(
        default_factory=list,
    )