# syntax=docker/dockerfile:1

# ---------- Stage 1: сборка фронтенда ----------
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Кешируем установку зависимостей по lock-файлу.
COPY package.json package-lock.json ./
RUN npm ci

# Исходники и production-сборка (tsc --noEmit && vite build).
COPY . .
RUN npm run build

# ---------- Stage 2: отдача статики через nginx ----------
FROM nginx:1.27-alpine AS runtime

# Конфиг: статический сайт в корне, SPA на /app/, проксирование /api.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Сайт конференции — как есть, без сборки: он не проходит через Vite,
# поэтому его вёрстка, стили и скрипты остаются байт-в-байт исходными.
COPY site/ /usr/share/nginx/html/

# Собранное приложение — в подпапку /app (совпадает с base в vite.config.ts
# и basename роутера).
COPY --from=builder /app/dist /usr/share/nginx/html/app

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
