# api/app/main.py
import multiprocessing
import sys
import os

# 🪟 Fix multiprocessing freeze issue on Windows
if __name__ == "__main__":
    multiprocessing.freeze_support()

# 🚫 Prevent multiprocessing errors when FastAPI reloads
if sys.platform == "win32":
    multiprocessing.set_start_method("spawn", force=True)

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

# Import RagAgent (FAISS version)
from ai.rag import RagAgent


# -------------------------------
# FastAPI app initialization
# -------------------------------
app = FastAPI(
    title="AI Tutor API",
    description="An intelligent STEM tutoring backend powered by RAG + Mistral/Flan LLM",
    version="1.0.0"
)

rag = None  # will hold our AI core


# -------------------------------
# Request model
# -------------------------------
class Query(BaseModel):
    user_id: str
    question: str


# -------------------------------
# App lifecycle events
# -------------------------------
@app.on_event("startup")
async def startup_event():
    """Initialize RagAgent on API startup"""
    global rag
    print("🔄 Initializing RagAgent...")
    try:
        rag = RagAgent()
        print("✅ RagAgent initialized successfully")
        results = rag._retrieve("Explain Newton's Second Law of Motion")
        print(f"Retrieved {len(results)} docs")
        if results:
            print(results[0].page_content[:500])
    except Exception as e:
        print(f"❌ Failed to initialize RagAgent: {e}")
        rag = None


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown"""
    global rag
    rag = None
    print("🧹 RAG agent released and application shutdown complete.")


# -------------------------------
# Endpoints
# -------------------------------
@app.get("/", tags=["System"])
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "message": "AI Tutor backend is up 🚀",
        "model": "Mistral-7B" if rag and "Mistral" in str(rag.pipe) else "Flan-T5",
    }


@app.post("/chat", tags=["Chat"])
async def chat(q: Query):
    """Main chat endpoint — answers user questions via RAG pipeline."""
    if rag is None:
        raise HTTPException(status_code=503, detail="RAG system not initialized yet")

    try:
        response = rag.answer(q.question)
        return {
            "user_id": q.user_id,
            "question": q.question,
            "answer": response,
        }
    except Exception as e:
        print(f"❌ Error handling query '{q.question}': {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------
# Entry point
# -------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"🚀 Starting AI Tutor API on port {port}...")
    uvicorn.run(
        "api.app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        workers=1  # use single worker for safe GPU/torch use
    )
