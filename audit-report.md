# 🔍 MerchCRM Audit Report

**Дата:** 04.03.2026, 00:44:20
**Время:** 11261ms

## 🟢 Здоровье: A (95/100)

**Отличное состояние**

### Рекомендации
- Оптимизируй работу с БД

## 📊 Статистика

| Метрика | Значение |
|---------|----------|
| Файлов | 769 |
| Строк | 101 329 |
| Размер | 4.3 MB |
| Страниц | 47 |
| Компонентов | 197 |
| API роутов | 18 |
| Тестов | 115 |
| Таблиц БД | 39 |
| Миграций | 19 |

### По категориям

| Категория | Количество |
|-----------|------------|
| Запросы | 16 |
| Тесты | 10 |
| Доступность | 9 |
| Server Actions | 5 |
| Производительность | 4 |
| Размер компонента | 3 |
| Env | 2 |
| База данных | 2 |
| Плюрализация | 1 |

## 🟡 Предупреждения (9)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [app/(staff)/staff/cameras/cameras.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/cameras/cameras.actions.ts) | - | Server Actions | Нет zod валидации |
| [app/(staff)/staff/employees/employees.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees.actions.ts) | - | Server Actions | Нет zod валидации |
| [app/(staff)/staff/reports/reports.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/reports/reports.actions.ts) | - | Server Actions | Нет zod валидации |
| [app/(staff)/staff/settings/settings.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/settings/settings.actions.ts) | - | Server Actions | Нет zod валидации |
| [app/(staff)/staff/workstations/workstations.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/workstations/workstations.actions.ts) | - | Server Actions | Нет zod валидации |
| [app/(staff)/staff/cameras/cameras-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/cameras/cameras-client.tsx) | - | Размер компонента | Много useState: 9 |
| [app/(staff)/staff/employees/employees-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees-client.tsx) | - | Размер компонента | Много useState: 8 |
| [components/staff/zone-editor.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/components/staff/zone-editor.tsx) | - | Размер компонента | Много useState: 12 |
| [app/(staff)/staff/cameras/cameras.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/cameras/cameras.actions.ts#L186) | 186 | Запросы | Возможная N+1 проблема |

## 🔵 Информация (43)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [app/(main)/dashboard/warehouse/storage-locations-tab.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/warehouse/storage-locations-tab.tsx) | - | Производительность | Файл длинный: 533 строк |
| [app/(staff)/staff/cameras/cameras-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/cameras/cameras-client.tsx) | - | Производительность | Файл длинный: 624 строк |
| [app/(staff)/staff/employees/employees-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees-client.tsx) | - | Производительность | Файл длинный: 555 строк |
| [app/(staff)/staff/reports/reports-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/reports/reports-client.tsx) | - | Производительность | Файл длинный: 551 строк |
| [app/(main)/dashboard/warehouse/storage-locations-tab.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/warehouse/storage-locations-tab.tsx#L513) | 513 | Доступность | Кликабельный div |
| [app/(staff)/staff/employees/employees-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees-client.tsx#L366) | 366 | Доступность | Кнопка без type |
| [app/(staff)/staff/employees/employees-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees-client.tsx#L374) | 374 | Доступность | Кнопка без type |
| [app/(staff)/staff/employees/employees-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees-client.tsx#L393) | 393 | Доступность | Кнопка без type |
| [app/(staff)/staff/reports/reports-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/reports/reports-client.tsx#L147) | 147 | Доступность | Кнопка без type |
| [components/staff/zone-editor.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/components/staff/zone-editor.tsx#L344) | 344 | Доступность | Кнопка без type |
| [components/staff/zone-editor.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/components/staff/zone-editor.tsx#L346) | 346 | Доступность | Кнопка без type |
| [components/staff/zone-editor.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/components/staff/zone-editor.tsx#L367) | 367 | Доступность | Кнопка без type |
| [components/staff/zone-editor.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/components/staff/zone-editor.tsx#L405) | 405 | Доступность | Кнопка без type |
| [app/api/presence/xiaomi/auth/route.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/api/presence/xiaomi/auth/route.ts#L23) | 23 | Env | NEXT_PUBLIC_ в серверном коде: NEXT_PUBLIC_APP_URL |
| [app/api/presence/xiaomi/callback/route.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/api/presence/xiaomi/callback/route.ts#L59) | 59 | Env | NEXT_PUBLIC_ в серверном коде: NEXT_PUBLIC_APP_URL |
| [app/(main)/staff/actions/cameras.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/cameras.actions.ts) | - | Тесты | Нет теста для cameras.actions |
| [app/(main)/staff/actions/faces.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/faces.actions.ts) | - | Тесты | Нет теста для faces.actions |
| [app/(main)/staff/actions/presence.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/presence.actions.ts) | - | Тесты | Нет теста для presence.actions |
| [app/(main)/staff/actions/settings.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/settings.actions.ts) | - | Тесты | Нет теста для settings.actions |
| [app/(main)/staff/actions/xiaomi.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/xiaomi.actions.ts) | - | Тесты | Нет теста для xiaomi.actions |
| [app/(staff)/staff/cameras/cameras.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/cameras/cameras.actions.ts) | - | Тесты | Нет теста для cameras.actions |
| [app/(staff)/staff/employees/employees.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees.actions.ts) | - | Тесты | Нет теста для employees.actions |
| [app/(staff)/staff/reports/reports.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/reports/reports.actions.ts) | - | Тесты | Нет теста для reports.actions |
| [app/(staff)/staff/settings/settings.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/settings/settings.actions.ts) | - | Тесты | Нет теста для settings.actions |
| [app/(staff)/staff/workstations/workstations.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/workstations/workstations.actions.ts) | - | Тесты | Нет теста для workstations.actions |
| [lib/schema/presence.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/lib/schema/presence.ts) | - | База данных | work_sessions.createdAt — возможно нужен индекс |
| [lib/schema/presence.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/lib/schema/presence.ts) | - | База данных | daily_work_stats.createdAt — возможно нужен индекс |
| [app/(main)/staff/actions/cameras.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/cameras.actions.ts#L22) | 22 | Запросы | Запрос без limit (findMany) |
| [app/(main)/staff/actions/faces.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/faces.actions.ts#L246) | 246 | Запросы | Запрос без limit (findMany) |
| [app/(main)/staff/actions/faces.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/faces.actions.ts#L270) | 270 | Запросы | Запрос без limit (findMany) |
| [app/(main)/staff/actions/presence.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/presence.actions.ts#L163) | 163 | Запросы | Запрос без limit (findMany) |
| [app/(main)/staff/actions/presence.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/staff/actions/presence.actions.ts#L76) | 76 | Запросы | Несколько мутаций в одной функции без транзакции |
| [app/(staff)/staff/cameras/cameras.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/cameras/cameras.actions.ts#L48) | 48 | Запросы | Запрос без limit (findMany) |
| [app/(staff)/staff/employees/employees.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees.actions.ts#L21) | 21 | Запросы | Запрос без limit (findMany) |
| [app/(staff)/staff/employees/employees.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees.actions.ts#L69) | 69 | Запросы | Запрос без limit (findMany) |
| [app/(staff)/staff/employees/employees.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees.actions.ts#L78) | 78 | Запросы | Запрос без limit (findMany) |
| [app/(staff)/staff/reports/reports.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/reports/reports.actions.ts#L36) | 36 | Запросы | Запрос без limit (findMany) |
| [app/(staff)/staff/reports/reports.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/reports/reports.actions.ts#L120) | 120 | Запросы | Запрос без limit (findMany) |
| [app/(staff)/staff/reports/reports.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/reports/reports.actions.ts#L247) | 247 | Запросы | Запрос без limit (findMany) |
| [app/(staff)/staff/workstations/workstations.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/workstations/workstations.actions.ts#L21) | 21 | Запросы | Запрос без limit (findMany) |
| [app/(staff)/staff/workstations/workstations.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/workstations/workstations.actions.ts#L64) | 64 | Запросы | Запрос без limit (findMany) |
| [app/api/presence/cameras/status/route.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/api/presence/cameras/status/route.ts#L17) | 17 | Запросы | Запрос без limit (findMany) |
| [app/(staff)/staff/cameras/cameras-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/cameras/cameras-client.tsx#L117) | 117 | Плюрализация | Возможно жестко задано склонение |

