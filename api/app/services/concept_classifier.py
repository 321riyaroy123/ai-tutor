from __future__ import annotations

import re
from dataclasses import dataclass

from api.app.ontology.retriever import OntologyRetriever


@dataclass
class ConceptClassification:
    concept_id: str | None
    confidence: float


class ConceptClassifier:
    """
    Deterministic classifier for mapping student text
    to a concept in the subject ontology.
    """

    def __init__(
        self,
        ontology_retriever: OntologyRetriever,
        minimum_confidence: float = 0.05,
    ):
        self.ontology_retriever = ontology_retriever
        self.minimum_confidence = minimum_confidence

    def classify(
        self,
        text: str,
    ) -> ConceptClassification:

        normalized_text = self._normalize(text)

        if not normalized_text:
            return ConceptClassification(
                concept_id=None,
                confidence=0.0,
            )

        text_tokens = set(normalized_text.split())

        best_concept_id = None
        best_score = 0.0

        for concept in self.ontology_retriever.ontology.concepts:
            score = self._score_concept(
                text_tokens=text_tokens,
                concept_name=concept.name,
                concept_description=concept.description,
            )

            if score > best_score:
                best_score = score
                best_concept_id = concept.concept_id

        if best_score < self.minimum_confidence:
            return ConceptClassification(
                concept_id=None,
                confidence=best_score,
            )

        return ConceptClassification(
            concept_id=best_concept_id,
            confidence=best_score,
        )

    def _score_concept(
        self,
        text_tokens: set[str],
        concept_name: str,
        concept_description: str,
    ) -> float:

        concept_text = (
            f"{concept_name} {concept_description}"
        )

        concept_tokens = set(
            self._normalize(concept_text).split()
        )

        if not concept_tokens:
            return 0.0

        overlap = text_tokens.intersection(
            concept_tokens
        )

        return len(overlap) / len(concept_tokens)

    @staticmethod
    def _normalize(text: str) -> str:
        text = text.lower()

        text = re.sub(
            r"[^a-z0-9\s]",
            " ",
            text,
        )

        text = re.sub(
            r"\s+",
            " ",
            text,
        )

        return text.strip()