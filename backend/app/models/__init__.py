"""Импорт всех моделей и association-таблиц.

Гарантирует, что ``Base.metadata`` знает обо всех таблицах
к моменту вызова ``create_all`` на старте приложения.
"""

from app.models.article import Article
from app.models.associations import role_permissions, user_roles
from app.models.notification import Notification
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from app.models.user_info import UserInfo

__all__ = [
    "Article",
    "Notification",
    "Permission",
    "Role",
    "User",
    "UserInfo",
    "role_permissions",
    "user_roles",
]
