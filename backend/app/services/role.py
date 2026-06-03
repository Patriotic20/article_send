from app.exceptions import (
    PermissionNotFoundError,
    RoleNotFoundError,
)
from app.repositories.permission import PermissionRepository
from app.repositories.role import RoleRepository
from app.schemas.permission import PermissionResponse
from app.schemas.role import RoleCreateRequest, RoleResponse


class RoleService:
    def __init__(
        self,
        role_repository: RoleRepository,
        permission_repository: PermissionRepository,
    ):
        self.role_repository = role_repository
        self.permission_repository = permission_repository

    async def get_all(self) -> list[RoleResponse]:
        return await self.role_repository.list()

    async def get_by_id(self, role_id: int) -> RoleResponse:
        role = await self.role_repository.get_by_id(role_id)
        if role is None:
            raise RoleNotFoundError(role_id)
        return role

    async def create_role(self, role_create: RoleCreateRequest) -> RoleResponse:
        return await self.role_repository.create(role_create)

    async def update_role(
        self, role_id: int, role_update: RoleCreateRequest
    ) -> RoleResponse:
        role = await self.role_repository.update(role_id, role_update)
        if role is None:
            raise RoleNotFoundError(role_id)
        return role

    async def delete_role(self, role_id: int) -> None:
        deleted = await self.role_repository.delete(role_id)
        if not deleted:
            raise RoleNotFoundError(role_id)

    # --- разрешения роли ---

    async def get_permissions(self, role_id: int) -> list[PermissionResponse]:
        if not await self.role_repository.exists(role_id):
            raise RoleNotFoundError(role_id)
        return await self.role_repository.list_permissions(role_id)

    async def assign_permission(self, role_id: int, permission_id: int) -> None:
        if not await self.role_repository.exists(role_id):
            raise RoleNotFoundError(role_id)
        if await self.permission_repository.get_by_id(permission_id) is None:
            raise PermissionNotFoundError(permission_id)
        await self.role_repository.assign_permission(role_id, permission_id)

    async def remove_permission(self, role_id: int, permission_id: int) -> None:
        if not await self.role_repository.exists(role_id):
            raise RoleNotFoundError(role_id)
        await self.role_repository.remove_permission(role_id, permission_id)
