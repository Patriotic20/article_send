from dataclasses import dataclass, field

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db_helper import get_session
from app.core.security import decode_token
from app.exceptions import ForbiddenError, UnauthorizedError
from app.repositories.user import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


@dataclass
class CurrentUser:
    id: int
    email: str
    permissions: set[str] = field(default_factory=set)
    roles: list[str] = field(default_factory=list)

    def has(self, permission: str) -> bool:
        return permission in self.permissions


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: AsyncSession = Depends(get_session),
) -> CurrentUser:
    if credentials is None:
        raise UnauthorizedError("Not authenticated")
    payload = decode_token(credentials.credentials)
    if payload.get("type") != "access":
        raise UnauthorizedError("Invalid access token")

    user_id = int(payload["sub"])
    repo = UserRepository(session)
    user = await repo.get_by_id(user_id)
    if user is None or not user.is_active:
        raise UnauthorizedError("User no longer exists or is inactive")

    permissions = await repo.get_permission_names(user_id)
    roles = await repo.get_role_names(user_id)
    return CurrentUser(
        id=user.id, email=user.email, permissions=permissions, roles=roles
    )


def require_permission(permission: str):
    """Фабрика-зависимость: проверяет наличие права у текущего пользователя."""

    async def checker(
        current_user: CurrentUser = Depends(get_current_user),
    ) -> CurrentUser:
        if not current_user.has(permission):
            raise ForbiddenError(f"Missing permission: {permission}")
        return current_user

    return checker
