from __future__ import annotations

import json
from pathlib import Path

from api.app.ontology.schema import PhysicsOntology


ONTOLOGY_PATH = Path(__file__).with_name("physics_ontology.json")


def load_physics_ontology(
    path: Path = ONTOLOGY_PATH,
) -> PhysicsOntology:
    """
    Load and validate the physics ontology from JSON.
    """

    if not path.exists():
        raise FileNotFoundError(
            f"Ontology file not found: {path}"
        )

    try:
        with path.open("r", encoding="utf-8") as file:
            data = json.load(file)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Invalid JSON in ontology file: {path}"
        ) from exc

    return PhysicsOntology.model_validate(data)