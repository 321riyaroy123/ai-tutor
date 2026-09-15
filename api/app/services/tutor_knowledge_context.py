from api.app.services.knowledge_context_builder import (
    build_student_knowledge_context,
)
from api.app.services.knowledge_state_retriever import (
    get_student_knowledge_state,
)


async def get_tutor_knowledge_context(
    user_email: str,
    subject: str,
    concept_id: str,
) -> str:
    """
    Retrieve the student's current knowledge state and convert it
    into compact pedagogical context for the tutor.
    """

    knowledge_state = await get_student_knowledge_state(
        user_email=user_email,
        subject=subject,
    )

    return build_student_knowledge_context(
        knowledge_state=knowledge_state,
        concept_id=concept_id,
    )