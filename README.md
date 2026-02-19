# AI Tutor

AI Tutor is a Retrieval-Augmented Generation (RAG) tutor prototype that combines retrieval over STEM PDFs with an LLM pipeline, a FastAPI backend, and a Streamlit UI. This project is designed to provide an interactive and adaptive learning experience for STEM topics.

## Status
- Current deliverables: 
  - Retrieval-Augmented Generation (RAG) architecture.
  - Data ingestion helpers for processing educational PDFs.
  - FastAPI backend with endpoints for question answering.
  - Streamlit-based user interface for interactive Q&A.
  - Integration with Google Gemini for advanced LLM-based answer generation.
- Work in progress: 
  - Error handling, security, and performance optimizations.
  - Enhanced support for adaptive difficulty and conversational context.

## Key Features
- **Document Retrieval**: Retrieve relevant content from STEM PDFs (e.g., OpenStax) using FAISS.
- **LLM Integration**: Generate answers using Hugging Face pipelines and Google Gemini models.
- **Math Support**: Solve equations and enhance prompts with SymPy-based helpers.
- **Interactive UI**: Streamlit-based frontend for user interaction.
- **Backend API**: FastAPI backend with endpoints for question answering and ingestion.
- **Docker Support**: Dockerfile for containerized deployment.

## Repository Layout
- `ai/` — RAG & model logic (e.g., `ai/rag.py`, `ai/sympy_agent.py`).
- `api/` — FastAPI app and API wiring (e.g., `api/app/main.py`, `api/app/test.py`).
- `ui/` — Streamlit frontend (e.g., `ui/app.py`).
- `data/` — Documents for retrieval (e.g., `data/openstax/`, `data/ncert_private/`).
- `docker/` — Dockerfiles for containerized deployment (e.g., `docker/api.DockerFile`).
- `docs/` — Architecture diagrams and documentation.
- `.github/` — CI/CD templates.
- `tests/` — Test scripts and helpers (e.g., `test_ingest.py`).
- `logs/` — Runtime logs (e.g., `issues.txt`, `responses.txt`).

## Requirements
- Python 3.11+ recommended.
- See `requirements.txt` for exact Python dependencies.

## Quick Start (Local)

1. **Create & Activate Virtual Environment**

   - macOS / Linux:
     ```bash
     python -m venv venv
     source venv/bin/activate
     ```
   - Windows (PowerShell):
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the API (Development)**
   ```bash
   cd api
   uvicorn app.main:app --reload --port 8000
   ```
   - Endpoints:
     - `GET /` (health check)
     - `POST /ask` (question answering endpoint).
   - The API initializes the RAG agent and attempts to load/build the FAISS index from the `data/` directory.

4. **Run the UI (Optional)**
   ```bash
   streamlit run ui/app.py
   ```
   - The UI posts questions to the API (default: `http://localhost:8000`).

## Docker Deployment
```bash
docker build -f docker/api.DockerFile -t ai-tutor-api .
docker run -p 8000:8000 ai-tutor-api
```

## Implementation Notes
- **Vector Database**: The RAG agent uses FAISS for document retrieval. If the FAISS index is missing or corrupted, it will rebuild the index from PDFs in `data/openstax` using recursive chunking.
- **LLM**: The system integrates with Hugging Face pipelines and Google Gemini for text generation. If model loading fails, the pipeline may return errors — validate using `api/app/test.py`.
- **Math Support**: SymPy-based equation solving and prompt enhancement are implemented in `ai/`.
- **Reindexing**: To rebuild the FAISS index, delete the `persist_dir` (default: `faiss_db`) and restart the API.

## Data & Licensing
- OpenStax PDFs in `data/openstax/` are licensed under CC-BY 4.0. Attribution is required for redistribution. See `data/openstax/README.md` for details and sources.
- Any NCERT PDFs (if present in `data/ncert_private/`) are for private/local use only and must not be redistributed or used for public model training.

## Testing & Troubleshooting
- **Smoke Test**: Validate the transformers pipeline:
  ```bash
  python api/app/test.py
  ```
- **Common Issues**:
  - **No PDFs Found**: FAISS build skipped. Ensure PDFs are in `data/openstax/`.
  - **Model Load Failures**: Check CPU/GPU availability and validate the transformers pipeline.
  - **FastAPI Reload Issues on Windows**: `api/app/main.py` includes multiprocessing adjustments to avoid spawn issues.

## Development Tips
- Read `ai/rag.py` for retrieval, prompt handling, and generation flow.
- Inspect `api/app/main.py` for the API lifecycle and `/ask` endpoint.
- Use logs (`issues.txt` and `responses.txt`) for runtime diagnostics.

## Credits
- OpenStax (textbooks) — CC-BY 4.0. See `data/openstax/README.md` for attribution details.

## Contact
- Start with: `ai/rag.py` → `api/app/main.py` → `ui/app.py`.


