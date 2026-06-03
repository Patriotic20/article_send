class AppException(Exception):
    """Базовое доменное исключение приложения."""


class NotFoundError(AppException):
    """Базовое исключение «сущность не найдена» (маппится в HTTP 404)."""


class ConflictError(AppException):
    """Конфликт состояния (маппится в HTTP 409)."""


class UserNotFoundError(NotFoundError):
    def __init__(self, user_id: int | None = None):
        self.user_id = user_id
        message = "User not found"
        if user_id is not None:
            message = f"User not found: id={user_id}"
        super().__init__(message)


class RoleNotFoundError(NotFoundError):
    def __init__(self, role_id: int | None = None):
        self.role_id = role_id
        message = "Role not found"
        if role_id is not None:
            message = f"Role not found: id={role_id}"
        super().__init__(message)


class PermissionNotFoundError(NotFoundError):
    def __init__(self, permission_id: int | None = None):
        self.permission_id = permission_id
        message = "Permission not found"
        if permission_id is not None:
            message = f"Permission not found: id={permission_id}"
        super().__init__(message)


class ArticleNotFoundError(NotFoundError):
    def __init__(self, article_id: int | None = None):
        self.article_id = article_id
        message = "Article not found"
        if article_id is not None:
            message = f"Article not found: id={article_id}"
        super().__init__(message)


__all__ = [
    "AppException",
    "NotFoundError",
    "ConflictError",
    "UserNotFoundError",
    "RoleNotFoundError",
    "PermissionNotFoundError",
    "ArticleNotFoundError",
]
