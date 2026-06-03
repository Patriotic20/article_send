from app.exceptions import NotFoundError, RoleNotFoundError, UserNotFoundError
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


class UserService:
    def __init__(
        self,
        user_repository: UserRepository,
        role_repository: RoleRepository | None = None,
    ):
        self.user_repository = user_repository
        self.role_repository = role_repository

    async def get_all_users(self, user_list: UserListRequest) -> UserListResponse:
        return await self.user_repository.list(user_list)

    async def get_by_id(self, user_id: int) -> UserCreateResponse:
        user = await self.user_repository.get_by_id(user_id)
        if user is None:
            raise UserNotFoundError(user_id)
        return user

    async def update_user(
        self, user_id: int, user_update: UserCreateRequest
    ) -> UserCreateResponse:
        async with self.user_repository.session.begin():
            user = await self.user_repository.update(user_id, user_update)
            if user is None:
                raise UserNotFoundError(user_id)
            return user

    async def delete_user(self, user_id: int) -> None:
        async with self.user_repository.session.begin():
            deleted = await self.user_repository.delete(user_id)
            if not deleted:
                raise UserNotFoundError(user_id)

    # --- расширенный профиль ---

    async def get_info(self, user_id: int) -> UserInfoResponse:
        if await self.user_repository.get_by_id(user_id) is None:
            raise UserNotFoundError(user_id)
        info = await self.user_repository.get_info(user_id)
        if info is None:
            raise NotFoundError(f"User info not found: user_id={user_id}")
        return info

    # --- роли пользователя ---

    async def get_roles(self, user_id: int) -> list[RoleResponse]:
        if await self.user_repository.get_by_id(user_id) is None:
            raise UserNotFoundError(user_id)
        return await self.user_repository.list_roles(user_id)

    async def assign_role(self, user_id: int, role_id: int) -> None:
        async with self.user_repository.session.begin():
            if await self.user_repository.get_by_id(user_id) is None:
                raise UserNotFoundError(user_id)
            if (
                self.role_repository is None
                or not await self.role_repository.exists(role_id)
            ):
                raise RoleNotFoundError(role_id)
            await self.user_repository.assign_role(user_id, role_id)

    async def remove_role(self, user_id: int, role_id: int) -> None:
        async with self.user_repository.session.begin():
            if await self.user_repository.get_by_id(user_id) is None:
                raise UserNotFoundError(user_id)
            await self.user_repository.remove_role(user_id, role_id)
