import multiprocessing
import os
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.app.db import db, progress_collection, knowledge_states_collection, knowledge_evidence_collection, knowledge_history_collection
from api.app.auth_routes import router as auth_router
from api.app.ingest_routes import router as ingest_router
from api.app.progress_routes import router as progress_router
from api.app.tutor_routes import router as tutor_router

# ----------------------------
# Windows multiprocessing fix
# ----------------------------
if __name__ == "__main__":
    multiprocessing.freeze_support()

if sys.platform == "win32":
    multiprocessing.set_start_method("spawn", force=True)

# ----------------------------
# FastAPI Initialization
# ----------------------------
app = FastAPI(title="AI Tutor API", description="Hybrid RAG AI Tutor", version="2.0.0")

frontend_url = os.getenv("FRONTEND_URL", "").strip()
CORS_ORIGINS = ["http://localhost:5173"]
if frontend_url and frontend_url not in CORS_ORIGINS:
    CORS_ORIGINS.append(frontend_url)

# ----------------------------
# CORS
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Routers
# ----------------------------
app.include_router(auth_router)
app.include_router(ingest_router)
app.include_router(progress_router)
app.include_router(tutor_router)

# ----------------------------
# Startup Tasks
# ----------------------------
@app.on_event("startup")
async def ensure_collections():
    existing = await db.list_collection_names()

    # ----------------------------
    # Progress collection
    # ----------------------------
    if "progress" not in existing:
        await db.create_collection("progress")

    await progress_collection.create_index(
        [("user_email", 1), ("subject", 1), ("created_at", -1)]
    )

    await progress_collection.create_index(
        [("user_email", 1), ("created_at", -1)]
    )

    # ----------------------------
    # Knowledge-state collections
    # ----------------------------
    if "knowledge_states" not in existing:
        await db.create_collection("knowledge_states")

    if "knowledge_evidence" not in existing:
        await db.create_collection("knowledge_evidence")

    if "knowledge_history" not in existing:
        await db.create_collection("knowledge_history")

    # ----------------------------
    # Knowledge-state indexes
    # ----------------------------

    # One current knowledge state per user + subject
    await knowledge_states_collection.create_index(
        [("user_email", 1), ("subject", 1)],
        unique=True,
        name="unique_user_subject_state",
    )

    # Evidence lookup for a student
    await knowledge_evidence_collection.create_index(
        [("user_email", 1), ("subject", 1), ("created_at", -1)],
        name="user_subject_evidence",
    )

    # History lookup for a student/concept
    await knowledge_history_collection.create_index(
        [
            ("user_email", 1),
            ("subject", 1),
            ("concept_id", 1),
            ("created_at", -1),
        ],
        name="user_concept_history",
    )

    # General history lookup
    await knowledge_history_collection.create_index(
        [("user_email", 1), ("subject", 1), ("created_at", -1)],
        name="user_subject_history",
    )

# ----------------------------
# Health Check
# ----------------------------
@app.get("/")
def root():
    return {"status": "running", "stage": "Hybrid RAG + Auth"}
