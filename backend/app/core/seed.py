"""Инициализация БД при старте.

- ``bootstrap`` — ВСЕГДА идемпотентно: заводит все разрешения из каталога,
  роли ``admin`` (со всеми правами) и ``teacher`` (с правами на статьи),
  и admin-пользователя из настроек.
- ``seed_demo`` — только при «почти пустой» БД (кроме admin никого нет):
  создаёт демо-преподавателей с профилями и парой статей.
"""

from sqlalchemy import func, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.article import Article
from app.models.associations import role_permissions, user_roles
from app.models.mixins.article_enum import ArticleStatus
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from app.models.user_info import UserInfo
from app.utils import hash_password

# Полный каталог разрешений приложения.
PERMISSION_NAMES = [
    "user:read",
    "user:create",
    "user:update",
    "user:delete",
    "user:assign_role",
    "role:read",
    "role:manage",
    "permission:read",
    "article:create",
    "article:read",
    "article:update",
    "article:delete",
    "article:manage_all",
]

# Права роли teacher по умолчанию.
TEACHER_PERMISSIONS = ["article:create", "article:read"]

DEMO_USERS = [
    {
        "email": "teacher1@example.com",
        "password": "teacher123",
        "first_name": "Борис",
        "last_name": "Преподавателев",
        "phone_number": "+998902223344",
        "university": "Westminster University Tashkent",
    },
    {
        "email": "teacher2@example.com",
        "password": "teacher123",
        "first_name": "Вера",
        "last_name": "Учителева",
        "phone_number": "+998903334455",
        "university": "INHA University Tashkent",
    },
]


async def _ensure_role_permissions(
    session: AsyncSession, role_id: int, permission_ids: list[int]
) -> None:
    existing = await session.execute(
        select(role_permissions.c.permission_id).where(
            role_permissions.c.role_id == role_id
        )
    )
    have = set(existing.scalars().all())
    to_add = [pid for pid in permission_ids if pid not in have]
    if to_add:
        await session.execute(
            insert(role_permissions),
            [{"role_id": role_id, "permission_id": pid} for pid in to_add],
        )


async def _get_or_create_role(session: AsyncSession, name: str) -> Role:
    result = await session.execute(select(Role).where(Role.name == name))
    role = result.scalar_one_or_none()
    if role is None:
        role = Role(name=name)
        session.add(role)
        await session.flush()
    return role


async def bootstrap(session: AsyncSession) -> None:
    async with session.begin():
        # 1. Разрешения — добавить недостающие.
        result = await session.execute(select(Permission))
        perms = {p.name: p for p in result.scalars().all()}
        missing = [n for n in PERMISSION_NAMES if n not in perms]
        if missing:
            new_perms = [Permission(name=n) for n in missing]
            session.add_all(new_perms)
            await session.flush()
            for p in new_perms:
                perms[p.name] = p

        # 2. Роли admin / teacher.
        admin_role = await _get_or_create_role(session, "admin")
        teacher_role = await _get_or_create_role(session, "teacher")

        # 3. Права ролям.
        await _ensure_role_permissions(
            session, admin_role.id, [perms[n].id for n in PERMISSION_NAMES]
        )
        await _ensure_role_permissions(
            session, teacher_role.id, [perms[n].id for n in TEACHER_PERMISSIONS]
        )

        # 4. Admin-пользователь.
        result = await session.execute(
            select(User).where(User.email == settings.admin_email)
        )
        admin_user = result.scalar_one_or_none()
        if admin_user is None:
            admin_user = User(
                email=settings.admin_email,
                hashed_password=hash_password(settings.admin_password),
            )
            session.add(admin_user)
            await session.flush()

        # 5. Назначить admin-роль admin-пользователю (если ещё нет).
        link = await session.execute(
            select(user_roles.c.user_id).where(
                user_roles.c.user_id == admin_user.id,
                user_roles.c.role_id == admin_role.id,
            )
        )
        if link.first() is None:
            await session.execute(
                insert(user_roles).values(
                    user_id=admin_user.id, role_id=admin_role.id
                )
            )

    print("bootstrap: права/роли/admin готовы.")


async def seed_demo(session: AsyncSession) -> None:
    async with session.begin():
        total = await session.execute(select(func.count()).select_from(User))
        if total.scalar_one() > 1:
            print("seed_demo: данные уже есть — пропуск.")
            return

        teacher = await session.execute(select(Role).where(Role.name == "teacher"))
        teacher_role = teacher.scalar_one()

        users: list[User] = []
        for data in DEMO_USERS:
            user = User(
                email=data["email"],
                hashed_password=hash_password(data["password"]),
            )
            users.append(user)
        session.add_all(users)
        await session.flush()

        session.add_all(
            UserInfo(
                user_id=user.id,
                first_name=data["first_name"],
                last_name=data["last_name"],
                phone_number=data["phone_number"],
                university=data["university"],
            )
            for user, data in zip(users, DEMO_USERS)
        )

        await session.execute(
            insert(user_roles),
            [{"user_id": u.id, "role_id": teacher_role.id} for u in users],
        )

        session.add_all(
            [
                Article(
                    user_id=users[0].id,
                    file_path="uploads/intro.pdf",
                    status=ArticleStatus.accept,
                ),
                Article(
                    user_id=users[1].id,
                    file_path="uploads/draft.docx",
                    status=ArticleStatus.pending,
                ),
            ]
        )

    print("seed_demo: демо-данные созданы.")
