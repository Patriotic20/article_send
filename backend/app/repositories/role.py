from sqlalchemy import delete, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.associations import role_permissions
from app.models.permission import Permission
from app.models.role import Role
from app.schemas.permission import PermissionResponse
from app.schemas.role import RoleCreateRequest, RoleResponse


class RoleRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_response(self, role: Role) -> RoleResponse:
        return RoleResponse(
            id=role.id,
            name=role.name,
            created_at=role.created_at,
            updated_at=role.updated_at,
        )

    def _permission_to_response(self, permission: Permission) -> PermissionResponse:
        return PermissionResponse(
            id=permission.id,
            name=permission.name,
            created_at=permission.created_at,
            updated_at=permission.updated_at,
        )

    async def _get_one(self, role_id: int) -> Role | None:
        return await self.session.get(Role, role_id)

    async def exists(self, role_id: int) -> bool:
        return await self._get_one(role_id) is not None

    async def get_by_id(self, role_id: int) -> RoleResponse | None:
        role = await self._get_one(role_id)
        if role is None:
            return None
        return self._to_response(role)

    async def list(self) -> list[RoleResponse]:
        result = await self.session.execute(select(Role).order_by(Role.id))
        return [self._to_response(r) for r in result.scalars().all()]

    async def create(self, role_create: RoleCreateRequest) -> RoleResponse:
        role = Role(name=role_create.name)
        self.session.add(role)
        await self.session.flush()
        await self.session.refresh(role)
        return self._to_response(role)

    async def update(
        self, role_id: int, role_update: RoleCreateRequest
    ) -> RoleResponse | None:
        role = await self._get_one(role_id)
        if role is None:
            return None
        role.name = role_update.name
        await self.session.flush()
        return self._to_response(role)

    async def delete(self, role_id: int) -> bool:
        role = await self._get_one(role_id)
        if role is None:
            return False
        await self.session.delete(role)
        await self.session.flush()
        return True

    # --- разрешения роли ---

    async def list_permissions(self, role_id: int) -> list[PermissionResponse]:
        result = await self.session.execute(
            select(Permission)
            .join(
                role_permissions,
                role_permissions.c.permission_id == Permission.id,
            )
            .where(role_permissions.c.role_id == role_id)
            .order_by(Permission.id)
        )
        return [self._permission_to_response(p) for p in result.scalars().all()]

    async def has_permission(self, role_id: int, permission_id: int) -> bool:
        result = await self.session.execute(
            select(role_permissions.c.role_id).where(
                role_permissions.c.role_id == role_id,
                role_permissions.c.permission_id == permission_id,
            )
        )
        return result.first() is not None

    async def assign_permission(self, role_id: int, permission_id: int) -> None:
        # Идемпотентно: повторное назначение не вызывает ошибку.
        if await self.has_permission(role_id, permission_id):
            return
        await self.session.execute(
            insert(role_permissions).values(
                role_id=role_id, permission_id=permission_id
            )
        )

    async def remove_permission(self, role_id: int, permission_id: int) -> None:
        await self.session.execute(
            delete(role_permissions).where(
                role_permissions.c.role_id == role_id,
                role_permissions.c.permission_id == permission_id,
            )
        )
