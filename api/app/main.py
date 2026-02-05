# api/app/main.py
import multiprocessing
import sys

# 🪟 Fix multiprocessing freeze issue on Windows
if __name__ == "__main__":
    multiprocessing.freeze_support()

if sys.platform == "win32":
    multiprocessing.set_start_method("spawn", force=True)

from fastapi import FastAPI

app = FastAPI(
    title="AI Tutor API",
    description="AI Tutor backend (Week 2 – RAG ingestion & retrieval)",
    version="2.0.0"
)

from api.app.tutor_routes import router as tutor_router
from api.app.ingest_routes import router as ingest_router

app.include_router(ingest_router)
app.include_router(tutor_router)

@app.get("/", tags=["System"])
def root():
    return {
        "status": "running",
        "stage": "Week 2",
        "message": "Ingestion and retrieval backend is live 🚀"
    }
