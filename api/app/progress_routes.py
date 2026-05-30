from fastapi import APIRouter, Depends

from api.app.db import progress_collection, users_collection
from api.app.dependencies import get_current_user
from api.app.services.progress_service import _build_progress_payload

router = APIRouter(tags=["Progress"])


@router.get("/progress")
async def get_progress(current_user: str = Depends(get_current_user)):
    user = await users_collection.find_one(
        {"email": current_user},
        {"created_at": 1},
    )
    attempts = await progress_collection.find({"user_email": current_user}).to_list(None)

    return _build_progress_payload(
        user_email=current_user,
        attempts=attempts,
        joined_at=user.get("created_at") if user else None,
    )
