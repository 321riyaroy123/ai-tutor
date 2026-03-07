# api/app/main.py

import multiprocessing
import sys
import time
import json
import os
import uuid
import re
from datetime import datetime
from typing import Any

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from api.app.dependencies import get_current_user
from api.app.db import db, chats_collection, progress_collection, users_collection
from rag.memory import get_history, add_to_history
from rag.hybrid_generator import generate_answer
from rag.subject_retriever import SubjectRetriever

import numpy as np
from sentence_transformers import SentenceTransformer

# ---------------------------------
# Windows multiprocessing fix
# ---------------------------------
if __name__ == "__main__":
    multiprocessing.freeze_support()

if sys.platform == "win32":
    multiprocessing.set_start_method("spawn", force=True)


# ---------------------------------
# App Initialization
# ---------------------------------
app = FastAPI(
    title="AI Tutor API",
    description="Hybrid RAG AI Tutor",
    version="2.0.0"
)

# ---------------------------------
# CORS
# ---------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------
# Routers
# ---------------------------------
from api.app.auth_routes import router as auth_router
from api.app.ingest_routes import router as ingest_router
from api.app.tutor_routes import router as tutor_router

app.include_router(auth_router)
app.include_router(ingest_router)
app.include_router(tutor_router)


@app.on_event("startup")
async def ensure_progress_collection():
    existing = await db.list_collection_names()
    if "progress" not in existing:
        await db.create_collection("progress")
    await progress_collection.create_index([("user_email", 1), ("subject", 1), ("created_at", -1)])
    await progress_collection.create_index([("user_email", 1), ("created_at", -1)])


# ---------------------------------
# Logger
# ---------------------------------
os.makedirs("logs", exist_ok=True)

