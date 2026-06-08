from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.associations import role_permissions, user_roles
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from app.models.user_info import UserInfo
from app.schemas.role import RoleResponse
from app.schemas.user import (
    UserCreateRequest,
    UserCreateResponse,
    UserListRequest,
    UserListResponse,
)
from app.schemas.user_info import UserInfoResponse
from app.utils import hash_password


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    # Пользователь считается онлайн, если активность была за это время.
    ONLINE_THRESHOLD = timedelta(minutes=5)

    def _is_online(self, last_seen: datetime | None) -> bool:
        if last_seen is None:
            return False
        if last_seen.tzinfo is None:
            last_seen = last_seen.replace(tzinfo=timezone.utc)
        return datetime.now(timezone.utc) - last_seen < self.ONLINE_THRESHOLD

    def _to_response(self, user: User) -> UserCreateResponse:
        return UserCreateResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            is_online=self._is_online(user.last_seen),
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def _get_one(self, user_id: int) -> User | None:
        return await self.session.get(User, user_id)

    async def touch_last_seen(self, user_id: int) -> None:
        """Отметить активность пользователя (вызывается на каждый запрос)."""
        await self.session.execute(
            update(User)
            .where(User.id == user_id)
            .values(last_seen=datetime.now(timezone.utc))
        )

    async def get_by_email(self, email: str) -> UserCreateResponse | None:
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user is None:
            return None
        return self._to_response(user)

    async def get_by_id(self, user_id: int) -> UserCreateResponse | None:
        user = await self._get_one(user_id)
        if user is None:
            return None
        return self._to_response(user)

    async def create(self, user_create: UserCreateRequest) -> UserCreateResponse:
        user = User(
            email=user_create.email,
            hashed_password=hash_password(user_create.password),
        )
        async with self.session.begin():
            self.session.add(user)
            await self.session.flush()
        await self.session.refresh(user)
        return self._to_response(user)

    async def list(self, user_list: UserListRequest) -> UserListResponse:
        # Фильтр по email необязателен; если задан — ищем по подстроке.
        filters = []
        if user_list.email:
            filters.append(User.email.ilike(f"%{user_list.email}%"))

        result = await self.session.execute(
            select(User)
            .where(*filters)
            .order_by(User.id)
            .offset(user_list.offset)
            .limit(user_list.limit)
        )
        users = result.scalars().all()

        total_result = await self.session.execute(
            select(func.count()).select_from(User).where(*filters)
        )
        total = total_result.scalar_one()

        return UserListResponse(
            size=user_list.size,
            page=user_list.page,
            total=total,
            users=[self._to_response(user) for user in users],
        )

    async def update(
        self, user_id: int, user_update: UserCreateRequest
    ) -> UserCreateResponse | None:
        user = await self._get_one(user_id)
        if user is None:
            return None
        user.email = user_update.email
        user.hashed_password = hash_password(user_update.password)
        await self.session.flush()
        return self._to_response(user)

    async def delete(self, user_id: int) -> bool:
        user = await self._get_one(user_id)
        if user is None:
            return False
        # У user_info нет FK-каскада на users — чистим профиль вручную,
        # иначе остаётся «сирота» с уникальным user_id.
        await self.session.execute(
            delete(UserInfo).where(UserInfo.user_id == user_id)
        )
        await self.session.delete(user)
        await self.session.flush()
        return True

    # --- расширенный профиль (user_info) ---

    async def create_info(
        self,
        user_id: int,
        first_name: str,
        last_name: str,
        university: str,
    ) -> None:
        # Без собственной транзакции — вызывающий сервис оборачивает в begin().
        info = UserInfo(
            user_id=user_id,
            first_name=first_name,
            last_name=last_name,
            university=university,
        )
        self.session.add(info)
        await self.session.flush()

    async def get_info(self, user_id: int) -> UserInfoResponse | None:
        result = await self.session.execute(
            select(UserInfo).where(UserInfo.user_id == user_id)
        )
        info = result.scalar_one_or_none()
        if info is None:
            return None
        return UserInfoResponse(
            id=info.id,
            user_id=info.user_id,
            first_name=info.first_name,
            last_name=info.last_name,
            university=info.university,
            created_at=info.created_at,
            updated_at=info.updated_at,
        )

    # --- роли пользователя ---

    async def list_roles(self, user_id: int) -> list[RoleResponse]:
        result = await self.session.execute(
            select(Role)
            .join(user_roles, user_roles.c.role_id == Role.id)
            .where(user_roles.c.user_id == user_id)
            .order_by(Role.id)
        )
        return [
            RoleResponse(
                id=role.id,
                name=role.name,
                created_at=role.created_at,
                updated_at=role.updated_at,
            )
            for role in result.scalars().all()
        ]

    async def has_role(self, user_id: int, role_id: int) -> bool:
        result = await self.session.execute(
            select(user_roles.c.user_id).where(
                user_roles.c.user_id == user_id,
                user_roles.c.role_id == role_id,
            )
        )
        return result.first() is not None

    async def assign_role(self, user_id: int, role_id: int) -> None:
        # Идемпотентно: повторное назначение не вызывает ошибку.
        if await self.has_role(user_id, role_id):
            return
        await self.session.execute(
            insert(user_roles).values(user_id=user_id, role_id=role_id)
        )

    async def remove_role(self, user_id: int, role_id: int) -> None:
        await self.session.execute(
            delete(user_roles).where(
                user_roles.c.user_id == user_id,
                user_roles.c.role_id == role_id,
            )
        )

    # --- аутентификация / RBAC ---

    async def get_model_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_role_names(self, user_id: int) -> list[str]:
        result = await self.session.execute(
            select(Role.name)
            .join(user_roles, user_roles.c.role_id == Role.id)
            .where(user_roles.c.user_id == user_id)
            .order_by(Role.name)
        )
        return list(result.scalars().all())

    async def get_permission_names(self, user_id: int) -> set[str]:
        result = await self.session.execute(
            select(Permission.name)
            .join(
                role_permissions,
                role_permissions.c.permission_id == Permission.id,
            )
            .join(user_roles, user_roles.c.role_id == role_permissions.c.role_id)
            .where(user_roles.c.user_id == user_id)
        )
        return set(result.scalars().all())

    async def create_user(
        self, email: str, password: str
    ) -> UserCreateResponse:
        # Без собственной транзакции — вызывающий сервис оборачивает в begin().
        user = User(email=email, hashed_password=hash_password(password))
        self.session.add(user)
        await self.session.flush()
        await self.session.refresh(user)
        return self._to_response(user)

    async def create_with_role(
        self, email: str, password: str, role_name: str
    ) -> User:
        user = User(email=email, hashed_password=hash_password(password))
        self.session.add(user)
        await self.session.flush()
        role_result = await self.session.execute(
            select(Role).where(Role.name == role_name)
        )
        role = role_result.scalar_one_or_none()
        if role is not None:
            await self.session.execute(
                insert(user_roles).values(user_id=user.id, role_id=role.id)
            )
        await self.session.refresh(user)
        return user
