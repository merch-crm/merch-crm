# Настройка системы учёта рабочего времени

## Требования

- Docker и Docker Compose
- NVIDIA GPU с драйверами (опционально, для ускорения)
- Камеры Xiaomi, подключённые к Mi Home

## Установка

### 1. Переменные окружения

Добавьте в `.env`:

```env
# Ключ для Python-сервиса
PRESENCE_SERVICE_API_KEY=your-secret-key-here

# URL сервиса распознавания
FACE_RECOGNITION_URL=http://localhost:8001
```

### 2. Миграция базы данных

```bash
npm run db:migrate
```

### 3. Запуск сервисов

```bash
docker-compose -f docker-compose.presence.yml up -d
```

### 4. Проверка

- **go2rtc**: [http://localhost:1984](http://localhost:1984)
- **Face Recognition API**: [http://localhost:8001/health](http://localhost:8001/health)