def log_request(data: dict):
    try:
        with open("logs/requests.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(data) + "\n")
    except Exception as e:
        print("Logging failed:", e)


# ---------------------------------
# Models
# ---------------------------------
class Query(BaseModel):
    question: str
    subject: str
    student_level: str = "intermediate"


# ---------------------------------
# Retrievers
# ---------------------------------
physics_retriever = SubjectRetriever("physics")
math_retriever = SubjectRetriever("math")

# ---------------------------------
# Topic Embedding Model (cached once)
# ---------------------------------
try:
    topic_embedding_model = SentenceTransformer("BAAI/bge-base-en-v1.5")
except Exception:
    topic_embedding_model = None  # Fail-safe fallback

TOPIC_TAXONOMY: list[tuple[str, str]] = sorted([
    # Physics
    ("projectile motion",       "physics"),
    ("simple harmonic motion",  "physics"),
    ("electric field",          "physics"),
    ("magnetic field",          "physics"),
    ("electromagnetic induction","physics"),
    ("gravitational potential", "physics"),
    ("nuclear fission",         "physics"),
    ("nuclear fusion",          "physics"),
    ("radioactive decay",       "physics"),
    ("wave optics",             "physics"),
    ("ray optics",              "physics"),
    ("thermodynamics",          "physics"),
    ("electromagnetism",        "physics"),
    ("electrostatics",          "physics"),
    ("kinematics",              "physics"),
    ("dynamics",                "physics"),
    ("gravitation",             "physics"),
    ("momentum",                "physics"),
    ("friction",                "physics"),
    ("oscillation",             "physics"),
    ("resonance",               "physics"),
    ("refraction",              "physics"),
    ("diffraction",             "physics"),
    ("interference",            "physics"),
    ("capacitor",               "physics"),
    ("resistance",              "physics"),
    ("current",                 "physics"),
    ("voltage",                 "physics"),
    ("induction",               "physics"),
    ("entropy",                 "physics"),
    ("torque",                  "physics"),
    ("pressure",                "physics"),
    ("quantum",                 "physics"),
    ("relativity",              "physics"),
    ("photon",                  "physics"),
    ("electron",                "physics"),
    ("nucleus",                 "physics"),
    ("circuits",                "physics"),
    ("rotation",                "physics"),
    ("waves",                   "physics"),
    ("optics",                  "physics"),
    ("energy",                  "physics"),
    ("force",                   "physics"),
    ("work",                    "physics"),
    ("power",                   "physics"),
    ("velocity",                "physics"),
    ("acceleration",            "physics"),
    # Math
    ("differential equation",   "math"),
    ("linear algebra",          "math"),
    ("number theory",           "math"),
    ("set theory",              "math"),
    ("complex numbers",         "math"),
    ("quadratic formula",       "math"),
    ("binomial theorem",        "math"),
    ("pythagorean theorem",     "math"),
    ("trigonometric identities","math"),
    ("integration by parts",    "math"),
    ("chain rule",              "math"),
    ("product rule",            "math"),
    ("quotient rule",           "math"),
    ("taylor series",           "math"),
    ("fourier series",          "math"),
    ("matrix multiplication",   "math"),
    ("eigenvalue",              "math"),
    ("determinant",             "math"),
    ("probability",             "math"),
    ("statistics",              "math"),
    ("combinatorics",           "math"),
    ("permutation",             "math"),
    ("trigonometry",            "math"),
    ("integration",             "math"),
    ("differentiation",         "math"),
    ("derivative",              "math"),
    ("integral",                "math"),
    ("calculus",                "math"),
    ("algebra",                 "math"),
    ("geometry",                "math"),
    ("polynomial",              "math"),
    ("quadratic",               "math"),
    ("logarithm",               "math"),
    ("exponential",             "math"),
    ("fraction",                "math"),
    ("inequality",              "math"),
    ("sequence",                "math"),
    ("series",                  "math"),
    ("vectors",                 "math"),
    ("matrices",                "math"),
    ("limits",                  "math"),
    ("parabola",                "math"),
    ("hyperbola",               "math"),
    ("ellipse",                 "math"),
    ("triangle",                "math"),
    ("circle",                  "math"),
], key=lambda x: -len(x[0]))

# ---------------------------------
# Topic Embedding Cache
# ---------------------------------
_TOPIC_EMBED_CACHE: dict[str, dict[str, np.ndarray]] = {"physics": {}, "math": {}}

def _initialize_topic_embeddings():
    if topic_embedding_model is None:
        return

    for topic, subject in TOPIC_TAXONOMY:
        if topic not in _TOPIC_EMBED_CACHE[subject]:
            emb = topic_embedding_model.encode(
                topic,
                normalize_embeddings=True
            )
            _TOPIC_EMBED_CACHE[subject][topic] = emb

_initialize_topic_embeddings()

def _extract_topics(
    text: str,
    subject: str,
    limit: int = 5
) -> list[str]:
    """Match text against taxonomy using keyword + semantic fallback."""

    haystack = (text or "").lower()
    found: list[str] = []

    # ---- Exact keyword match first (existing behavior preserved)
    for topic, topic_subject in TOPIC_TAXONOMY:
        if topic_subject != subject:
            continue

        if topic in haystack and topic not in found:
            found.append(topic)

        if len(found) >= limit:
            return found

    # ---- Semantic fallback only if nothing found
    if not found:
        semantic_matches = _semantic_topic_match(
            text=text,
            subject=subject,
            limit=limit
        )

        for t in semantic_matches:
            if t not in found:
                found.append(t)

    return found[:limit]

def _semantic_topic_match(
    text: str,
    subject: str,
    limit: int = 3,
    threshold: float = 0.55
) -> list[str]:

    if topic_embedding_model is None:
        return []

    if not text.strip():
        return []

    if subject not in _TOPIC_EMBED_CACHE:
        return []

    try:
        query_emb = topic_embedding_model.encode(
            text,
            normalize_embeddings=True
        )

        scored: list[tuple[str, float]] = []

        for topic, topic_emb in _TOPIC_EMBED_CACHE[subject].items():
            score = float(np.dot(query_emb, topic_emb))
            if score >= threshold:
                scored.append((topic, score))

        scored.sort(key=lambda x: -x[1])

        return [topic for topic, _ in scored[:limit]]

    except Exception:
        return []

def _topic_display_name(topic: str) -> str:
    """Title-case a topic phrase for display."""
    return topic.title()


def _compute_streak(attempt_dates: set[str]) -> int:
    streak = 0
    cursor = datetime.utcnow().date()
    while cursor.isoformat() in attempt_dates:
        streak += 1
        cursor = cursor.fromordinal(cursor.toordinal() - 1)
    return streak

def _build_progress_payload(
    user_email: str,
    attempts: list[dict[str, Any]],
    joined_at: datetime | None,
) -> dict[str, Any]:

    subject_attempts: dict[str, list[dict[str, Any]]] = {"physics": [], "math": []}
    all_dates: set[str] = set()
    total_study_minutes = 0

    for attempt in attempts:
        subject = (attempt.get("subject") or "").lower()
        if subject in subject_attempts:
            subject_attempts[subject].append(attempt)
        created_at = attempt.get("created_at")
        if isinstance(created_at, datetime):
            all_dates.add(created_at.date().isoformat())

    def _new_subject_stats() -> dict[str, Any]:
        return {
            "sessions":       0,
            "questions":      0,
            "studyMinutes":   0,
            "confidence":     0,
            "avgLatency":     0,
            "recentTopics":   [],
            "weakAreas":      [],
            "strongAreas":    [],
            "weeklyActivity": [0, 0, 0, 0, 0, 0, 0],
            "topicFrequency": {},   # topic -> count, for pie chart
        }

    result: dict[str, Any] = {
        "userId":        user_email,
        "physics":       _new_subject_stats(),
        "math":          _new_subject_stats(),
        "overallStreak": 0,
        "totalHours":    0,
        "joinedAt":      joined_at.isoformat() if isinstance(joined_at, datetime) else "",
    }

    for subject in ("physics", "math"):
        atts = subject_attempts[subject]
        stats = _new_subject_stats()

        if not atts:
            result[subject] = stats
            continue

        unique_sessions = {a.get("chat_id") for a in atts if a.get("chat_id")}
        stats["sessions"]  = len(unique_sessions) if unique_sessions else len(atts)
        stats["questions"] = len(atts)

        confidence_values = [float(a.get("confidence", 0) or 0) for a in atts]
        latency_values    = [float(a.get("latency_seconds", 0) or 0) for a in atts]

        stats["confidence"] = round(sum(confidence_values) / len(confidence_values), 3)
        stats["avgLatency"] = round(sum(latency_values)    / len(latency_values),    3)

        estimated_minutes = sum(max(2, round(lat / 20) + 1) for lat in latency_values)
        stats["studyMinutes"] = estimated_minutes
        total_study_minutes  += estimated_minutes

        # ── Topic frequency map (for pie chart) ─────────────────────────────
        topic_counts: dict[str, int] = {}
        for a in atts:
            for t in _extract_topics(a.get("question", ""), subject, limit=3):
                topic_counts[t] = topic_counts.get(t, 0) + 1

        # Top 8 topics by frequency
        stats["topicFrequency"] = dict(
            sorted(topic_counts.items(), key=lambda x: -x[1])[:8]
        )

        # ── Recent topics (latest 6 unique, in order) ────────────────────────
        sorted_atts = sorted(atts, key=lambda x: x.get("created_at", datetime.min), reverse=True)
        seen_recent: list[str] = []
        for a in sorted_atts:
            for t in _extract_topics(a.get("question", ""), subject, limit=2):
                if t not in seen_recent:
                    seen_recent.append(t)
            if len(seen_recent) >= 6:
                break
        stats["recentTopics"] = [_topic_display_name(t) for t in seen_recent]

        # ── Weak / strong areas ──────────────────────────────────────────────
        weak_topics:   list[str] = []
        strong_topics: list[str] = []
        for a in atts:
            c = float(a.get("confidence", 0) or 0)
            for t in _extract_topics(a.get("question", ""), subject, limit=2):
                display = _topic_display_name(t)
                if c < 0.55 and display not in weak_topics:
                    weak_topics.append(display)
                elif c >= 0.75 and display not in strong_topics:
                    strong_topics.append(display)
        stats["weakAreas"]   = weak_topics[:5]
        stats["strongAreas"] = strong_topics[:5]

        # ── Weekly activity ──────────────────────────────────────────────────
        weekly_counts  = [0, 0, 0, 0, 0, 0, 0]
        seven_days_ago = datetime.utcnow().date().toordinal() - 6
        for a in atts:
            ca = a.get("created_at")
            if isinstance(ca, datetime) and ca.date().toordinal() >= seven_days_ago:
                weekly_counts[ca.date().weekday()] += 1
        stats["weeklyActivity"] = weekly_counts

        result[subject] = stats

    result["overallStreak"] = _compute_streak(all_dates)
    result["totalHours"]    = round(total_study_minutes / 60.0, 1)

    if not result["joinedAt"] and attempts:
        earliest = min(
            (a.get("created_at") for a in attempts if isinstance(a.get("created_at"), datetime)),
            default=None,
        )
        if isinstance(earliest, datetime):
            result["joinedAt"] = earliest.isoformat()

    return result

def _is_solution_followup(question: str) -> bool:
    q = question.strip().lower()
    if q in {"ok", "okay", "answers", "solutions"}:
        return True
    keywords = (
        "solution",
        "solutions",
        "answer",
        "answers",
        "solve",
        "worked out",
        "work out",
    )
    return any(k in q for k in keywords)


# ---------------------------------
# Health Check
# ---------------------------------
@app.get("/")
def root():
    return {
        "status": "running",
        "stage": "Hybrid RAG + Auth",
    }


# ---------------------------------
# Ask Endpoint
# ---------------------------------
@app.post("/ask")
async def ask(
    query: Query,
    current_user: str = Depends(get_current_user)
):
    start_time = time.time()

    # ---------------------------------
    # Retrieve Conversation History
    # ---------------------------------
    history = get_history(current_user)

    conversation_context = ""
    for turn in history[-3:]:
        conversation_context += (
            f"Previous Question: {turn.get('question', '')}\n"
            f"Previous Answer: {turn.get('answer', '')}\n\n"
        )

    # ---------------------------------
    # Subject Retrieval
    # ---------------------------------
    if query.subject == "physics":
        context, pages, sources, scores = physics_retriever.retrieve(query.question)
    elif query.subject == "math":
        context, pages, sources, scores = math_retriever.retrieve(query.question)
    else:
        raise HTTPException(status_code=400, detail="Invalid subject")

    # For follow-up requests like "ok" / "give me solutions", promote the
    # most recent generated problem set into context so the model can solve it
    # directly instead of only describing generic methods from retrieval docs.
    def _is_solution_followup(question: str) -> str | None:
        """
        Returns:
        "answers"  — user wants final answers only
        "detailed" — user wants full step-by-step explanation
        None       — not a follow-up, treat as new question
        """
        q = question.strip().lower()

        # ── Explicit detail request first (higher priority) ─────────────────────
        detail_triggers = (
            "step by step", "step-by-step", "show working", "show the working",
            "show your work", "full solution", "full solutions",
            "detailed solution", "detailed solutions", "explain the solution",
            "explain the solutions", "walk me through", "how do you solve",
            "how to solve", "work it out", "work them out",
        )
        if any(t in q for t in detail_triggers):
            return "detailed"

        # ── Short acknowledgement phrases → final answers only ──────────────────
        short_ack = {
            "ok", "okay", "yes", "answers", "solutions",
            "show solutions", "give solutions", "give me solutions",
            "give me the solutions", "show me the solutions",
            "solve them", "solve these", "solve the problems",
            "just the answers", "final answers", "what are the answers",
        }
        if q in short_ack:
            return "answers"

        # ── Phrase patterns → final answers only ────────────────────────────────
        answer_patterns = (
            "give me the answers",
            "give me answers",
            "what are the solutions",
            "tell me the answers",
            "the answers to",
            "answers to the",
            "solutions to the",
            "what's the answer",
            "what is the answer",
        )
        if any(p in q for p in answer_patterns):
            return "answers"

        return None
    
    base_confidence = scores

    # ---------------------------------
    # Follow-up detection
    # ---------------------------------
    followup_mode = _is_solution_followup(query.question)   # "answers" | "detailed" | None

    if followup_mode and history:
        last_turn = history[-1]
        prev_question = last_turn.get("question", "")
        prev_answer   = last_turn.get("answer", "")

        if prev_answer:
            # Inject the previously generated problem set as the context to solve
            context = (
                f"[Previously generated for: {prev_question}]\n\n"
                f"{prev_answer}"
            )

    base_confidence = scores

    # ---------------------------------
    # Generation
    # ---------------------------------
    answer, model_used, confidence = generate_answer(
        context=context,
        question=query.question,
        base_confidence=base_confidence,
        student_level=query.student_level,
        conversation_context=conversation_context,
        followup_mode=followup_mode,             # ← new
    )

    latency = round(time.time() - start_time, 3)

    # ---------------------------------
    # Save to MongoDB
    # ---------------------------------
    chat_id = str(uuid.uuid4())

    await chats_collection.insert_one({
        "user_email": current_user,
        "chat_id": chat_id,
        "subject": query.subject,
        "messages": [
            {"role": "user", "content": query.question},
            {"role": "assistant", "content": answer}
        ],
        "created_at": datetime.utcnow()
    })

    # ---------------------------------
    # Save Progress Attempt
    # ---------------------------------
    await progress_collection.insert_one({
        "user_email": current_user,
        "chat_id": chat_id,
        "subject": query.subject,
        "question": query.question,
        "answer": answer,
        "model_used": model_used,
        "confidence": float(confidence or 0),
        "latency_seconds": float(latency),
        "student_level": query.student_level,
        "created_at": datetime.utcnow(),
    })

    # ---------------------------------
    # Save to In-Memory History
    # ---------------------------------
    add_to_history(current_user, query.question, answer)

    # ---------------------------------
    # Logging
    # ---------------------------------
    log_request({
        "timestamp": datetime.now().isoformat(),
        "user": current_user,
        "question": query.question,
        "subject": query.subject,
        "model_used": model_used,
        "confidence": confidence,
        "latency": latency
    })

    return {
        "answer": answer,
        "model_used": model_used,
        "confidence": confidence,
        "pages": pages,
        "sources": sources,
        "latency_seconds": latency
    }


# ---------------------------------
# Get Chats Endpoint
# ---------------------------------
@app.get("/chats/{subject}")
async def get_chats(
    subject: str,
    current_user: str = Depends(get_current_user)
):
    chats = await chats_collection.find({
        "user_email": current_user,
        "subject": subject
    }).to_list(length=100)

    for chat in chats:
        chat["_id"] = str(chat["_id"])

    return chats


# ---------------------------------
# Progress Endpoint
# ---------------------------------
@app.get("/progress")
async def get_progress(current_user: str = Depends(get_current_user)):
    attempts = await progress_collection.find(
        {"user_email": current_user}
    ).sort("created_at", -1).to_list(length=5000)

    user_doc = await users_collection.find_one({"email": current_user}, {"_id": 0, "created_at": 1})
    joined_at = user_doc.get("created_at") if user_doc else None

    return _build_progress_payload(current_user, attempts, joined_at)

