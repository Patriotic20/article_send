#!/bin/sh
# Entrypoint бэкенда: прогоняем миграции один раз (на контейнер, до форка
# воркеров gunicorn), затем запускаем переданную команду (CMD).
set -e

echo "entrypoint: alembic upgrade head..."
alembic upgrade head

# Заполнение БД один раз на контейнер (до форка воркеров) — без гонки seed.
echo "entrypoint: seeding (bootstrap)..."
python -m app.core.seed

exec "$@"
