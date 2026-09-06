from __future__ import annotations

from api.app.ontology.loader import load_physics_ontology
from api.app.ontology.schema import Concept, PhysicsOntology


class OntologyRetriever:
    """
    Provides read-only access to the physics ontology.

    The retriever is responsible for finding concepts and their
    relationships. It does not modify the ontology or student state.
    """

    def __init__(self, ontology: PhysicsOntology | None = None):
        self.ontology = ontology or load_physics_ontology()

        self._concepts: dict[str, Concept] = {
            concept.concept_id: concept
            for concept in self.ontology.concepts
        }

    def get_concept(self, concept_id: str) -> Concept | None:
        """
        Retrieve a concept by its stable concept ID.
        """
        return self._concepts.get(concept_id)

    def get_prerequisites(
        self,
        concept_id: str,
    ) -> list[Concept]:
        """
        Return the direct prerequisites of a concept.
        """

        if concept_id not in self._concepts:
            return []

        prerequisite_ids = [
            relation.prerequisite_concept_id
            for relation in self.ontology.prerequisite_relations
            if relation.source_concept_id == concept_id
        ]

        return [
            self._concepts[prerequisite_id]
            for prerequisite_id in prerequisite_ids
        ]

    def get_concept_context(
        self,
        concept_id: str,
        include_prerequisites: bool = True,
    ) -> str:
        """
        Build a compact textual representation of a concept for use
        in an LLM prompt.
        """

        concept = self.get_concept(concept_id)

        if concept is None:
            raise ValueError(
                f"Unknown concept ID: {concept_id}"
            )

        lines = [
            f"Concept ID: {concept.concept_id}",
            f"Name: {concept.name}",
            f"Description: {concept.description}",
        ]

        if concept.section:
            lines.append(f"Textbook section: {concept.section}")

        if concept.misconceptions:
            lines.append("Known misconceptions:")

            for misconception in concept.misconceptions:
                lines.append(
                    f"- {misconception.misconception_id}: "
                    f"{misconception.description}"
                )

        if include_prerequisites:
            prerequisites = self.get_prerequisites(concept_id)

            if prerequisites:
                lines.append("Direct prerequisites:")

                for prerequisite in prerequisites:
                    lines.append(
                        f"- {prerequisite.concept_id}: "
                        f"{prerequisite.name}"
                    )

        return "\n".join(lines)