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
    """Зависимость FastAPI: одна сессия и одна транзакция на запрос.

    Транзакция коммитится при успешном завершении обработчика и
    откатывается при исключении. Поэтому сервисам НЕ нужно открывать
    собственные ``session.begin()`` — достаточно ``flush``.
    """
    async with session_maker() as session:
        async with session.begin():
            yield session
