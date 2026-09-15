from typing import Any

from api.app.db import knowledge_states_collection


async def get_student_knowledge_state(
    user_email: str,
    subject: str,
) -> dict[str, Any] | None:
    """
    Retrieve the current knowledge state for a student and subject.

    Returns None when the student has no existing knowledge state.
    """

    state = await knowledge_states_collection.find_one(
        {
            "user_email": user_email,
            "subject": subject.lower(),
        }
    )

    return state