from __future__ import annotations

from dataclasses import dataclass

from api.app.ontology.retriever import OntologyRetriever
from api.app.services.concept_classifier import (
    ConceptClassification,
    ConceptClassifier,
)


@dataclass
class InteractionContext:
    concept_id: str | None
    classification_confidence: float
    concept_context: str
    ontology_context: str


class InteractionContextBuilder:
    """
    Builds ontology-aware context for a tutor interaction.

    This layer determines whether a student's message can be
    confidently associated with an ontology concept.
    """

    def __init__(
        self,
        ontology_retriever: OntologyRetriever | None = None,
        concept_classifier: ConceptClassifier | None = None,
    ):
        self.ontology_retriever = (
            ontology_retriever
            or OntologyRetriever()
        )

        self.concept_classifier = (
            concept_classifier
            or ConceptClassifier(
                ontology_retriever=self.ontology_retriever,
            )
        )

    def build(
        self,
        student_message: str,
    ) -> InteractionContext:
        """
        Classify the message and build ontology context.
        """

        classification: ConceptClassification = (
            self.concept_classifier.classify(
                student_message
            )
        )

        if classification.concept_id is None:
            return InteractionContext(
                concept_id=None,
                classification_confidence=(
                    classification.confidence
                ),
                concept_context="",
                ontology_context="",
            )

        concept = self.ontology_retriever.get_concept(
            classification.concept_id
        )

        if concept is None:
            # Defensive protection against an invalid classifier.
            return InteractionContext(
                concept_id=None,
                classification_confidence=(
                    classification.confidence
                ),
                concept_context="",
                ontology_context="",
            )

        concept_context = (
            self.ontology_retriever.get_concept_context(
                concept.concept_id,
                include_prerequisites=False,
            )
        )

        ontology_context = (
            self.ontology_retriever.get_concept_context(
                concept.concept_id,
                include_prerequisites=True,
            )
        )

        return InteractionContext(
            concept_id=concept.concept_id,
            classification_confidence=(
                classification.confidence
            ),
            concept_context=concept_context,
            ontology_context=ontology_context,
        )