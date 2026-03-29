#!/bin/bash
set -e

echo "🚀 Запуск стабильности перед деплоем (Pre-push check)..."

# 1. Проверка типов
echo "📌 Шаг 1: Проверка типов TypeScript..."
npx tsc --noEmit

# 2. Проверка линтера
echo "📌 Шаг 2: Проверка ESLint..."
npm run lint

# 3. Запуск тестов
echo "📌 Шаг 3: Запуск Unit и Integration тестов (Vitest)..."
npm run test -- --run

# 4. Проверка билда
echo "📌 Шаг 4: Тестовая сборка Next.js..."
npm run build

echo "✅ Стабильность подтверждена! Код готов к пушу на GitHub."
