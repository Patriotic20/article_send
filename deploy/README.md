# Развёртывание на idz.nsumt.uz

Домен целиком отдан этому проекту: корень `/` показывает фронтенд, `/api/*` —
бэкенд FastAPI.

## Схема

TLS терминируется на внешнем reverse proxy, эта VM работает только по HTTP.

```
браузер
   │  HTTPS, домен idz.nsumt.uz
   ▼
внешний reverse proxy  37.153.159.11   (cPanel / Engintron, здесь сертификат)
   │  HTTP
   ▼
VM  195.158.27.186:80   ← nginx хоста, deploy/nginx/idz.nsumt.uz.conf
   │  proxy_pass 127.0.0.1:8080
   ▼
контейнер frontend (nginx:alpine)
   ├─ /       → статика Vite + SPA-fallback
   └─ /api/   → proxy_pass backend:8000
                     │
                     ▼
               контейнер backend (gunicorn) ──► контейнер db (postgres)
```

Из этой схемы следует всё остальное:

- **Сертификат в VM не нужен** — certbot здесь не ставится и не упоминается.
- **Редиректа на HTTPS в VM быть не должно.** Прокси приходит к нам по http;
  безусловный `return 301 https://...` замкнёт запрос в петлю.
- **Схема и IP посетителя известны только прокси.** Конфиг берёт их из
  `X-Forwarded-Proto` (через `map $client_scheme`) и `X-Forwarded-For`
  (через `set_real_ip_from 37.153.159.11`).

Хостовый nginx занимается только сжатием и проксированием. Логика маршрутизации
(SPA-fallback, префикс `/api/`) остаётся в
[`frontend/nginx.conf`](../frontend/nginx.conf) — так конфиг VM не нужно править
при изменениях в приложении.

## 1. Настройка внешнего прокси

Это делается **не на VM**, а на сервере `37.153.159.11` — тем, кто им управляет.
Домен `idz.nsumt.uz` должен проксироваться на VM, а не отдавать локальный сайт:

```nginx
location / {
    proxy_pass http://195.158.27.186:80;
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;   # обязательно: https
    client_max_body_size 20m;                     # иначе загрузка статей → 413
}
```

Проверить, что домен уже смотрит на прокси:

```bash
dig +short idz.nsumt.uz        # ожидается 37.153.159.11
```

## 2. Файрвол

Между прокси и VM трафик идёт **по открытому HTTP через интернет** — это разные
сети и разные IP. Пароли при входе и JWT-токены на этом участке не зашифрованы,
поэтому 80-й порт VM стоит открыть только для адреса прокси:

```bash
sudo ufw allow OpenSSH
sudo ufw allow from 37.153.159.11 to any port 80 proto tcp
sudo ufw enable
```

Так до приложения нельзя будет достучаться напрямую по IP VM, минуя прокси и
TLS. Порты контейнеров (5433, 8000, 8080) наружу не публикуются вообще — за это
отвечает `BIND_ADDR=127.0.0.1` в `.env`, см. следующий шаг.

## 3. Переменные окружения

```bash
cp .env.example .env
```

Обязательно в `.env` на сервере:

```ini
BIND_ADDR=127.0.0.1          # порты контейнеров не видны снаружи
FRONTEND_PORT=8080           # должен совпадать с upstream в конфиге nginx
BACKEND_PORT=8000
DB_PORT=5433

# Браузер видит https (TLS на внешнем прокси) — origin именно https.
CORS_ORIGINS=https://idz.nsumt.uz
JWT_SECRET=<openssl rand -hex 32>
POSTGRES_PASSWORD=<пароль из openssl rand -hex 24>
DATABASE_URL=postgresql+asyncpg://article:<тот же пароль>@db:5432/article_send
ADMIN_EMAIL=<реальная почта>
ADMIN_PASSWORD=<надёжный пароль>
```

Два места, где легко ошибиться:

- **`BIND_ADDR=127.0.0.1`** — без него Postgres и API слушают все интерфейсы и
  доступны по IP VM в обход nginx.
- **Пароль БД генерировать через `openssl rand -hex`, не `-base64`.** Символы
  `+`, `/` и `=` из base64 в строке подключения значат другое, и SQLAlchemy
  разберёт такой URL неправильно — контейнер уйдёт в цикл перезапусков с
  `ValueError: invalid literal for int()`. `POSTGRES_PASSWORD` и пароль внутри
  `DATABASE_URL` должны совпадать символ в символ.

## 4. Запуск контейнеров

```bash
docker compose up -d --build
docker compose ps
curl -I http://127.0.0.1:8080          # 200 — фронт отдаётся
curl -s http://127.0.0.1:8000/health   # {"status":"ok"}
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

Проверка, что nginx VM отвечает (Host подставляем вручную, так как домен ведёт
на прокси, а не сюда):

```bash
curl -I http://127.0.0.1 -H "Host: idz.nsumt.uz"
```

## 6. Проверка снаружи

Работает только после того, как настроен внешний прокси (шаг 1):

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
| 413 Request Entity Too Large | `client_max_body_size` не задан на внешнем прокси (в VM он есть) |
| 404 при F5 на `/articles` | Запрос не доходит до контейнера: SPA-fallback живёт внутри него |
| 504 при загрузке файла | Поднять `proxy_read_timeout` |
| Порт 5434 открыт наружу | В `.env` не задан `BIND_ADDR=127.0.0.1`; после правки `docker compose up -d` |
| Certbot: `Invalid response ... <!doctype html>` | ACME-запрос ушёл в `location /` и был проксирован в контейнер — проверить, что локация `/.well-known/acme-challenge/` объявлена с `^~` |
| Бесконечный редирект (`ERR_TOO_MANY_REDIRECTS`) | В конфиге VM появился `return 301 https://...` — его тут быть не должно |
| В логах один и тот же IP у всех запросов | Прокси сменил адрес — обновить `set_real_ip_from` в конфиге |
| Домен отдаёт старый сайт | Внешний прокси ещё не настроен на VM (шаг 1) |

## Обновление версии

```bash
git pull
docker compose up -d --build
```

Миграции Alembic прогоняются автоматически в `scripts/entrypoint.sh` до старта
воркеров.
