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

# Собранный бандл кладём в корень: он отдаёт и сайт конференции, и кабинет
# на /app/. Копируется после site/, поэтому его index.html заменяет старую
# главную страницу шаблона, а прочие .html старого сайта остаются на месте.
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
