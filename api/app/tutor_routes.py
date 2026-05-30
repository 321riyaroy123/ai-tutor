from datetime import datetime
from time import perf_counter

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from api.app.db import chats_collection, progress_collection
from api.app.dependencies import get_current_user
from rag.memory import add_to_history, get_history

router = APIRouter(tags=["Tutor"])

VALID_SUBJECTS = {"physics", "math"}


class AskRequest(BaseModel):
    user_id: str
    question: str
    subject: str
    student_level: str = "intermediate"


def _format_conversation_context(user_id: str) -> str:
    history = get_history(user_id)

    if not history:
        return ""

    lines: list[str] = []
    for item in history:
        question = item.get("question", "").strip()
        answer = item.get("answer", "").strip()

        if question:
            lines.append(f"Student: {question}")
        if answer:
            lines.append(f"Tutor: {answer}")

    return "\n".join(lines)


def _get_subject_retriever(subject: str):
    from rag.subject_retriever import SubjectRetriever

    return SubjectRetriever(subject)


def _generate_answer(**kwargs):
    from rag.hybrid_generator import generate_answer

    return generate_answer(**kwargs)


@router.post("/ask")
async def ask_tutor(
    req: AskRequest,
    current_user: str = Depends(get_current_user),
):
    question = req.question.strip()
    subject = req.subject.strip().lower()
    chat_id = req.user_id.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    if not chat_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    if subject not in VALID_SUBJECTS:
        raise HTTPException(status_code=400, detail="Unsupported subject")

    start = perf_counter()

    try:
        retriever = _get_subject_retriever(subject)
        context, pages, sources, base_confidence = retriever.retrieve(question)
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail=f"Subject index for '{subject}' is not available",
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve study material context",
        ) from error

    conversation_context = _format_conversation_context(chat_id)

    try:
        answer, model_used, confidence = _generate_answer(
            context=context,
            question=question,
            base_confidence=base_confidence,
            student_level=req.student_level,
            conversation_context=conversation_context,
        )
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate tutor response",
        ) from error

    latency_seconds = round(perf_counter() - start, 3)

    add_to_history(chat_id, question, answer)

    attempt_document = {
        "user_email": current_user,
        "chat_id": chat_id,
        "subject": subject,
        "question": question,
        "answer": answer,
        "confidence": confidence,
        "model_used": model_used,
        "latency_seconds": latency_seconds,
        "sources": sources,
        "pages": pages,
        "created_at": datetime.utcnow(),
    }

    await chats_collection.insert_one(dict(attempt_document))
    await progress_collection.insert_one(dict(attempt_document))

    return {
        "answer": answer,
        "confidence": confidence,
        "model_used": model_used,
        "latency_seconds": latency_seconds,
        "tokens_used": 0,
        "sources": sources,
        "pages": pages,
    }


@router.post("/tutor/")
async def tutor_legacy_alias(
    req: AskRequest,
    current_user: str = Depends(get_current_user),
):
    return await ask_tutor(req, current_user)
