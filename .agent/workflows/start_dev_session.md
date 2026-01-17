---
description: Startup routine to initialize SSH tunnel to remote Docker DB and start Next.js dev server.
---

// turbo-all

> **ВАЖНОЕ ПРАВИЛО:** Всегда используйте этот workflow или скрипт `./dev.sh` для работы. Это гарантирует подключение к актуальной базе данных на сервере. Прямой запуск `npm run dev` может привести к работе с пустой локальной базой и потере данных.

1. Clean up existing tunnels and clear port 5432.
```bash
lsof -ti:5432 | xargs kill -9 2>/dev/null || true
```

2. Establish a background SSH tunnel to the remote server (89.104.69.25). 
This links the remote Postgres in Docker to your local port 5432.
We add a small sleep to ensure the tunnel is fully established before the next step.
```bash
ssh -i ~/.ssh/antigravity_key -f -N -L 5432:127.0.0.1:5432 root@89.104.69.25 && sleep 1
```

3. Verify database connectivity using the local environment settings.
```bash
node scripts/check-connection.js
```

4. Start the development server.
```bash
npm run dev
```

