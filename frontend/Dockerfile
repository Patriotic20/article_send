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

# Конфиг с SPA-fallback и проксированием /api на бэкенд.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Собранные ассеты Vite.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
