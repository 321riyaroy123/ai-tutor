from fastapi import APIRouter

router = APIRouter(prefix="/tutor", tags=["Tutor"])

@router.post("/")
def tutor_stub():
    return {
        "message": "Tutor route is alive. Generation will be added next."
    }
