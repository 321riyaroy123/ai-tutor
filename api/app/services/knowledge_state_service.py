from datetime import datetime, timezone
from typing import Any, Optional

from api.app.db import (
    knowledge_states_collection,
    knowledge_evidence_collection,
    knowledge_history_collection,
)
from api.app.services.knowledge_inference import apply_evidence
from api.app.services.evidence_extractor import Evidence

def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _find_concept(
    concepts: list[dict[str, Any]],
    concept_id: str,
) -> Optional[dict[str, Any]]:
    """Find one concept state by its ontology concept ID."""

    for concept in concepts:
        if concept.get("concept_id") == concept_id:
            return concept

    return None


async def get_or_create_knowledge_state(
    user_email: str,
    subject: str = "physics",
    ontology_version: str = "1.0.0",
) -> dict[str, Any]:
    """
    Retrieve the student's current knowledge state.

    If no state exists yet, create an empty state for the subject.
    """

    state = await knowledge_states_collection.find_one(
        {
            "user_email": user_email,
            "subject": subject,
        }
    )

    if state:
        return state

    now = utc_now()

    state = {
        "user_email": user_email,
        "subject": subject,
        "ontology_version": ontology_version,
        "concepts": [],
        "state_version": 0,
        "created_at": now,
        "updated_at": now,
    }

    await knowledge_states_collection.insert_one(state)

    return state


async def get_knowledge_state(
    user_email: str,
    subject: str = "physics",
) -> Optional[dict[str, Any]]:
    """Return the current knowledge state, or None if it doesn't exist."""

    return await knowledge_states_collection.find_one(
        {
            "user_email": user_email,
            "subject": subject,
        }
    )


