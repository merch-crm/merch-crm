---
description: Startup routine to initialize SSH tunnel to remote Docker DB and start Next.js dev server.
---

// turbo-all

> **ВАЖНО:** Общение с пользователем, комментарии и отчеты — ТОЛЬКО на **русском языке**.

> **ВАЖНОЕ ПРАВИЛО:** Всегда используйте этот workflow или скрипт `./scripts/dev.sh`.
> **Почему это важно:** Ваше приложение настроено на `localhost:5432`. Без SSH-туннеля эта "дверь" либо закрыта, либо ведет к вашей локальной пустой БД с другим паролем. `setup-ssh-tunnel.mjs` динамически определяет IP Docker-контейнеров (`merch-crm-db`, `merch-crm-redis`) и пробрасывает туннель напрямую к ним — портыНа хосте сервера не публикуются.

1. Очистка старых туннелей и портов.
```bash
killall autossh 2>/dev/null || true
lsof -ti:5432 | xargs kill -9 2>/dev/null || true
lsof -ti:6379 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

2. Установка SSH-туннелей (DB + Redis) через адаптивный скрипт.
> **Важно:** Скрипт автоматически определяет IP Docker-контейнеров (`merch-crm-db` → DB IP, `merch-crm-redis` → Redis IP) и настраивает туннели напрямую к ним через autossh. Не использовать ручной autossh — Postgres в Docker **не публикует порт на хост сервера**.
```bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin && node scripts/setup-ssh-tunnel.mjs
```

3. **Синхронизация пароля:** Принудительно устанавливаем пароль из `.env.local` в Docker-контейнере.
```bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin && DB_PASSWORD=$(grep "^DATABASE_URL" .env.local | sed -E 's/.*postgres:([^@]*)@.*/\1/') && ssh -i ~/.ssh/antigravity_key -o StrictHostKeyChecking=no root@89.104.69.25 "docker exec merch-crm-db psql -U postgres -c \"ALTER USER postgres WITH PASSWORD '$DB_PASSWORD';\"" && echo "✅ Пароль синхронизирован"
```

4. **Синхронизация файлов с продакшна** (изображения SKU, аватары, логотип брендинга).
> Папка `local-storage/` в `.gitignore`, файлы хранятся только на продакшн-сервере. Без этого шага все изображения будут 404.
```bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin && mkdir -p local-storage && rsync -az -e "ssh -i ~/.ssh/antigravity_key -o StrictHostKeyChecking=no" root@89.104.69.25:/root/merch-crm/local-storage/ ./local-storage/ && echo "✅ local-storage синхронизирован"
```

5. Проверка подключения к базе данных.
```bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin && node scripts/check-connection.js
```

6. Запуск сервера разработки.
> **ВАЖНО ДЛЯ АГЕНТА:** Команда `npm run dev:quiet` запускает процесс сервера, который НИКОГДА не завершается. Ты **НЕ ДОЛЖЕН** ждать завершения этой команды. Выполни её асинхронно в фоне (WaitMsBeforeAsync=500) и **сразу переходи к Шагу 7**. Не зависай в ожидании статуса "done"!
```bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin && npm run dev:quiet
```

7. Анализ контекста и документации (Код + Obsidian).
> **КРИТИЧЕСКИ ВАЖНО:** Этот шаг обязателен для выполнения сразу после запуска сервера. Агент **ДОЛЖЕН** изучить структуру `.agents/`, прочитать стандарты и просканировать `vault/`, чтобы понимать текущие архитектурные решения, правила UI и роли других агентов.
1. Изучите структуру папки агента, стандарты и GEMINI.md:
```bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin && ls -F .agents/ && cat /Users/leonidmolchanov/.gemini/GEMINI.md .agents/UX_STANDARDS.md .agents/development_standards.md
```
2. Изучите структуру Obsidian Vault (база знаний о процессах и агентах):
```bash
ls -R vault/
```

3. **Обновление состояния проекта**:
```bash
DATE=$(date +"%Y-%m-%d")
sed -i '' "s/обновлено: .*/обновлено: $DATE/" vault/000-Навигация/Состояние-Проекта.md
```


---

### 📂 Локальное хранилище файлов

> Папка `local-storage/` синхронизируется с продакшна через `rsync` по SSH на шаге 4.
> Файлы НЕ коммитятся в git (в `.gitignore`). При первом запуске или при добавлении новых товаров на проде — нужно повторить rsync.

**Структура:**
- `local-storage/SKU/` — изображения товаров
- `local-storage/avatars/` — аватары пользователей
- `local-storage/branding/` — логотип, фавикон

**API-роут** `app/api/storage/local/[...path]/route.ts` читает файлы напрямую из этой папки.

---

### 🔧 Диагностика проблем с туннелем

Если `node scripts/check-connection.js` падает с `ECONNRESET`:
1. Проверить что autossh запущен: `ps aux | grep autossh`
2. Проверить IP Docker-контейнеров на сервере: `ssh -i ~/.ssh/antigravity_key root@89.104.69.25 "docker inspect merch-crm-db | grep IPAddress"`
3. Перезапустить туннель: `killall autossh; lsof -ti:5432 | xargs kill -9; node scripts/setup-ssh-tunnel.mjs`
4. **Если autossh не помогает** — использовать plain ssh напрямую к IP контейнера:
  `ssh -i ~/.ssh/antigravity_key -f -N -L 127.0.0.1:5432:<DB_CONTAINER_IP>:5432 root@89.104.69.25`
