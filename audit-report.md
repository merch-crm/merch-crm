# 🔍 MerchCRM Audit Report

**Дата:** 02.03.2026, 16:16:07
**Время:** 9369ms

## ⛔ Здоровье: F (5/100)

**Критическое состояние**

### Рекомендации
- Исправь 17 критических ошибок
- Мигрируй локальные типы в lib/types
- СРОЧНО: 17 проблем безопасности

## 📊 Статистика

| Метрика | Значение |
|---------|----------|
| Файлов | 842 |
| Строк | 99,600 |
| Размер | 4.2 MB |
| Страниц | 41 |
| Компонентов | 193 |
| API роутов | 10 |
| Тестов | 115 |
| Таблиц БД | 31 |
| Миграций | 18 |

### По категориям

| Категория | Количество |
|-----------|------------|
| Типизация | 46 |
| Безопасность | 17 |
| Импорты | 4 |
| Компоненты | 2 |
| Null Safety | 1 |
| Доступность | 1 |
| Именование | 1 |
| Медиа | 1 |
| Запросы | 1 |
| Плюрализация | 1 |

## 🔴 Критические (17)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [tests/admin/admin.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/admin/admin.test.ts#L150) | 150 | Безопасность | Харкод пароля |
| [tests/auth/login.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/auth/login.test.ts#L65) | 65 | Безопасность | Харкод пароля |
| [tests/auth/login.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/auth/login.test.ts#L73) | 73 | Безопасность | Харкод пароля |
| [tests/auth/login.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/auth/login.test.ts#L84) | 84 | Безопасность | Харкод пароля |
| [tests/auth/login.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/auth/login.test.ts#L100) | 100 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L132) | 132 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L132) | 132 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L132) | 132 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L138) | 138 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L138) | 138 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L138) | 138 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L147) | 147 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L147) | 147 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L147) | 147 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L155) | 155 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L155) | 155 | Безопасность | Харкод пароля |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L155) | 155 | Безопасность | Харкод пароля |

## 🟠 Ошибки (48)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [app/(main)/dashboard/knowledge-base/wiki-client.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/knowledge-base/wiki-client.test.tsx#L72) | 72 | Типизация | Приведение к any запрещено |
| [app/(main)/dashboard/knowledge-base/wiki-client.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/knowledge-base/wiki-client.test.tsx#L89) | 89 | Типизация | Приведение к any запрещено |
| [app/(main)/dashboard/knowledge-base/wiki-client.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/knowledge-base/wiki-client.test.tsx#L104) | 104 | Типизация | Приведение к any запрещено |
| [app/(main)/dashboard/orders/new/page-client.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/orders/new/page-client.test.tsx#L72) | 72 | Типизация | Приведение к any запрещено |
| [app/(main)/dashboard/orders/new/page-client.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/orders/new/page-client.test.tsx#L130) | 130 | Типизация | Приведение к any запрещено |
| [app/(main)/dashboard/orders/new/page-client.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/orders/new/page-client.test.tsx#L141) | 141 | Типизация | Приведение к any запрещено |
| [tests/admin/admin.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/admin/admin.test.ts#L19) | 19 | Типизация | Тип any запрещён |
| [tests/admin/admin.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/admin/admin.test.ts#L28) | 28 | Типизация | Тип any запрещён |
| [tests/admin/admin.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/admin/admin.test.ts#L44) | 44 | Типизация | Тип any запрещён |
| [tests/admin/admin.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/admin/admin.test.ts#L58) | 58 | Типизация | Тип any запрещён |
| [tests/admin/admin.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/admin/admin.test.ts#L60) | 60 | Типизация | Тип any запрещён |
| [tests/admin/admin.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/admin/admin.test.ts#L83) | 83 | Типизация | Тип any запрещён |
| [tests/admin/admin.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/admin/admin.test.ts#L194) | 194 | Типизация | Приведение к any запрещено |
| [tests/dashboard/clients.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/clients.test.ts#L67) | 67 | Типизация | Приведение к any запрещено |
| [tests/dashboard/clients.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/clients.test.ts#L74) | 74 | Типизация | Приведение к any запрещено |
| [tests/dashboard/clients.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/clients.test.ts#L75) | 75 | Типизация | Приведение к any запрещено |
| [tests/dashboard/clients.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/clients.test.ts#L76) | 76 | Типизация | Приведение к any запрещено |
| [tests/dashboard/clients.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/clients.test.ts#L143) | 143 | Типизация | Приведение к any запрещено |
| [tests/dashboard/clients.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/clients.test.ts#L144) | 144 | Типизация | Приведение к any запрещено |
| [tests/dashboard/clients.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/clients.test.ts#L175) | 175 | Типизация | Приведение к any запрещено |
| [tests/dashboard/clients.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/clients.test.ts#L215) | 215 | Типизация | Приведение к any запрещено |
| [tests/dashboard/finance.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/finance.test.ts#L60) | 60 | Типизация | Приведение к any запрещено |
| [tests/dashboard/finance.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/finance.test.ts#L61) | 61 | Типизация | Приведение к any запрещено |
| [tests/dashboard/finance.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/finance.test.ts#L62) | 62 | Типизация | Приведение к any запрещено |
| [tests/dashboard/finance.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/finance.test.ts#L63) | 63 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L12) | 12 | Типизация | Тип any запрещён |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L20) | 20 | Типизация | Тип any запрещён |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L95) | 95 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L103) | 103 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L104) | 104 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L105) | 105 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L140) | 140 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L192) | 192 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L207) | 207 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L237) | 237 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L288) | 288 | Типизация | Приведение к any запрещено |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L314) | 314 | Типизация | Приведение к any запрещено |
| [tests/dashboard/production.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/production.test.ts#L54) | 54 | Типизация | Приведение к any запрещено |
| [tests/dashboard/production.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/production.test.ts#L55) | 55 | Типизация | Приведение к any запрещено |
| [tests/dashboard/production.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/production.test.ts#L56) | 56 | Типизация | Приведение к any запрещено |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L67) | 67 | Типизация | Приведение к any запрещено |
| [tests/dashboard/profile.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/profile.test.ts#L68) | 68 | Типизация | Приведение к any запрещено |
| [tests/dashboard/tasks.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/tasks.test.ts#L63) | 63 | Типизация | Приведение к any запрещено |
| [tests/dashboard/tasks.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/tasks.test.ts#L64) | 64 | Типизация | Приведение к any запрещено |
| [tests/dashboard/tasks.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/tasks.test.ts#L65) | 65 | Типизация | Приведение к any запрещено |
| [tests/dashboard/tasks.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/tasks.test.ts#L66) | 66 | Типизация | Приведение к any запрещено |
| [app/(main)/dashboard/clients/components/client-filter-panel.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/clients/components/client-filter-panel.test.tsx#L10) | 10 | Компоненты | Нативный <select> запрещён |
| [app/(main)/dashboard/orders/new/page-client.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/orders/new/page-client.test.tsx#L43) | 43 | Компоненты | Нативный <select> запрещён |

## 🟡 Предупреждения (2)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [tests/dashboard/warehouse.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/warehouse.test.ts#L169) | 169 | Null Safety | Потенциальный null: data |
| [app/(main)/dashboard/warehouse/recent-transactions.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/warehouse/recent-transactions.test.tsx#L9) | 9 | Медиа | Используй next/image вместо <img> |

## 🔵 Информация (8)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [app/(main)/dashboard/tasks/kanban-board.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/tasks/kanban-board.test.tsx#L15) | 15 | Доступность | Кнопка без type |
| [app/(main)/dashboard/warehouse/categories/[id]/hooks/use-category-detail.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/warehouse/categories/[id]/hooks/use-category-detail.test.ts#L5) | 5 | Импорты | Глубокий относительный импорт |
| [app/(main)/dashboard/warehouse/categories/[id]/hooks/use-category-detail.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/warehouse/categories/[id]/hooks/use-category-detail.test.ts#L6) | 6 | Импорты | Глубокий относительный импорт |
| [app/(main)/dashboard/warehouse/categories/[id]/hooks/use-category-detail.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/warehouse/categories/[id]/hooks/use-category-detail.test.ts#L7) | 7 | Импорты | Глубокий относительный импорт |
| [app/(main)/dashboard/warehouse/categories/[id]/hooks/use-category-detail.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/warehouse/categories/[id]/hooks/use-category-detail.test.ts#L9) | 9 | Импорты | Глубокий относительный импорт |
| [app/(main)/dashboard/clients/components/client-filter-panel.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/clients/components/client-filter-panel.test.tsx) | - | Именование | Нестандартное имя: client-filter-panel.test.tsx |
| [tests/dashboard/orders.test.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/tests/dashboard/orders.test.ts#L131) | 131 | Запросы | Запрос без limit (findMany) |
| [components/ui/select.test.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/components/ui/select.test.tsx#L47) | 47 | Плюрализация | Возможно жестко задано склонение |

