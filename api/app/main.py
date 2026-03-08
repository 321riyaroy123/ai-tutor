import multiprocessing
import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.app.db import db, progress_collection
from api.app.auth_routes import router as auth_router
from api.app.ingest_routes import router as ingest_router
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
app = FastAPI(
    title="AI Tutor API",
    description="Hybrid RAG AI Tutor",
    version="2.0.0"
)

# ----------------------------
# CORS
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-vercel-app.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Routers
# ----------------------------
app.include_router(auth_router)
app.include_router(ingest_router)
app.include_router(tutor_router)

# ----------------------------
# Startup Tasks
# ----------------------------
@app.on_event("startup")
async def ensure_progress_collection():
    existing = await db.list_collection_names()

    if "progress" not in existing:
        await db.create_collection("progress")

    await progress_collection.create_index(
        [("user_email", 1), ("subject", 1), ("created_at", -1)]
    )

    await progress_collection.create_index(
        [("user_email", 1), ("created_at", -1)]
    )

# ----------------------------
# Health Check
# ----------------------------
@app.get("/")
def root():
    return {
        "status": "running",
        "stage": "Hybrid RAG + Auth"
    }