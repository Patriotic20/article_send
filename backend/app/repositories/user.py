from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import (
    UserCreateRequest,
    UserCreateResponse,
    UserListRequest,
    UserListResponse,
)
from app.utils import hash_password


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    def _to_response(self, user: User) -> UserCreateResponse:
        return UserCreateResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at,
        )

    async def _get_one(self, user_id: int) -> User | None:
        return await self.session.get(User, user_id)

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
        result = await self.session.execute(
            select(User)
            .where(User.email == user_list.email)
            .offset(user_list.offset)
            .limit(user_list.limit)
        )
        users = result.scalars().all()

        total_result = await self.session.execute(
            select(func.count())
            .select_from(User)
            .where(User.email == user_list.email)
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
        await self.session.delete(user)
        await self.session.flush()
        return True
