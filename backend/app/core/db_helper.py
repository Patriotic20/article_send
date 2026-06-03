from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

engine = create_async_engine(settings.database_url, echo=False)

session_maker = async_sessionmaker(
    engine,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Зависимость FastAPI: выдаёт сессию на время запроса.

    Транзакции открывают сервисы через ``async with session.begin()``
    (как в существующем UserService), поэтому здесь только жизненный цикл.
    """
    async with session_maker() as session:
        yield session
