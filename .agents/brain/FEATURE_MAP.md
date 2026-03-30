# 🗺️ Feature Map — Карта связей MerchCRM

> Визуализация того, как блоки системы взаимодействуют между собой. Используйте [[Graph View]] в Obsidian для навигации.

## 🔗 Основные потоки данных
- **Заказы (Orders)** <-> **Инвентарь (Inventory)**: Резервирование через атомарный SQL запрос. Проверка остатков в `inventory.service.ts`.
- **CRM (Clients)** <-> **Заказы (Orders)**: История покупок, расчет среднего чека, лояльность.
- **Дизайн (Design Studio)** <-> **Расчеты (Calculators)**: Студия дизайна использует DTF калькулятор для оценки стоимости роля.

## 🏗️ Архитектурные слои
1. **Views (UI)**: React Components + Server Actions.
2. **Logic (Services)**: `lib/services/` — чистая бизнес-логика.
3. **Data (Schema)**: Drizzle ORM — структура таблиц и связей.

## 📍 Точки входа
- `/dashboard` — Главный экран.
- `/dashboard/design` — Студия дизайна (Modern Industrial Craft).
- `/dashboard/orders` — Управление заказами.

---
[[INDEX.md]] | [[BUSINESS_LOGIC.md]]
