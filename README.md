# AI Tutor

A small Retrieval-Augmented Generation (RAG) tutor prototype that combines retrieval over STEM PDFs with an LLM pipeline, a FastAPI backend and a Streamlit UI. This repo contains scaffolding and early implementations intended for experimentation and local development.

Status
- Current deliverables: architecture, basic RAG wiring, data ingestion helpers, API and UI scaffolds.
- Not production-ready: model loading, indexing, error handling and security need hardening.

Key features
- Retrieval over STEM PDFs (OpenStax) using FAISS.
- LLM generation via Hugging Face pipelines (prefers google/flan-t5-large → flan-t5-base).
- Math/equation support using SymPy helpers.
- FastAPI backend with a /chat endpoint and Streamlit frontend prototype.
- Dockerfile scaffold for the API.

Repository layout (high level)
- ai/ — RAG & model logic (ai/rag.py, ai/sympy_agent.py, ...)
- api/ — FastAPI app and API wiring (api/app/main.py, api/app/test.py)
- ui/ — Streamlit frontend (ui/app.py)
- data/ — Documents for retrieval (data/openstax/, data/ncert_private/)
- docker/ — Dockerfiles (docker/api.DockerFile)
- docs/ — architecture diagrams
- .github/ — CI templates
- tests / helpers — test_ingest.py, etc.
- issues.txt, responses.txt — runtime logs

Requirements
- Python 3.11+ recommended
- See requirements.txt for exact Python packages

Quick start (local)

1) Create & activate virtual environment

- macOS / Linux
```bash
python -m venv venv
source venv/bin/activate
```
- Windows (PowerShell)
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2) Install dependencies
```bash
pip install -r requirements.txt
```

3) Run the API (development)
```bash
cd api
uvicorn app.main:app --reload --port 8000
```
- Endpoints: GET / (health), POST /chat (see api/app/main.py for the Query model).
- API startup initializes the RagAgent and attempts to load/build the FAISS index from data/.

4) Run the UI (optional)
```bash
streamlit run ui/app.py
```
- The UI posts to the API (defaults to http://localhost:8000).

Docker
```bash
docker build -f docker/api.DockerFile -t ai-tutor-api .
docker run -p 8000:8000 ai-tutor-api
```

Important implementation notes
- Vector DB: The agent looks for a persisted FAISS index (persist_dir). If not found it builds one from PDFs under data/openstax using recursive chunking.
- LLM: Uses Hugging Face text2text-generation pipeline. If model loading fails the pipeline may be left None — check api/app/test.py to validate locally.
- Math support: SymPy-based equation solving and prompt enhancement live in ai/.
- Reindex: Delete the FAISS persist_dir (default "faiss_db") and restart the API to rebuild.

Data & licensing
- OpenStax PDFs in data/openstax/ are CC-BY 4.0. Attribution is required for redistribution. See data/openstax/README.md for details and sources.


Testing & troubleshooting
- Smoke test transformers pipeline:
```bash
python api/app/test.py
```
- Common issues:
  - No PDFs found → FAISS build skipped. Check data/openstax/.
  - Model load failures → check CPU/GPU availability and transformers output.
  - FastAPI reload on Windows: api/app/main.py includes multiprocessing adjustments to avoid spawn issues.

Development tips
- Read ai/rag.py for retrieval, prompt handling and generation flow.
- Inspect api/app/main.py for startup lifecycle and the /chat contract.
- Use logs (issues.txt and responses.txt) for runtime diagnostics.

Credits
- OpenStax (textbooks) — CC-BY 4.0. See data/openstax/README.md for attribution details.

Contact / Where to look first
- Start with: ai/rag.py → api/app/main.py → ui/app.py


