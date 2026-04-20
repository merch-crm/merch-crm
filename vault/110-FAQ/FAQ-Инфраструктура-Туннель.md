---
tags: [faq, infra, troubleshooting, ssh, redis]
---

# 🔧 Исправление ошибок Redis (ECONNRESET) и SSH-туннеля

## ❓ Проблема
При запуске `npm run dev` или в процессе работы в логах (`dev.log`) появляются ошибки:
- `Connection error: ECONNRESET`
- `MaxRetriesPerRequestError: Reached maximum number of retries`
- Интерфейс `localhost:3000` зависает или отдает 500 ошибку.

## 🛠️ Причина
Соединение с удаленным сервером (89.104.69.25) через SSH-туннель было разорвано или процесс `autossh` завис («зомби-процесс»).

## ✅ Решение

### Способ 1: Полный перезапуск (Рекомендуемый)
Запустите команду в корне проекта:
```bash
npm run dev:ssh
```

### Способ 2: Ручная очистка и запуск
Если автоматика не помогает, выполните:
1. Остановите все SSH-процессы:
   ```bash
   killall autossh ssh
   ```
2. Запустите настройку туннеля вручную:
   ```bash
   node scripts/setup-ssh-tunnel.mjs
   ```

## 🔍 Проверка
После запуска проверьте статус соединения к БД:
```bash
node scripts/check-connection.js
```
Если команда завершилась без ошибок (exit code 0), туннель исправен.

---
[[FAQ|Назад к FAQ]]
