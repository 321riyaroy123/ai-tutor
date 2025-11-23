# AI Tutor — Hackathon Week 1

## Goal (Week 1)
- Design system architecture
- Initialize repository and CI
- Collect STEM PDFs (OpenStax) and prepare `data/` folder
- Provide RAG + Granite LLM skeleton

## Repo layout
- ai/        (RAG + LLM logic)
- api/       (FastAPI backend)
- ui/        (Streamlit UI)
- data/      (STEM materials)
- .github/   (CI/CD)
- docker/    (Dockerfiles)
- docs/      (architecture diagram)

## Quick start
1. Create virtual env: `python -m venv venv && source venv/bin/activate`
2. `pip install -r requirements.txt`
3. See `api/README.md` and `ui/README.md` for run instructions.

