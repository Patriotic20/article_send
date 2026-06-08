"""Инициализация БД при старте.

- ``bootstrap`` — ВСЕГДА идемпотентно: заводит все разрешения из каталога,
  роли ``admin`` (со всеми правами) и ``teacher`` (с правами на статьи),
  и admin-пользователя из настроек.
"""

from sqlalchemy import insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.associations import role_permissions, user_roles
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
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


async def run() -> None:
    """Однократное заполнение БД.

    Вызывается из entrypoint контейнера ОДИН раз (после alembic upgrade),
    а не из lifespan каждого воркера — иначе при пустой БД несколько
    воркеров стартуют bootstrap параллельно и ловят гонку на уникальных
    индексах (email/имя права).
    """
    import app.models  # noqa: F401 — регистрирует модели в Base.metadata
    from app.core.db_helper import engine, session_maker

    async with session_maker() as session:
        await bootstrap(session)
    await engine.dispose()


def main() -> None:
    import asyncio

    asyncio.run(run())


if __name__ == "__main__":
    main()
