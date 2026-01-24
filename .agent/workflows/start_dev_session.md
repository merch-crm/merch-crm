---
description: Startup routine to initialize SSH tunnel to remote Docker DB and start Next.js dev server.
---

// turbo-all

> **ВАЖНОЕ ПРАВИЛО:** Всегда используйте этот workflow или скрипт `./dev.sh`. 
> **Почему это важно:** Ваше приложение настроено на `localhost:5432`. Без SSH-туннеля эта "дверь" либо закрыта, либо ведет к вашей локальной пустой БД с другим паролем. Туннель перенаправляет этот адрес на реальный сервер 89.104.69.25.

1. Очистка старых туннелей и порта 5432.
```bash
lsof -ti:5432 | xargs kill -9 2>/dev/null || true
```

2. Установка SSH-туннеля к удаленному серверу (89.104.69.25).
```bash
ssh -i ~/.ssh/antigravity_key -f -N -L 5432:127.0.0.1:5432 root@89.104.69.25 && sleep 1
```

3. **Синхронизация пароля:** Принудительно устанавливаем пароль 'postgres' в Docker-контейнере, чтобы он всегда совпадал с вашим .env.local.
```bash
ssh -i ~/.ssh/antigravity_key root@89.104.69.25 "docker exec merch-crm-db psql -U postgres -c \"ALTER USER postgres WITH PASSWORD 'da1c8fe9f308039384edeecbe252fdda51f305d59cae0c94';\""
```

4. Проверка подключения к базе данных.
```bash
node scripts/check-connection.js
```

5. Запуск сервера разработки.
```bash
npm run dev
```

