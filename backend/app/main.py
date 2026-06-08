import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

import app.models  # noqa: F401 — регистрирует все модели в Base.metadata
from app.core.config import settings
from app.core.db_helper import engine
from app.exceptions import (
    AppException,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
)
from app.routers import article, auth, notification, permission, role, users


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Каталог для загруженных файлов.
    os.makedirs(settings.upload_dir, exist_ok=True)
    # Схему создаёт Alembic, а данные (bootstrap + demo) — entrypoint контейнера
    # ОДИН раз до старта воркеров (см. scripts/entrypoint.sh). Здесь — ничего,
    # чтобы не гонять seed на каждый воркер.
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    app = FastAPI(title="Article Send API", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(NotFoundError)
    async def not_found_handler(_: Request, exc: NotFoundError):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ConflictError)
    async def conflict_handler(_: Request, exc: ConflictError):
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(UnauthorizedError)
    async def unauthorized_handler(_: Request, exc: UnauthorizedError):
        return JSONResponse(
            status_code=401,
            content={"detail": str(exc)},
            headers={"WWW-Authenticate": "Bearer"},
        )

    @app.exception_handler(ForbiddenError)
    async def forbidden_handler(_: Request, exc: ForbiddenError):
        return JSONResponse(status_code=403, content={"detail": str(exc)})

    @app.exception_handler(AppException)
    async def app_exception_handler(_: Request, exc: AppException):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    app.include_router(auth.router)
    app.include_router(users.router)
    app.include_router(role.router)
    app.include_router(permission.router)
    app.include_router(article.router)
    app.include_router(notification.router)

    # Отдаём загруженные файлы (фронт обращается через прокси /api/uploads/...).
    os.makedirs(settings.upload_dir, exist_ok=True)
    app.mount(
        "/uploads",
        StaticFiles(directory=settings.upload_dir),
        name="uploads",
    )

    @app.get("/health", tags=["health"])
    async def health():
        return {"status": "ok"}

    return app


app = create_app()
