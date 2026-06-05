#!/bin/sh
# Entrypoint бэкенда: прогоняем миграции один раз (на контейнер, до форка
# воркеров gunicorn), затем запускаем переданную команду (CMD).
set -e

echo "entrypoint: alembic upgrade head..."
alembic upgrade head

exec "$@"
