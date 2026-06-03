from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_helper import get_session
from app.dependencies import require_permission
from app.repositories.permission import PermissionRepository
from app.schemas.permission import PermissionResponse
from app.services.permission import PermissionService

router = APIRouter(prefix="/permissions", tags=["permissions"])


def get_permission_service(
    session: AsyncSession = Depends(get_session),
) -> PermissionService:
    return PermissionService(PermissionRepository(session))


@router.get(
    "/",
    response_model=list[PermissionResponse],
    dependencies=[Depends(require_permission("permission:read"))],
)
async def list_permissions(
    service: PermissionService = Depends(get_permission_service),
):
    return await service.get_all()


@router.get(
    "/{permission_id}",
    response_model=PermissionResponse,
    dependencies=[Depends(require_permission("permission:read"))],
)
async def get_permission(
    permission_id: int,
    service: PermissionService = Depends(get_permission_service),
):
    return await service.get_by_id(permission_id)
