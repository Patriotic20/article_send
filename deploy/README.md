# Развёртывание на idz.nsumt.uz

Домен целиком отдан этому проекту: корень `/` показывает фронтенд, `/api/*` —
бэкенд FastAPI.

## Схема

```
браузер  ──HTTPS──►  nginx на хосте (80/443)
                          │  proxy_pass 127.0.0.1:8081
                          ▼
                     контейнер frontend (nginx:alpine)
                          ├─ /            → статика Vite + SPA-fallback
                          └─ /api/        → proxy_pass backend:8000
                                                  │
                                                  ▼
                                            контейнер backend (gunicorn)
                                                  │
                                                  ▼
                                            контейнер db (postgres)
```

Хостовый nginx занимается только TLS, сжатием и проксированием. Логика
маршрутизации (SPA-fallback, префикс `/api/`) остаётся в
[`frontend/nginx.conf`](../frontend/nginx.conf) — так конфиг сервера не нужно
править при изменениях в приложении.

## 1. DNS

A-запись `idz.nsumt.uz` → IP сервера. Проверить:

```bash
dig +short idz.nsumt.uz
```

Без корректной A-записи домен просто не откроется.

## 2. Файрвол

Наружу открыты только 80 и 443:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow OpenSSH
sudo ufw enable
```

## 3. Переменные окружения

```bash
cp .env.example .env
```

Обязательно в `.env` на сервере:

```ini
BIND_ADDR=127.0.0.1          # порты контейнеров не видны снаружи
FRONTEND_PORT=8081           # должен совпадать с upstream в конфиге nginx
BACKEND_PORT=8100
DB_PORT=5434

CORS_ORIGINS=http://idz.nsumt.uz    # после включения TLS — https://
JWT_SECRET=<openssl rand -hex 32>
POSTGRES_PASSWORD=<длинный пароль>
DATABASE_URL=postgresql+asyncpg://article:<тот же пароль>@db:5432/article_send
ADMIN_EMAIL=<реальная почта>
ADMIN_PASSWORD=<надёжный пароль>
```

`BIND_ADDR=127.0.0.1` — ключевая строка. Без неё Postgres и API доступны по
`idz.nsumt.uz:5434` и `:8100` в обход nginx и TLS.

## 4. Запуск контейнеров

```bash
docker compose up -d --build
docker compose ps
curl -I http://127.0.0.1:8081          # 200 — фронт отдаётся
curl -s http://127.0.0.1:8100/health   # {"status":"ok"}
```

## 5. nginx на хосте

Сначала проверить, что и как установлено:

```bash
nginx -v
ls /etc/nginx/
```

**Вариант А — пакет Debian/Ubuntu** (в `/etc/nginx/` есть `sites-available`):

```bash
sudo apt install nginx      # если nginx ещё не стоит
sudo cp deploy/nginx/idz.nsumt.uz.conf /etc/nginx/sites-available/idz.nsumt.uz
sudo ln -s /etc/nginx/sites-available/idz.nsumt.uz /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

**Вариант Б — сборка с nginx.org** (каталогов `sites-*` нет, есть только
`conf.d`). Схема с симлинками — соглашение Debian, а не часть nginx; здесь
конфиг кладётся напрямую, `conf.d/*.conf` подключается автоматически:

```bash
sudo cp deploy/nginx/idz.nsumt.uz.conf /etc/nginx/conf.d/idz.nsumt.uz.conf
sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.disabled
```

Дефолтный сайт обязательно отключить: он объявлен как `default_server` и
перехватит запросы раньше нашего блока.

Затем в обоих вариантах:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Проверка: `http://idz.nsumt.uz` уже должен показывать фронтенд (пока без TLS).

## 6. HTTPS (позже)

Сейчас сайт работает по HTTP. Это рабочий вариант для запуска и проверки, но
временный: пароли при входе и JWT-токены передаются открытым текстом, и любой
узел на пути между посетителем и сервером может их прочитать. До того как
сервисом начнут пользоваться реально, TLS нужно включить.

Когда дойдут руки — сертификат выпускается через certbot, а `map $client_scheme`
в конфиге уже готов к работе за TLS:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d idz.nsumt.uz
```

Certbot сам добавит блок на 443 и редирект с 80. Два момента: он копирует не
все директивы, поэтому после выпуска надо проверить, что `client_max_body_size
20m;` оказался и в новом блоке; и на nginx 1.22 (текущая версия на сервере)
директива `http2 on;` не поддерживается — там пишется `listen 443 ssl http2;`.

## 7. Проверка после запуска

```bash
curl -I http://idz.nsumt.uz               # 200, страница логина
curl -s http://idz.nsumt.uz/api/health    # {"status":"ok"}
```

В браузере: открыть `http://idz.nsumt.uz`, войти под админом, зайти на
внутренний маршрут (например `/articles`) и **обновить страницу F5** — должна
открыться она же, а не 404. Затем загрузить статью на несколько мегабайт и
скачать её обратно.

## Частые проблемы

| Симптом | Причина |
|---|---|
| 502 Bad Gateway | Контейнер не поднят или `FRONTEND_PORT` не совпадает с `upstream` в конфиге |
| 413 Request Entity Too Large | `client_max_body_size` не задан в блоке 443 (certbot копирует не всё — проверить) |
| 404 при F5 на `/articles` | Запрос не доходит до контейнера: SPA-fallback живёт внутри него |
| 504 при загрузке файла | Поднять `proxy_read_timeout` |
| Порт 5434 открыт наружу | В `.env` не задан `BIND_ADDR=127.0.0.1`; после правки `docker compose up -d` |
| Certbot: `Invalid response ... <!doctype html>` | ACME-запрос ушёл в `location /` и был проксирован в контейнер — проверить, что локация `/.well-known/acme-challenge/` объявлена с `^~` |
| Бесконечный редирект (`ERR_TOO_MANY_REDIRECTS`) | Безусловный редирект на HTTPS при внешнем прокси, который ходит к нам по http |
| В логах один и тот же IP у всех запросов | Не настроен `set_real_ip_from` для вышестоящего прокси |

## Обновление версии

```bash
git pull
docker compose up -d --build
```

Миграции Alembic прогоняются автоматически в `scripts/entrypoint.sh` до старта
воркеров.
