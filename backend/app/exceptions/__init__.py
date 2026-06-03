class AppException(Exception):
    """Базовое доменное исключение приложения."""


class UserNotFoundError(AppException):
    def __init__(self, user_id: int | None = None):
        self.user_id = user_id
        message = "User not found"
        if user_id is not None:
            message = f"User not found: id={user_id}"
        super().__init__(message)


__all__ = ["AppException", "UserNotFoundError"]
