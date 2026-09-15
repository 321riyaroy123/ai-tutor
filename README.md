# AI Tutor

AI Tutor is a full-stack STEM learning assistant for physics and mathematics. It combines retrieval-augmented generation (RAG), Gemini-powered tutoring, conversation memory, and learner-progress tracking to produce grounded explanations and worked solutions.

For physics, it also has an ontology-aware knowledge-state pipeline: it identifies the relevant concept, records evidence about understanding, and adapts later explanations using mastery estimates and active misconceptions.

## Features

- Subject-specific RAG over physics and mathematics course material using FAISS indexes.
- Gemini 2.5 Flash responses for concept explanations, single-problem solutions, detailed problem-set solutions, and final-answer-only follow-ups.
- JWT authentication, session conversation memory, and MongoDB storage for users, chats, and progress.
- Physics ontology classification with prerequisite-aware prompt context.
- Gemini-assisted evidence extraction and persistent per-concept knowledge states: mastery, confidence, evidence count, and misconceptions.
- Policy-driven adaptive physics tutoring: when concept classification confidence is at least `0.5`, a deterministic policy turns the learner's state into a difficulty, explanation-depth, content, and guidance strategy for Gemini.
- React/Vite frontend with chat, progress views, and light/dark themes.

## Architecture

```text
React / Vite frontend
        |
        v
FastAPI API + JWT authentication
        |
        +--> Subject RAG (FAISS + all-MiniLM-L6-v2) --> course-material context
        +--> Conversation memory --> recent chat context
        +--> Physics ontology --> concept and prerequisite context
                    |
                    +--> MongoDB knowledge state --> adaptive teaching guidance
        |
        v
Gemini 2.5 Flash --> tutor response
        |
        v
MongoDB --> users, chats, progress, knowledge evidence/history/state
```

## Technology

| Area | Tools |
| --- | --- |
| API | FastAPI, Uvicorn, Pydantic |
| Frontend | React 18, Vite, TypeScript, Axios, Tailwind CSS |
| Generation | Google Gemini 2.5 Flash |
| Retrieval | FAISS, Sentence Transformers (`all-MiniLM-L6-v2`) |
| Storage | MongoDB via Motor |
| Ingestion | PyPDF, pdfplumber, PyMuPDF, Tesseract-compatible tooling |
| Testing | pytest, pytest-asyncio |

## Project layout

```text
api/app/                 FastAPI routes, database access, ontology, and services
ai-tutor-frontend/       React/Vite application
rag/                     Index building, retrieval, generation, prompts, and memory
data/                    Source textbooks and extracted text (local, ignored)
embeddings/              Generated FAISS indexes and chunk metadata (local, ignored)
tests/                   Backend and adaptive-tutoring test suite
```

## Requirements

- Python 3.10+
- Node.js 18+
- A MongoDB instance
- A Google AI API key with Gemini access
- Physics and/or mathematics source material if local indexes need to be built

## Setup

### 1. Configure environment variables

Create a `.env` file in the repository root:

```env
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
GOOGLE_API_KEY=<your-google-ai-api-key>
# Optional: permits a deployed frontend in addition to http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

`MONGO_URL` and `GOOGLE_API_KEY` are required when the API starts.

### 2. Install and run the backend

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn api.app.main:app --reload
```

The API runs at `http://localhost:8000`; interactive documentation is available at `/docs`.

### 3. Build retrieval indexes

On a first run, or after changing textbooks, put source files in the expected `data/openstax/` locations and call:

```bash
curl -X POST http://localhost:8000/ingest/
```

This creates `embeddings/<subject>_index.faiss` and `embeddings/<subject>_chunks.pkl`. Check availability with `GET /ingest/status`.

### 4. Start the frontend

```bash
cd ai-tutor-frontend
npm install
npm run dev
```

Vite normally serves the frontend at `http://localhost:5173`.

## API overview

Authenticated endpoints require `Authorization: Bearer <access_token>`.

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/` | `GET` | Health/status response |
| `/register` | `POST` | Create a user account |
| `/login` | `POST` | Sign in and receive a JWT |
| `/ask` | `POST` | Ask the tutor a physics or math question |
| `/tutor/` | `POST` | Legacy alias for `/ask` |
| `/progress` | `GET` | Retrieve learning-progress summary |
| `/ingest/` | `POST` | Extract source material and build FAISS indexes |
| `/ingest/status` | `GET` | Check index readiness |
| `/knowledge/evaluate` | `POST` | Evaluate a physics response for an ontology concept |
| `/evaluate-response` | `POST` | Legacy knowledge-evaluation route |

Example tutor request:

```json
{
  "user_id": "chat-session-001",
  "question": "Why does an object keep moving when no force acts on it?",
  "subject": "physics",
  "student_level": "intermediate"
}
```

Example physics knowledge-evaluation request:

```json
{
  "subject": "physics",
  "concept_id": "newtons_first_law",
  "student_response": "An object keeps moving because it has inertia.",
  "interaction_id": "chat-session-001"
}
```

## Adaptive tutoring flow

1. The tutor retrieves relevant course material and recent chat history.
2. For physics, it classifies the message against the ontology and gathers concept and prerequisite context.
3. When classification confidence is at least `0.5`, it reads the learner's saved state for that concept and applies a deterministic adaptive-tutoring policy.
4. Gemini receives the retrieved material and guidance to tailor its explanation. Internal mastery values, confidence scores, concept IDs, and system details are not shown to the student.
5. A student response submitted to `/knowledge/evaluate` is converted to evidence and used to update persistent knowledge state.

Physics is currently the only subject with ontology-driven knowledge evaluation and adaptation. Mathematics is supported by the RAG tutoring pipeline but does not yet have the same knowledge-state layer.

## Adaptive tutoring policy

The policy is deterministic and evaluated in this priority order, so an active misconception always overrides a high mastery estimate:

| Condition | Difficulty | Explanation depth | Teaching strategy |
| --- | --- | --- | --- |
| Active misconception | Remedial | Deep | Correct the misconception directly |
| Confidence below `0.30` | Diagnostic | Moderate | Assess understanding with diagnostic examples |
| Mastery below `0.30` | Foundational | Deep | Build from prerequisites and intuition |
| Mastery below `0.55` | Basic | Moderate | Clarify gaps with guided practice |
| Mastery below `0.75` | Intermediate | Moderate | Encourage independent multi-step reasoning |
| Mastery of `0.75` or greater | Advanced | Concise | Use transfer tasks, edge cases, and challenges |

The resulting policy and identified misconceptions are supplied only as tutor context; student-facing responses do not expose internal learner-model data.

## Tests

Run the backend test suite from the repository root:

```bash
pytest
```

The suite covers prompt modes, ontology classification/context, knowledge-state inference and retrieval, evidence extraction, adaptive-policy selection, and end-to-end adaptive tutoring integration.

## License

This project is intended for academic and research use.
