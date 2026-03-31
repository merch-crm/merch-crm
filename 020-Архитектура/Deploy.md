---
tags:
  - архитектура
---

# Развертывание (Deploy Guide)

MerchCRM Unified v3.0 оптимизирована для работы в Docker-контейнерах с использованием внешних сервисов рассылок и хранения файлов.

## 1. Стэк инфраструктуры
- **Compute**: Docker / Docker Compose.
- **Database**: PostgreSQL 16+.
- **Cache/Session**: Redis (для кэширования, rate-limiting и presence-статусов).
- **Mail**: Resend (API).
- **Storage**: S3-совместимое хранилище (Selectel, AWS, Minio).

## 2. Настройка сервисов

### Resend (Email)
1. Получите API Key в панели управления Resend.
2. Добавьте и верифицируйте DNS-записи для вашего домена (SPF, DKIM).
3. Укажите в `.env`: `RESEND_API_KEY=re_***`.

### S3 Storage (Файлы и макеты)
1. Создайте Bucket (режим Public Read).
2. Настройте CORS для вашего домена:
   ```json
   [
     {
       "AllowedOrigins": ["https://ваш-домен.ru"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```
3. Параметры в `.env`:
   - `S3_ACCESS_KEY` / `S3_SECRET_KEY`
   - `S3_ENDPOINT`
   - `S3_BUCKET`

## 3. Docker Compose (Production)

В проекте используется автоматизированное развертывание (`deploy_production.md` или `smart_push`). На сервере выполняется сборка образа и запуск контейнеров с ключом `--force-recreate`.

Запуск вручную на сервере (через SSH):
```bash
docker build -t ghcr.io/merch-crm/merch-crm:latest . && docker compose up -d --force-recreate
```

### Пример переменных окружения (.env.production / .env):
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/merch_crm
REDIS_HOST=redis-server-url
REDIS_PASSWORD=***

# Better Auth Configuration
BETTER_AUTH_URL=https://merch-crm.ваш-домен.ru
BETTER_AUTH_SECRET=long-random-string

# Безопасность (API-ключ для внутреннего Presence Service)
PRESENCE_SERVICE_API_KEY=16-chars-long-secure-key
```

## 4. Обновление и миграции
При обновлении кода необходимо запустить миграции базы данных:
```bash
npx drizzle-kit migrate
```

## 5. Мониторинг
Логи приложения доступны через `docker logs -f merch-crm-app`. Критические ошибки бэкенда также сохраняются в таблицу `api_error_logs`.

---
[[Merch-CRM|Назад к оглавлению]]
