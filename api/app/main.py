# api/app/main.py
import multiprocessing
import sys
import time
import json
import os
from rag.memory import get_history, add_to_history
from datetime import datetime

# ensure logs dir exists
os.makedirs("logs", exist_ok=True)

# ---------------------------------
# Simple JSON logger
# ---------------------------------
def log_request(data: dict):
    log_file = os.path.join("logs", "requests.jsonl")

    try:
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(data) + "\n")
    except Exception as e:
        print(f"Logging failed: {e}")


from fastapi import FastAPI, HTTPException

# 🪟 Fix multiprocessing freeze issue on Windows
if __name__ == "__main__":
    multiprocessing.freeze_support()

if sys.platform == "win32":
    multiprocessing.set_start_method("spawn", force=True)

app = FastAPI(
    title="AI Tutor API",
    description="Hybrid RAG AI Tutor with semantic reranking and adaptive difficulty",
    version="2.0.0"
)

from api.app.tutor_routes import router as tutor_router
from api.app.ingest_routes import router as ingest_router

app.include_router(ingest_router)
app.include_router(tutor_router)

from fastapi.responses import FileResponse

@app.get("/", tags=["System"])
def root():
    return {
        "status": "running",
        "stage": "Week 3 – Hybrid RAG",
        "message": "Ingestion and retrieval backend is live 🚀"
    }

# Added: simple /ask endpoint using external retriever/generator
from pydantic import BaseModel

class Query(BaseModel):
    user_id: str
    question: str
    student_level: str = "intermediate"


@app.post("/ask")
def ask(query: Query):
    start_time = time.time()

    # lazily import retrieval/generation to avoid failing the whole app
    try:
        from rag.retriever import retrieve_context
        from rag.hybrid_generator import generate_answer
    except Exception as e:
        # Return a clear 500 so the reloader/uvicorn doesn't die on import-time failures
        raise HTTPException(status_code=500, detail=f"Backend import error: {e}")

    # Build conversational context from user history
    history = get_history(query.user_id)

    # Build conversational context
    conversation_context = ""
    for turn in history[-3:]:  # last 3 turns
        conversation_context += (
            f"Previous Question: {turn.get('question', '')}\n"
            f"Previous Answer: {turn.get('answer', '')}\n\n"
        )

    augmented_query = conversation_context + "Current Question: " + query.question

    # Use augmented_query for retrieval/generation
    context, pages, sources, base_conf = retrieve_context(augmented_query)

    answer, model_used, confidence = generate_answer(
        context,
        query.question,
        base_conf,
        student_level=query.student_level,
        conversation_context=conversation_context
    )

    latency = round(time.time() - start_time, 3)

    # Added logging of the request
    log_request({
        "timestamp": datetime.now().isoformat(),
        "question": query.question,
        "model_used": model_used,
        "confidence": confidence,
        "latency": latency
    })

    # Persist this interaction to user history
    add_to_history(query.user_id, query.question, answer)

    return {
        "answer": answer,
        "model_used": model_used,
        "confidence": confidence,
        "pages": pages,
        "sources": sources,
        "latency_seconds": latency
    }


