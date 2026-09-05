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

Пока запись не разошлась, certbot выпустить сертификат не сможет.

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

CORS_ORIGINS=https://idz.nsumt.uz
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

```bash
sudo apt install nginx
sudo cp deploy/nginx/idz.nsumt.uz.conf /etc/nginx/sites-available/idz.nsumt.uz
sudo ln -s /etc/nginx/sites-available/idz.nsumt.uz /etc/nginx/sites-enabled/
```

Если на сервере остался дефолтный сайт, перехватывающий запросы, — отключить:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Проверка: `http://idz.nsumt.uz` уже должен показывать фронтенд (пока без TLS).

## 6. HTTPS

Каталог для ACME-проверки должен существовать до перезапуска nginx:

```bash
sudo mkdir -p /var/www/certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d idz.nsumt.uz
```

Certbot сам добавит блок на 443 и редирект с 80. Автопродление проверяется так:

```bash
sudo certbot renew --dry-run
```

### Если перед сервером стоит ещё один reverse proxy

Проверить, приходит ли трафик напрямую или через чужой прокси:

```bash
# IP в A-записи и реальный IP сервера должны совпадать
dig +short idz.nsumt.uz
curl -s ifconfig.me
```

Не совпали — значит, между интернетом и вами есть промежуточный узел, и порядок
меняется:

1. **`certbot --nginx` работать не будет.** HTTP-01 требует, чтобы Let's Encrypt
   достучался до 80-го порта именно этого сервера; запрос перехватит внешний
   прокси. Варианты: выпускать сертификат на внешнем прокси (обычно правильный
   выбор — TLS терминируется там же, где вход), либо использовать DNS-01
   (`certbot -a dns-...`), которому 80-й порт вообще не нужен.
2. **Не включать безусловный редирект на HTTPS в этом nginx.** Внешний прокси
   часто ходит к бэкенду по http, отдавая браузеру https. Безусловный
   `return 301 https://...` тогда зациклится: прокси придёт по http, получит
   редирект на https, снова придёт по http. Именно поэтому в конфиге редирект не
   прописан по умолчанию, а `X-Forwarded-Proto` берётся из `$client_scheme`, а
   не из `$scheme`.
3. **Раскомментировать `set_real_ip_from`** в конфиге и указать адрес прокси —
   иначе в логах будет один и тот же IP.

Если же A-запись указывает прямо на ваш сервер — ничего из этого не нужно,
`certbot --nginx` отработает штатно.

### Если TLS настраивается вручную

Блок, который certbot сгенерировал бы, — для справки. Директивы
`client_max_body_size`, `gzip`, `proxy_*` копируются из HTTP-блока.

```nginx
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;                 # nginx < 1.25.1: убрать строку,
                              # вместо неё: `listen 443 ssl http2;`
    server_name idz.nsumt.uz;

    ssl_certificate     /etc/letsencrypt/live/idz.nsumt.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/idz.nsumt.uz/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 20m;

    location / {
        proxy_pass http://article_send_frontend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
        proxy_request_buffering off;
    }
}

server {
    listen 80;
    listen [::]:80;
    server_name idz.nsumt.uz;
    return 301 https://$host$request_uri;
}
```

## 7. Проверка после запуска

```bash
curl -I https://idz.nsumt.uz               # 200, страница логина
curl -s https://idz.nsumt.uz/api/health    # {"status":"ok"}
```

В браузере: открыть `https://idz.nsumt.uz`, войти под админом, зайти на
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
