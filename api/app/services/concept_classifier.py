from __future__ import annotations

import re
from dataclasses import dataclass

from api.app.ontology.retriever import OntologyRetriever

@dataclass
class ConceptClassification:
    concept_id: str | None
    confidence: float
    alternatives: list[tuple[str, float]]


class ConceptClassifier:
    """
    Deterministic ontology-based classifier for mapping
    student text to a concept in the subject ontology.
    """

    def __init__(
        self,
        ontology_retriever: OntologyRetriever,
        minimum_confidence: float = 0.20,
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
                alternatives=[],
            )

        candidate_scores: list[tuple[str, float]] = []

        for concept in self.ontology_retriever.ontology.concepts:
            score = self._score_concept(
                text=normalized_text,
                concept_name=concept.name,
                concept_description=concept.description,
            )

            if score > 0.0:
                candidate_scores.append(
                    (concept.concept_id, score)
                )

        if not candidate_scores:
            return ConceptClassification(
                concept_id=None,
                confidence=0.0,
                alternatives=[],
            )

        candidate_scores.sort(
            key=lambda item: item[1],
            reverse=True,
        )

        best_concept_id, best_score = candidate_scores[0]

        alternatives = candidate_scores[1:4]

        # --------------------------------------------------
        # Minimum confidence
        # --------------------------------------------------

        if best_score < self.minimum_confidence:
            return ConceptClassification(
                concept_id=None,
                confidence=best_score,
                alternatives=alternatives,
            )

        # --------------------------------------------------
        # Ambiguity detection
        # --------------------------------------------------

        if len(candidate_scores) > 1:
            second_score = candidate_scores[1][1]
            margin = best_score - second_score

            if margin < 0.20:
                return ConceptClassification(
                    concept_id=None,
                    confidence=margin,
                    alternatives=candidate_scores[:4],
                )

        return ConceptClassification(
            concept_id=best_concept_id,
            confidence=best_score,
            alternatives=alternatives,
        )
    
    @staticmethod
    def _contains_phrase(
        text: str,
        phrase: str,
    ) -> bool:

        text_tokens = text.split()
        phrase_tokens = phrase.split()

        if not phrase_tokens:
            return False

        phrase_length = len(phrase_tokens)

        for index in range(
            len(text_tokens) - phrase_length + 1
        ):
            if (
                text_tokens[
                    index:index + phrase_length
                ]
                == phrase_tokens
            ):
                return True

        return False

    def _score_concept(
        self,
        text: str,
        concept_name: str,
        concept_description: str,
    ) -> float:

        normalized_name = self._normalize(concept_name)
        normalized_description = self._normalize(
            concept_description
        )

        text_tokens = set(text.split())
        name_tokens = set(normalized_name.split())
        description_tokens = set(
            normalized_description.split()
        )

        score = 0.0

        # --------------------------------------------------
        # 1. Exact concept-name match
        # --------------------------------------------------

        if self._contains_phrase(
            text,
            normalized_name,
        ):
            score = max(score, 1.0)

        # --------------------------------------------------
        # 2. Concept-name token overlap
        # --------------------------------------------------

        if name_tokens:
            name_overlap = (
                len(text_tokens.intersection(name_tokens))
                / len(name_tokens)
            )

            score = max(
                score,
                0.8 * name_overlap,
            )

        # --------------------------------------------------
        # 3. Description overlap
        # --------------------------------------------------

        if description_tokens:
            description_overlap = (
                len(
                    text_tokens.intersection(
                        description_tokens
                    )
                )
                / len(description_tokens)
            )

            score = max(
                score,
                0.3 * description_overlap,
            )

        return score

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