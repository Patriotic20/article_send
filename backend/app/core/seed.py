"""Идемпотентный сид демо-данных.

Вызывается на старте приложения. Если в БД уже есть пользователи —
ничего не делает. Иначе создаёт набор пользователей с профилями,
разрешения, роли и связи между ними, а также пару статей, чтобы
фронтенд (списки, селектор «текущего пользователя») был не пустым.
"""

from sqlalchemy import func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article import Article
from app.models.associations import role_permissions, user_roles
from app.models.mixins.article_enum import ArticleStatus
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from app.models.user_info import UserInfo
from app.utils import hash_password

PERMISSION_NAMES = [
    "article:create",
    "article:read",
    "article:update",
    "article:delete",
    "user:read",
    "role:manage",
]

USERS = [
    {
        "email": "admin@example.com",
        "password": "admin123",
        "first_name": "Алиса",
        "last_name": "Админова",
        "phone_number": "+998901112233",
        "university": "Tashkent University of IT",
    },
    {
        "email": "editor@example.com",
        "password": "editor123",
        "first_name": "Борис",
        "last_name": "Редакторов",
        "phone_number": "+998902223344",
        "university": "Westminster University Tashkent",
    },
    {
        "email": "user@example.com",
        "password": "user123",
        "first_name": "Вера",
        "last_name": "Пользователева",
        "phone_number": "+998903334455",
        "university": "INHA University Tashkent",
    },
]


async def seed(session: AsyncSession) -> None:
    async with session.begin():
        existing = await session.execute(select(func.count()).select_from(User))
        if existing.scalar_one() > 0:
            print("seed: данные уже есть — пропуск.")
            return

        # Разрешения
        permissions = {name: Permission(name=name) for name in PERMISSION_NAMES}
        session.add_all(permissions.values())

        # Роли
        admin_role = Role(name="admin")
        editor_role = Role(name="editor")
        session.add_all([admin_role, editor_role])

        # Пользователи + профили
        users: list[User] = []
        infos: list[UserInfo] = []
        for data in USERS:
            user = User(
                email=data["email"],
                hashed_password=hash_password(data["password"]),
            )
            users.append(user)
        session.add_all(users)
        await session.flush()  # получить id пользователей, ролей, разрешений

        for user, data in zip(users, USERS):
            infos.append(
                UserInfo(
                    user_id=user.id,
                    first_name=data["first_name"],
                    last_name=data["last_name"],
                    phone_number=data["phone_number"],
                    university=data["university"],
                )
            )
        session.add_all(infos)

        # admin получает все разрешения, editor — только статейные read/update
        await session.execute(
            insert(role_permissions),
            [
                {"role_id": admin_role.id, "permission_id": p.id}
                for p in permissions.values()
            ],
        )
        await session.execute(
            insert(role_permissions),
            [
                {"role_id": editor_role.id, "permission_id": permissions[n].id}
                for n in ("article:read", "article:update")
            ],
        )

        # Роли пользователям: admin → user[0], editor → user[1]
        await session.execute(
            insert(user_roles),
            [
                {"user_id": users[0].id, "role_id": admin_role.id},
                {"user_id": users[1].id, "role_id": editor_role.id},
            ],
        )

        # Пара статей
        session.add_all(
            [
                Article(
                    user_id=users[0].id,
                    file_path="/uploads/intro.pdf",
                    status=ArticleStatus.accept,
                ),
                Article(
                    user_id=users[1].id,
                    file_path="/uploads/draft.docx",
                    status=ArticleStatus.pending,
                ),
            ]
        )

    print("seed: демо-данные созданы.")
