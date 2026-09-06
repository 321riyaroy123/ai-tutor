from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator


ProvenanceType = Literal["textbook", "inferred", "manual"]


class Provenance(BaseModel):
    """
    Describes where an ontology element came from.

    textbook:
        Directly supported by the source textbook.

    inferred:
        Relationship or structure inferred from the textbook's
        organization/pedagogical progression.

    manual:
        Explicitly authored as part of the research ontology.
    """

    source: str = Field(..., min_length=1)
    type: ProvenanceType
    reference: str | None = None


class Misconception(BaseModel):
    """
    A known misconception associated with a physics concept.
    """

    misconception_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    provenance: Provenance


class Concept(BaseModel):
    """
    A node in the physics concept graph.
    """

    concept_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

    chapter: int = Field(..., ge=1)
    section: str | None = None

    misconceptions: list[Misconception] = Field(default_factory=list)

    provenance: Provenance


class PrerequisiteRelation(BaseModel):
    """
    Directed prerequisite edge.

    prerequisite_concept_id -> source_concept_id
    """

    source_concept_id: str = Field(..., min_length=1)
    prerequisite_concept_id: str = Field(..., min_length=1)

    relationship_type: Literal["prerequisite"] = "prerequisite"

    provenance: Provenance

    @model_validator(mode="after")
    def prevent_self_dependency(self) -> "PrerequisiteRelation":
        if self.source_concept_id == self.prerequisite_concept_id:
            raise ValueError(
                "A concept cannot be a prerequisite of itself."
            )

        return self


class PhysicsOntology(BaseModel):
    """
    Versioned machine-readable representation of the physics ontology.
    """

    subject: str = "physics"
    version: str = "1.0"

    concepts: list[Concept] = Field(default_factory=list)

    prerequisite_relations: list[PrerequisiteRelation] = Field(
        default_factory=list
    )

    @model_validator(mode="after")
    def validate_ontology(self) -> "PhysicsOntology":
        concept_ids = [concept.concept_id for concept in self.concepts]

        if len(concept_ids) != len(set(concept_ids)):
            raise ValueError(
                "Concept IDs must be unique."
            )

        misconception_ids: list[str] = []

        for concept in self.concepts:
            for misconception in concept.misconceptions:
                misconception_ids.append(
                    misconception.misconception_id
                )

        if len(misconception_ids) != len(set(misconception_ids)):
            raise ValueError(
                "Misconception IDs must be unique."
            )

        concept_id_set = set(concept_ids)

        for relation in self.prerequisite_relations:
            if relation.source_concept_id not in concept_id_set:
                raise ValueError(
                    "Prerequisite relation references unknown "
                    f"source concept: {relation.source_concept_id}"
                )

            if relation.prerequisite_concept_id not in concept_id_set:
                raise ValueError(
                    "Prerequisite relation references unknown "
                    f"prerequisite concept: "
                    f"{relation.prerequisite_concept_id}"
                )

        self._validate_acyclic_graph()

        return self

    def _validate_acyclic_graph(self) -> None:
        """
        Ensure prerequisite relationships form a DAG.

        If A requires B, the edge is represented as:

            A -> B

        A cycle such as A -> B -> C -> A would make the prerequisite
        structure invalid.
        """

        graph: dict[str, list[str]] = {
            concept.concept_id: []
            for concept in self.concepts
        }

        for relation in self.prerequisite_relations:
            graph[relation.source_concept_id].append(
                relation.prerequisite_concept_id
            )

        visited: set[str] = set()
        active: set[str] = set()

        def visit(concept_id: str) -> None:
            if concept_id in active:
                raise ValueError(
                    "Prerequisite graph contains a cycle."
                )

            if concept_id in visited:
                return

            active.add(concept_id)

            for prerequisite_id in graph[concept_id]:
                visit(prerequisite_id)

            active.remove(concept_id)
            visited.add(concept_id)

        for concept_id in graph:
            visit(concept_id)