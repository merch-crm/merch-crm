---
description: Startup routine to initialize SSH tunnel to remote Docker DB and start Next.js dev server.
---

// turbo-all

> **ВАЖНО:** Общение с пользователем, комментарии и отчеты — ТОЛЬКО на **русском языке**.

> **ВАЖНОЕ ПРАВИЛО:** Всегда используйте этот workflow или скрипт `./scripts/dev.sh`. 
> **Почему это важно:** Ваше приложение настроено на `localhost:5432`. Без SSH-туннеля эта "дверь" либо закрыта, либо ведет к вашей локальной пустой БД с другим паролем. Туннель перенаправляет этот адрес на реальный сервер <PROD_IP>.

1. Очистка старых туннелей и порта 5432.
```bash
killall autossh 2>/dev/null || true
lsof -ti:5432 | xargs kill -9 2>/dev/null || true
lsof -ti:6379 | xargs kill -9 2>/dev/null || true
```

2. Установка SSH-туннеля к удаленному серверу (<PROD_IP>).
> **Важно:** Идет автовосстановление через autossh.
```bash
REDIS_IP=$(ssh -i ~/.ssh/antigravity_key root@<PROD_IP> "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' merch-crm-redis 2>/dev/null" || echo "127.0.0.1") && AUTOSSH_GATETIME=0 autossh -M 0 -i ~/.ssh/antigravity_key -o "ServerAliveInterval=30" -o "ServerAliveCountMax=3" -o "ExitOnForwardFailure=yes" -f -N -L 5432:127.0.0.1:5432 -L 6379:${REDIS_IP}:6379 root@<PROD_IP> && sleep 1
```

3. **Синхронизация пароля:** Принудительно устанавливаем пароль 'postgres' в Docker-контейнере, чтобы он всегда совпадал с вашим .env.local.
```bash
ssh -i ~/.ssh/antigravity_key root@<PROD_IP> "docker exec merch-crm-db psql -U postgres -c \"ALTER USER postgres WITH PASSWORD '<DB_PASSWORD>';\""
```

4. **Синхронизация файлов с продакшна** (изображения SKU, аватары, логотип брендинга).
> Папка `local-storage/` в `.gitignore`, файлы хранятся только на продакшн-сервере. Без этого шага все изображения будут 404.
```bash
mkdir -p local-storage && rsync -az -e "ssh -i ~/.ssh/antigravity_key" root@<PROD_IP>:/root/merch-crm/local-storage/ ./local-storage/
```

5. Проверка подключения к базе данных.
```bash
node scripts/check-connection.js
```

6. Запуск сервера разработки.
> **ВАЖНО ДЛЯ АГЕНТА:** Команда `npm run dev` или скрипт `dev.sh` запускает процесс сервера, который НИКОГДА не завершается. Ты **НЕ ДОЛЖЕН** ждать завершения этой команды. Выполни её асинхронно в фоне (установи минимальный `WaitMsBeforeAsync`) и **сразу переходи к Шагу 7**. Не зависай в ожидании статуса "done"!
```bash
npm run dev
```

7. Анализ контекста и документации (Код + Obsidian).
> **КРИТИЧЕСКИ ВАЖНО:** Этот шаг обязателен для выполнения сразу после запуска сервера. Агент **ДОЛЖЕН** изучить структуру `.agents/`, прочитать стандарты и просканировать `vault/`, чтобы понимать текущие архитектурные решения, правила UI и роли других агентов. Без этого шага агент не сможет работать эффективно и в соответствии с правилами проекта.
1. Изучите структуру папки агента и стандарты:
```bash
ls -F .agents/ && cat .agents/UX_STANDARDS.md .agents/development_standards.md
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
