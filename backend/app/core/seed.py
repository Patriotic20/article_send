"""Инициализация БД при старте.

- ``bootstrap`` — ВСЕГДА идемпотентно: заводит все разрешения из каталога,
  роли ``admin`` / ``administration`` / ``user`` с базовыми правами
  и admin-пользователя из настроек.

Права ролям только ДОБАВЛЯЮТСЯ: администратор может дополнить роль через
интерфейс, и перезапуск контейнера не должен откатывать такие изменения.
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

ADMIN_ROLE = "admin"
ADMINISTRATION_ROLE = "administration"
USER_ROLE = "user"

# Все права на статьи: роль administration занимается только статьями, но
# внутри них может всё — включая чужие (article:manage_all) и рецензирование.
ARTICLE_PERMISSIONS = [
    "article:create",
    "article:read",
    "article:update",
    "article:delete",
    "article:manage_all",
]

# Обычный пользователь: заводит статьи и видит только свои. Ограничение даёт
# именно отсутствие article:manage_all — без него ArticleService отдаёт и
# проверяет только записи самого пользователя.
USER_PERMISSIONS = [
    "article:create",
    "article:read",
]

ROLE_PERMISSIONS: dict[str, list[str]] = {
    ADMIN_ROLE: PERMISSION_NAMES,
    ADMINISTRATION_ROLE: ARTICLE_PERMISSIONS,
    USER_ROLE: USER_PERMISSIONS,
}

# Прежние имена ролей → актуальные. Переименовываем, а не создаём заново,
# иначе уже выданные пользователям роли осиротеют, а рядом появится дубликат.
LEGACY_ROLE_RENAMES = {
    "teacher": USER_ROLE,
    "adminstation": ADMINISTRATION_ROLE,
}


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


async def _rename_legacy_roles(session: AsyncSession) -> None:
    """Переименовать роли из прежних версий, сохранив их состав и права."""
    for old_name, new_name in LEGACY_ROLE_RENAMES.items():
        result = await session.execute(
            select(Role).where(Role.name.in_([old_name, new_name]))
        )
        found = {role.name: role for role in result.scalars().all()}
        # Если актуальная роль уже есть, старую не трогаем: слияние двух ролей
        # с разным составом пользователей — не дело автоматического сида.
        if old_name in found and new_name not in found:
            found[old_name].name = new_name
            await session.flush()
            print(f"bootstrap: роль '{old_name}' переименована в '{new_name}'.")


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

        # 2. Переименования из прежних версий — до создания ролей, иначе
        #    рядом со старой ролью появится пустая новая.
        await _rename_legacy_roles(session)

        # 3. Роли и их базовые права.
        roles: dict[str, Role] = {}
        for role_name, permission_names in ROLE_PERMISSIONS.items():
            role = await _get_or_create_role(session, role_name)
            roles[role_name] = role
            await _ensure_role_permissions(
                session, role.id, [perms[n].id for n in permission_names]
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
        admin_role = roles[ADMIN_ROLE]
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
