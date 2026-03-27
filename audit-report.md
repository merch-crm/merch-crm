# 🔍 MerchCRM Audit Report

**Дата:** 27.03.2026, 23:33:38
**Время:** 24182ms

## 🟢 Здоровье: A (98/100)

**Отличное состояние**

### Рекомендации
- Мигрируй локальные типы в lib/types

## 📊 Статистика

| Метрика | Значение |
|---------|----------|
| Файлов | 1564 |
| Строк | 213 882 |
| Размер | 8.5 MB |
| Страниц | 90 |
| Компонентов | 233 |
| API роутов | 37 |
| Тестов | 246 |
| Таблиц БД | 90 |
| Миграций | 39 |

### По категориям

| Категория | Количество |
|-----------|------------|
| Тесты | 12 |
| ESLint | 6 |
| Типизация | 5 |
| Security Headers | 4 |

## 🟠 Ошибки (5)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [lib/actions/calculators/files.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/lib/actions/calculators/files.ts#L284) | 284 | Типизация | Тип any запрещён |
| [repro_upload.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/repro_upload.ts#L12) | 12 | Типизация | Приведение к any запрещено |
| [repro_upload.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/repro_upload.ts#L26) | 26 | Типизация | Приведение к any запрещено |
| [test-db-insert.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/test-db-insert.ts#L22) | 22 | Типизация | Тип any запрещён |
| [test-db-insert.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/test-db-insert.ts#L16) | 16 | Типизация | Приведение к any запрещено |

## 🟡 Предупреждения (9)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [/Users/leonidmolchanov/Desktop/merch-crm/lib/actions/calculators/files.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/lib/actions/calculators/files.ts#L284) | 284 | ESLint | Unexpected any. Specify a different type. |
| [/Users/leonidmolchanov/Desktop/merch-crm/repro_upload.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/repro_upload.ts#L12) | 12 | ESLint | Unexpected any. Specify a different type. |
| [/Users/leonidmolchanov/Desktop/merch-crm/repro_upload.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/repro_upload.ts#L26) | 26 | ESLint | Unexpected any. Specify a different type. |
| [/Users/leonidmolchanov/Desktop/merch-crm/test-db-insert.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/test-db-insert.ts#L4) | 4 | ESLint | 'uuidv4' is defined but never used. Allowed unused vars must match /^_/u. |
| [/Users/leonidmolchanov/Desktop/merch-crm/test-db-insert.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/test-db-insert.ts#L16) | 16 | ESLint | Unexpected any. Specify a different type. |
| [/Users/leonidmolchanov/Desktop/merch-crm/test-db-insert.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/test-db-insert.ts#L22) | 22 | ESLint | Unexpected any. Specify a different type. |
| [next.config.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/next.config.ts) | - | Security Headers | Отсутствует заголовок: X-Frame-Options - Заголовок безопасности X-Frame-Options не настроен в Next.js конфигурации. |
| [next.config.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/next.config.ts) | - | Security Headers | Отсутствует заголовок: X-Content-Type-Options - Заголовок безопасности X-Content-Type-Options не настроен в Next.js конфигурации. |
| [next.config.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/next.config.ts) | - | Security Headers | Отсутствует заголовок: Strict-Transport-Security - Заголовок безопасности Strict-Transport-Security не настроен в Next.js конфигурации. |

## 🔵 Информация (13)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [next.config.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/next.config.ts) | - | Security Headers | Отсутствует заголовок: Content-Security-Policy - Заголовок безопасности Content-Security-Policy не настроен в Next.js конфигурации. |
| [app/(main)/dashboard/production/calculators/hooks/use-calculation-history.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-calculation-history.ts) | - | Тесты | Нет теста для use-calculation-history |
| [app/(main)/dashboard/production/calculators/hooks/use-calculator-settings.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-calculator-settings.ts) | - | Тесты | Нет теста для use-calculator-settings |
| [app/(main)/dashboard/production/calculators/hooks/use-calculator.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-calculator.ts) | - | Тесты | Нет теста для use-calculator |
| [app/(main)/dashboard/production/calculators/hooks/use-consumables-config.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-consumables-config.ts) | - | Тесты | Нет теста для use-consumables-config |
| [app/(main)/dashboard/production/calculators/hooks/use-consumables-draft.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-consumables-draft.ts) | - | Тесты | Нет теста для use-consumables-draft |
| [app/(main)/dashboard/production/calculators/hooks/use-design-files.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-design-files.ts) | - | Тесты | Нет теста для use-design-files |
| [app/(main)/dashboard/production/calculators/hooks/use-layout-optimizer.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-layout-optimizer.ts) | - | Тесты | Нет теста для use-layout-optimizer |
| [app/(main)/dashboard/production/calculators/hooks/use-pdf-generator.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-pdf-generator.ts) | - | Тесты | Нет теста для use-pdf-generator |
| [app/(main)/dashboard/production/calculators/hooks/use-placements-management.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-placements-management.ts) | - | Тесты | Нет теста для use-placements-management |
| [app/(main)/dashboard/production/calculators/hooks/use-placements.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-placements.ts) | - | Тесты | Нет теста для use-placements |
| [app/(main)/dashboard/production/calculators/hooks/use-urgency-settings.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-urgency-settings.ts) | - | Тесты | Нет теста для use-urgency-settings |
| [app/(main)/dashboard/production/calculators/hooks/use-warehouse-items.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/production/calculators/hooks/use-warehouse-items.ts) | - | Тесты | Нет теста для use-warehouse-items |

