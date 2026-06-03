from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.exceptions import ConflictError, UnauthorizedError, UserNotFoundError
from app.repositories.user import UserRepository
from app.schemas.auth import (
    LoginRequest,
    MeResponse,
    RegisterRequest,
    TokenResponse,
)
from app.utils import verify_password

# Роль, выдаваемая обычному пользователю при самостоятельной регистрации.
DEFAULT_ROLE = "teacher"


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def _tokens(self, user_id: int) -> TokenResponse:
        return TokenResponse(
            access_token=create_access_token(user_id),
            refresh_token=create_refresh_token(user_id),
        )

    async def register(self, data: RegisterRequest) -> TokenResponse:
        existing = await self.user_repository.get_model_by_email(data.email)
        if existing is not None:
            raise ConflictError("Email already registered")
        user = await self.user_repository.create_with_role(
            data.email, data.password, DEFAULT_ROLE
        )
        return self._tokens(user.id)

    async def login(self, data: LoginRequest) -> TokenResponse:
        user = await self.user_repository.get_model_by_email(data.email)
        if user is None or not verify_password(data.password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError("User is inactive")
        return self._tokens(user.id)

    async def refresh(self, refresh_token: str) -> TokenResponse:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid refresh token")
        user_id = int(payload["sub"])
        user = await self.user_repository.get_by_id(user_id)
        if user is None:
            raise UnauthorizedError("User no longer exists")
        return self._tokens(user_id)

    async def get_me(self, user_id: int) -> MeResponse:
        user = await self.user_repository.get_by_id(user_id)
        if user is None:
            raise UserNotFoundError(user_id)
        roles = await self.user_repository.get_role_names(user_id)
        permissions = await self.user_repository.get_permission_names(user_id)
        return MeResponse(
            id=user.id,
            email=user.email,
            is_active=user.is_active,
            roles=roles,
            permissions=sorted(permissions),
        )