async def record_evidence(
    user_email: str,
    subject: str,
    concept_id: str,
    evidence_type: str,
    evidence_strength: float,
    source: str,
    interaction_id: Optional[str] = None,
    observed_response: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> str:
    """
    Store a piece of evidence about the student's knowledge.

    This function does NOT decide how mastery changes.
    It only records the observation.
    """

    now = utc_now()

    evidence = {
        "user_email": user_email,
        "subject": subject,
        "concept_id": concept_id,
        "evidence_type": evidence_type,
        "evidence_strength": evidence_strength,
        "source": source,
        "interaction_id": interaction_id,
        "observed_response": observed_response,
        "metadata": metadata or {},
        "created_at": now,
    }

    result = await knowledge_evidence_collection.insert_one(evidence)

    return str(result.inserted_id)


async def update_concept_state(
    user_email: str,
    subject: str,
    concept_id: str,
    mastery: float,
    confidence: float,
    misconceptions: Optional[list[dict[str, Any]]] = None,
    evidence_count: Optional[int] = None,
    effective_evidence: Optional[float] = None,
) -> dict[str, Any]:
    """
    Update the current state for one concept.

    Concept states are stored as an array so ontology IDs containing
    periods, such as 'kinematics.velocity', remain unchanged.
    """

    now = utc_now()

    mastery = max(0.0, min(1.0, mastery))
    confidence = max(0.0, min(1.0, confidence))

    current_state = await get_or_create_knowledge_state(
        user_email=user_email,
        subject=subject,
    )

    concepts = current_state.get("concepts", [])

    previous_concept = _find_concept(
        concepts=concepts,
        concept_id=concept_id,
    )

    if previous_concept is None:
        previous_concept = {
            "concept_id": concept_id,
            "mastery": 0.5,
            "confidence": 0.0,
            "misconceptions": [],
            "evidence_count": 0,
            "effective_evidence": 0.0,
        }

    previous_mastery = previous_concept.get("mastery", 0.5)
    previous_confidence = previous_concept.get("confidence", 0.0)

    if evidence_count is None:
        evidence_count = (
            previous_concept.get("evidence_count", 0) + 1
        )

    if effective_evidence is None:
        effective_evidence = previous_concept.get(
            "effective_evidence",
            0.0,
        )

    new_concept = {
        "concept_id": concept_id,
        "mastery": mastery,
        "confidence": confidence,
        "misconceptions": misconceptions or [],
        "evidence_count": evidence_count,
        "effective_evidence": effective_evidence,
        "last_evidence_at": now,
    }

    # Replace the existing concept or append a new one.
    updated = False

    updated_concepts = []

    for concept in concepts:
        if concept.get("concept_id") == concept_id:
            updated_concepts.append(new_concept)
            updated = True
        else:
            updated_concepts.append(concept)

    if not updated:
        updated_concepts.append(new_concept)

    new_state_version = current_state.get("state_version", 0) + 1

    await knowledge_states_collection.update_one(
        {
            "user_email": user_email,
            "subject": subject,
        },
        {
            "$set": {
                "concepts": updated_concepts,
                "state_version": new_state_version,
                "updated_at": now,
            }
        },
    )

    await knowledge_history_collection.insert_one(
        {
            "user_email": user_email,
            "subject": subject,
            "concept_id": concept_id,
            "previous_mastery": previous_mastery,
            "new_mastery": mastery,
            "previous_confidence": previous_confidence,
            "new_confidence": confidence,
            "misconceptions": misconceptions or [],
            "state_version": new_state_version,
            "created_at": now,
        }
    )

    updated_state = await get_knowledge_state(
        user_email=user_email,
        subject=subject,
    )

    return updated_state


async def process_evidence(
    user_email: str,
    subject: str,
    concept_id: str,
    evidence_type: str,
    evidence_strength: float = 1.0,
    source: str = "tutor",
    interaction_id: Optional[str] = None,
    observed_response: Optional[str] = None,
    misconception_id: Optional[str] = None,
    misconception_detected: bool = False,
    metadata: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Record evidence, infer the new knowledge state, and persist it.

    This is the main orchestration function for a knowledge-state update.
    """

    # 1. Get the student's current state.
    current_state = await get_or_create_knowledge_state(
        user_email=user_email,
        subject=subject,
    )

    concepts = current_state.get("concepts", [])

    current_concept = _find_concept(
        concepts=concepts,
        concept_id=concept_id,
    )

    if current_concept is None:
        current_concept = {
            "concept_id": concept_id,
            "mastery": 0.5,
            "confidence": 0.0,
            "effective_evidence": 0.0,
            "misconceptions": [],
            "evidence_count": 0,
        }

    prior_mastery = current_concept.get("mastery", 0.5)
    effective_evidence = current_concept.get(
        "effective_evidence",
        0.0,
    )

    # 2. Record the raw observation.
    evidence_id = await record_evidence(
        user_email=user_email,
        subject=subject,
        concept_id=concept_id,
        evidence_type=evidence_type,
        evidence_strength=evidence_strength,
        source=source,
        interaction_id=interaction_id,
        observed_response=observed_response,
        metadata=metadata,
    )

    # 3. Extract existing misconception confidence.
    existing_misconception_confidence = 0.0

    for misconception in current_concept.get(
        "misconceptions",
        [],
    ):
        if misconception.get("misconception_id") == misconception_id:
            existing_misconception_confidence = misconception.get(
                "confidence",
                0.0,
            )
            break

    # 4. Run deterministic inference.
    inference_result = apply_evidence(
        prior_mastery=prior_mastery,
        evidence_type=evidence_type,
        evidence_strength=evidence_strength,
        effective_evidence=effective_evidence,
        misconception_id=misconception_id,
        misconception_confidence=existing_misconception_confidence,
        misconception_detected=misconception_detected,
    )

    # 5. Build the updated misconception list.
    misconceptions = current_concept.get(
        "misconceptions",
        [],
    )

    inferred_misconception = inference_result.get(
        "misconception"
    )

    if inferred_misconception:
        misconception_id_value = inferred_misconception[
            "misconception_id"
        ]

        misconceptions = [
            item
            for item in misconceptions
            if item.get("misconception_id")
            != misconception_id_value
        ]

        if inferred_misconception["confidence"] > 0.0:
            misconceptions.append(inferred_misconception)

    # 6. Persist the new state.
    updated_state = await update_concept_state(
        user_email=user_email,
        subject=subject,
        concept_id=concept_id,
        mastery=inference_result["mastery"],
        confidence=inference_result["confidence"],
        misconceptions=misconceptions,
        evidence_count=(
            current_concept.get("evidence_count", 0) + 1
        ),
        effective_evidence=inference_result[
            "effective_evidence"
        ],
    )

    return {
        "state": updated_state,
        "evidence_id": evidence_id,
        "inference": inference_result,
    }


async def process_extracted_evidence(
    user_email: str,
    subject: str,
    evidence: Evidence,
    interaction_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """
    Process one validated evidence object.

    The evidence has already been extracted and validated.
    """

    return await process_evidence(
        user_email=user_email,
        subject=subject,
        concept_id=evidence.concept_id,
        evidence_type=evidence.evidence_type,
        evidence_strength=evidence.evidence_strength,
        source=evidence.source,
        interaction_id=interaction_id,
        observed_response=None,
        misconception_id=evidence.misconception_id,
        misconception_detected=(
            evidence.evidence_type == "misconception"
        ),
        metadata={
            **(metadata or {}),
            "reasoning": evidence.reasoning,
        },
    )