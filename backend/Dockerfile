# syntax=docker/dockerfile:1

# ---------- Stage 1: зависимости ----------
# Образ uv с нужной версией Python (см. .python-version → 3.14).
FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim AS builder

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0

WORKDIR /app

# Сначала только манифесты — слой с зависимостями кешируется,
# пока pyproject.toml / uv.lock не меняются.
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project --no-dev

# Затем исходники приложения и установка самого проекта.
COPY . .
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# ---------- Stage 2: рантайм ----------
FROM python:3.14-slim-bookworm AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Непривилегированный пользователь.
RUN useradd --create-home --uid 1000 appuser

# Готовое виртуальное окружение и код из стадии сборки.
COPY --from=builder --chown=appuser:appuser /app /app

# Каталог загрузок принадлежит appuser — именованный том унаследует владельца
# этой директории при первой инициализации (иначе том создаётся root-owned
# и воркеры под appuser не могут писать файлы статей).
RUN mkdir -p /app/uploads && chown appuser:appuser /app/uploads

USER appuser

EXPOSE 8000

# Entrypoint прогоняет миграции (alembic upgrade head) один раз до старта,
# затем exec'ает CMD (gunicorn). WORKDIR=/app, поэтому alembic.ini и alembic/
# доступны.
ENTRYPOINT ["sh", "/app/scripts/entrypoint.sh"]

# Прод-запуск: gunicorn + uvicorn-воркеры (количество — через WEB_CONCURRENCY).
CMD ["gunicorn", "app.main:app", \
     "--worker-class", "uvicorn_worker.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "2", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
