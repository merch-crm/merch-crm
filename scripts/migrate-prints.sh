#!/bin/bash

echo "🚀 Запуск миграции для коллекций принтов..."

# Генерация миграции
echo "📝 Генерация файла миграции..."
npx drizzle-kit generate

# Применение миграции
echo "⚡ Применение миграции..."
npx drizzle-kit migrate

echo "✅ Миграция завершена!"

# Опционально: push для dev окружения
# npx drizzle-kit push
