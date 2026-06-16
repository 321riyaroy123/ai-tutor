# api/app/ingest_routes.py - FIXED VERSION
# Replaces ChromaDB with FAISS to match the rest of the architecture

from fastapi import APIRouter
from pathlib import Path
import sys

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

# ---- Paths ----
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data" / "openstax"
EMBEDDINGS_DIR = BASE_DIR / "embeddings"

EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)

# ---- Ensure imports work ----
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# ---- Route ----
@router.post("/")
def ingest_documents():
    """
    Ingest PDF documents and build FAISS indexes for each subject.
    
    This endpoint:
    1. Converts PDFs to text (if needed)
    2. Chunks text using the universal chunker
    3. Builds subject-specific FAISS indexes
    4. Saves embeddings and chunk metadata
    
    Returns:
        - ingestion_results: dict with status for each subject
    """
    from rag.build_subject_index import build_subject_index
    from utils.pdf_to_text import extract_physics_pdf, extract_math_pdf
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Map subjects to PDF files and text files
    subject_config = {
        "physics": {
            "pdf": DATA_DIR / "University_Physics_Volume_1_-_WEB.pdf",
            "txt": DATA_DIR / "physics.txt",
            "extractor": extract_physics_pdf
        },
        "math": {
            "pdf": DATA_DIR / "math_textbook.pdf",  # Adjust filename as needed
            "txt": DATA_DIR / "math_book.txt",
            "extractor": extract_math_pdf
        }
    }
    
    results = {}
    
    for subject, config in subject_config.items():
        pdf_path = config["pdf"]
        txt_path = config["txt"]
        extractor = config["extractor"]
        
        try:
            # Step 1: Extract PDF to text if needed
            if not txt_path.exists() and pdf_path.exists():
                logger.info(f"Extracting {subject} PDF to text...")
                extractor(str(pdf_path), str(txt_path))
            elif not txt_path.exists():
                results[subject] = {
                    "status": "skipped",
                    "reason": f"No PDF found at {pdf_path}"
                }
                continue
            
            # Step 2: Build FAISS index for this subject
            logger.info(f"Building FAISS index for {subject}...")
            build_subject_index(str(txt_path), subject)
            
            results[subject] = {
                "status": "success",
                "index_path": str(EMBEDDINGS_DIR / f"{subject}_index.faiss"),
                "chunks_path": str(EMBEDDINGS_DIR / f"{subject}_chunks.pkl")
            }
            logger.info(f"Successfully built {subject} index")
            
        except FileNotFoundError as e:
            results[subject] = {
                "status": "file_not_found",
                "detail": str(e)
            }
            logger.error(f"File not found for {subject}: {e}")
            
        except Exception as e:
            results[subject] = {
                "status": "error",
                "detail": str(e)
            }
            logger.error(f"Failed to ingest {subject}: {e}", exc_info=True)
    
    # Verify indexes were created
    summary = {
        "ingestion_results": results,
        "indexes_ready": {
            subject: (EMBEDDINGS_DIR / f"{subject}_index.faiss").exists()
            for subject in subject_config.keys()
        }
    }
    
    return summary


@router.get("/status")
def ingest_status():
    """Check which subject indexes are available"""
    from pathlib import Path
    
    EMBEDDINGS_DIR = Path("embeddings")
    
    available_subjects = {}
    for subject in ["physics", "math"]:
        index_file = EMBEDDINGS_DIR / f"{subject}_index.faiss"
        chunks_file = EMBEDDINGS_DIR / f"{subject}_chunks.pkl"
        
        available_subjects[subject] = {
            "index_exists": index_file.exists(),
            "chunks_exist": chunks_file.exists(),
            "ready": index_file.exists() and chunks_file.exists()
        }
    
    return {
        "status": "ok",
        "available_indexes": available_subjects
    }
