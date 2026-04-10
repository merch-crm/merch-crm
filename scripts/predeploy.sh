set -e
export PATH=$PATH:/usr/local/bin:/opt/homebrew/bin

echo "🚀 Запуск стабильности перед деплоем (Pre-push check)..."

# 1. Проверка типов
echo "📌 Шаг 1: Проверка типов TypeScript..."
npx tsc --noEmit

# 2. Проверка линтера
echo "📌 Шаг 2: Проверка ESLint..."
npm run lint

# 3. Запуск тестов
echo "📌 Шаг 3: Запуск Unit-тестов..."
npm run test:unit

echo "📌 Шаг 3.1: Запуск Integration-тестов (последовательно)..."
npm run test:integration

# 4. Проверка билда
echo "📌 Шаг 4: Тестовая сборка Next.js..."
rm -rf .next
npm run build

# 5. Проверка схемы БД
echo "📌 Шаг 5: Проверка несинхронизированных изменений схемы БД (Drizzle)..."
DB_STATUS_BEFORE=$(git status --porcelain drizzle/ || true)
npx drizzle-kit generate
DB_STATUS_AFTER=$(git status --porcelain drizzle/ || true)

if [[ "$DB_STATUS_BEFORE" != "$DB_STATUS_AFTER" ]]; then
  echo "❌ Ошибка: Обнаружены изменения схемы базы данных (schema.ts), но миграции не были сгенерированы!"
  echo "Утилита Drizzle только что автоматически сгенерировала новые SQL-миграции в папке 'drizzle/'."
  echo "Пожалуйста, проверьте их (git status), добавьте (git add) и сделайте новый коммит."
  exit 1
fi

# 6. Синхронизация документации
echo "📌 Шаг 6: Синхронизация документации Obsidian..."
npx tsx scripts/sync-modules.ts

echo "✅ Стабильность подтверждена! Код готов к пушу на GitHub."
