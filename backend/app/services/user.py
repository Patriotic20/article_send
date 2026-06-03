from app.exceptions import UserNotFoundError
from app.repositories.user import UserRepository
from app.schemas.user import (
    UserCreateRequest,
    UserCreateResponse,
    UserListRequest,
    UserListResponse,
)


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

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
