from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.permission import Permission
from app.schemas.permission import PermissionResponse


class PermissionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_response(self, permission: Permission) -> PermissionResponse:
        return PermissionResponse(
            id=permission.id,
            name=permission.name,
            created_at=permission.created_at,
            updated_at=permission.updated_at,
        )

    async def _get_one(self, permission_id: int) -> Permission | None:
        return await self.session.get(Permission, permission_id)

    async def get_by_id(self, permission_id: int) -> PermissionResponse | None:
        permission = await self._get_one(permission_id)
        if permission is None:
            return None
        return self._to_response(permission)

    async def list(self) -> list[PermissionResponse]:
        result = await self.session.execute(
            select(Permission).order_by(Permission.id)
        )
        return [self._to_response(p) for p in result.scalars().all()]

    async def get_by_name(self, name: str) -> Permission | None:
        result = await self.session.execute(
            select(Permission).where(Permission.name == name)
        )
        return result.scalar_one_or_none()

    async def create(self, name: str) -> Permission:
        permission = Permission(name=name)
        self.session.add(permission)
        await self.session.flush()
        await self.session.refresh(permission)
        return permission
