#!/bin/sh
# Скрипт инициализации БД для postgres:17-alpine.
# Выполняется один раз при первой инициализации кластера
# (docker-entrypoint-initdb.d). База POSTGRES_DB уже создана образом —
# здесь гарантируем нужные расширения. Сами таблицы создаёт приложение
# на старте (Base.metadata.create_all), поэтому тут только инфраструктура.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOSQL

echo "init-db.sh: база '$POSTGRES_DB' готова."
