# 🔍 MerchCRM Audit Report

**Дата:** 04.03.2026, 00:51:15
**Время:** 10273ms

## 🟢 Здоровье: A (97/100)

**Отличное состояние**

### Рекомендации
- Оптимизируй работу с БД

## 📊 Статистика

| Метрика | Значение |
|---------|----------|
| Файлов | 769 |
| Строк | 101 341 |
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
| Тесты | 10 |
| Запросы | 10 |
| Server Actions | 5 |
| Производительность | 4 |
| Размер компонента | 3 |
| Доступность | 1 |
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
| [app/(staff)/staff/cameras/cameras.actions.ts](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/cameras/cameras.actions.ts#L187) | 187 | Запросы | Возможная N+1 проблема |

## 🔵 Информация (25)

| Файл | Строка | Категория | Сообщение |
|------|--------|-----------|----------|
| [app/(main)/dashboard/warehouse/storage-locations-tab.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/warehouse/storage-locations-tab.tsx) | - | Производительность | Файл длинный: 533 строк |
| [app/(staff)/staff/cameras/cameras-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/cameras/cameras-client.tsx) | - | Производительность | Файл длинный: 624 строк |
| [app/(staff)/staff/employees/employees-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/employees/employees-client.tsx) | - | Производительность | Файл длинный: 558 строк |
| [app/(staff)/staff/reports/reports-client.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(staff)/staff/reports/reports-client.tsx) | - | Производительность | Файл длинный: 552 строк |
| [app/(main)/dashboard/warehouse/storage-locations-tab.tsx](file:///Users/leonidmolchanov/Desktop/merch-crm/app/(main)/dashboard/warehouse/storage-locations-tab.tsx#L513) | 513 | Доступность | Кликабельный div |
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

