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

## 3. GitHub Actions & CI/CD
Развертывание полностью автоматизировано:
- **CI Checks**: При открытии PR запускаются линтинг, типизация и тесты (`.github/workflows/ci.yml`). Merged-блокировка при неуспехе.
- **CD Deploy**: При пуше в `main` автоматически собираются Docker-образы (`app` и `migrator`) и отправляются в Registry. После чего сервер обновляется через SSH (`.github/workflows/deploy.yml`).

## 4. Обновление и миграции
Миграции применяются автоматически при каждом деплое через **Init-контейнер**.

1. **Migrator-контейнер**: Перед запуском приложения стартует образ `ghcr.io/merch-crm/merch-crm-migrator`.
2. **Логика**: Сервис использует `npx tsx scripts/db-migrate.ts` для применения новых SQL-файлов.
3. **Безопасность**: Приложение не запустится, если миграция завершилась ошибкой.

Логи миграций: `docker logs merch-crm-migrate`

## 5. Мониторинг
Логи приложения доступны через `docker logs -f merch-crm-app`. Критические ошибки бэкенда также сохраняются в таблицу `api_error_logs`.

---
[[Merch-CRM|Назад к оглавлению]]
