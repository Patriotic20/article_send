from app.exceptions import PermissionNotFoundError
from app.repositories.permission import PermissionRepository
from app.schemas.permission import PermissionResponse


class PermissionService:
    def __init__(self, permission_repository: PermissionRepository):
        self.permission_repository = permission_repository

    async def get_all(self) -> list[PermissionResponse]:
        return await self.permission_repository.list()

    async def get_by_id(self, permission_id: int) -> PermissionResponse:
        permission = await self.permission_repository.get_by_id(permission_id)
        if permission is None:
            raise PermissionNotFoundError(permission_id)
        return permission
