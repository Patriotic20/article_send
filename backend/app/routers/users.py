from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_helper import get_session
from app.dependencies import require_permission
from app.repositories.role import RoleRepository
from app.repositories.user import UserRepository
from app.schemas.role import RoleResponse
from app.schemas.user import (
    UserCreateRequest,
    UserCreateResponse,
    UserListRequest,
    UserListResponse,
)
from app.schemas.user_info import UserInfoResponse
from app.services.user import UserService

router = APIRouter(prefix="/users", tags=["users"])


def get_user_service(
    session: AsyncSession = Depends(get_session),
) -> UserService:
    return UserService(UserRepository(session), RoleRepository(session))


@router.get(
    "/",
    response_model=UserListResponse,
    dependencies=[Depends(require_permission("user:read"))],
)
async def list_users(
    email: str | None = None,
    size: int = 10,
    page: int = 1,
    service: UserService = Depends(get_user_service),
):
    return await service.get_all_users(
        UserListRequest(email=email, size=size, page=page)
    )


@router.post(
    "/",
    response_model=UserCreateResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("user:create"))],
)
async def create_user(
    data: UserCreateRequest,
    service: UserService = Depends(get_user_service),
):
    return await service.create_user(data)


@router.get(
    "/{user_id}",
    response_model=UserCreateResponse,
    dependencies=[Depends(require_permission("user:read"))],
)
async def get_user(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    return await service.get_by_id(user_id)


@router.get(
    "/{user_id}/info",
    response_model=UserInfoResponse,
    dependencies=[Depends(require_permission("user:read"))],
)
async def get_user_info(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    return await service.get_info(user_id)


@router.get(
    "/{user_id}/roles",
    response_model=list[RoleResponse],
    dependencies=[Depends(require_permission("user:read"))],
)
async def get_user_roles(
    user_id: int,
    service: UserService = Depends(get_user_service),
):
    return await service.get_roles(user_id)


@router.post(
    "/{user_id}/roles/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("user:assign_role"))],
)
async def assign_role(
    user_id: int,
    role_id: int,
    service: UserService = Depends(get_user_service),
):
    await service.assign_role(user_id, role_id)


@router.delete(
    "/{user_id}/roles/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("user:assign_role"))],
)
async def remove_role(
    user_id: int,
    role_id: int,
    service: UserService = Depends(get_user_service),
):
    await service.remove_role(user_id, role_id)
