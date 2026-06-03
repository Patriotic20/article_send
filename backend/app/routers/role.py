from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_helper import get_session
from app.dependencies import require_permission
from app.repositories.permission import PermissionRepository
from app.repositories.role import RoleRepository
from app.schemas.permission import PermissionResponse
from app.schemas.role import RoleCreateRequest, RoleResponse
from app.services.role import RoleService

router = APIRouter(prefix="/roles", tags=["roles"])


def get_role_service(
    session: AsyncSession = Depends(get_session),
) -> RoleService:
    return RoleService(RoleRepository(session), PermissionRepository(session))


@router.get(
    "/",
    response_model=list[RoleResponse],
    dependencies=[Depends(require_permission("role:read"))],
)
async def list_roles(service: RoleService = Depends(get_role_service)):
    return await service.get_all()


@router.post(
    "/",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("role:manage"))],
)
async def create_role(
    role_create: RoleCreateRequest,
    service: RoleService = Depends(get_role_service),
):
    return await service.create_role(role_create)


@router.get(
    "/{role_id}",
    response_model=RoleResponse,
    dependencies=[Depends(require_permission("role:read"))],
)
async def get_role(
    role_id: int,
    service: RoleService = Depends(get_role_service),
):
    return await service.get_by_id(role_id)


@router.put(
    "/{role_id}",
    response_model=RoleResponse,
    dependencies=[Depends(require_permission("role:manage"))],
)
async def update_role(
    role_id: int,
    role_update: RoleCreateRequest,
    
    service: RoleService = Depends(get_role_service),
):
    return await service.update_role(role_id, role_update)


@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("role:manage"))],
)
async def delete_role(
    role_id: int,
    service: RoleService = Depends(get_role_service),
):
    await service.delete_role(role_id)


@router.get(
    "/{role_id}/permissions",
    response_model=list[PermissionResponse],
    dependencies=[Depends(require_permission("role:read"))],
)
async def list_role_permissions(
    role_id: int,
    service: RoleService = Depends(get_role_service),
):
    return await service.get_permissions(role_id)


@router.post(
    "/{role_id}/permissions/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("role:manage"))],
)
async def assign_permission(
    role_id: int,
    permission_id: int,
    service: RoleService = Depends(get_role_service),
):
    await service.assign_permission(role_id, permission_id)


@router.delete(
    "/{role_id}/permissions/{permission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("role:manage"))],
)
async def remove_permission(
    role_id: int,
    permission_id: int,
    service: RoleService = Depends(get_role_service),
):
    await service.remove_permission(role_id, permission_id)
