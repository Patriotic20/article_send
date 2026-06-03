from fastapi import APIRouter

from backend.app.schemas.user import UserListResponse


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=UserListResponse)
async def list_users():
    return UserListResponse(users=[])