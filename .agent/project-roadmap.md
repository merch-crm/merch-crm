# MerchCRM Project Roadmap

Tracking progress and defining the future of the system.

## 🟢 Module 1: Foundation (COMPLETED)
- [x] Basic Auth & JWT session management.
- [x] Role-based access (Administrator vs Staff).
- [x] Dashboard shell with custom Sidebar/Header.
- [x] Audit Logging for critical actions.

## 🟢 Module 2: Warehouse & Stock (COMPLETED/REFINED)
- [x] Inventory Items & Categories management.
- [x] Storage Locations & per-location stock tracking.
- [x] Warehouse History with Search/Filters.
- [x] Single-row Transfer logic with Audit Trail.
- [x] Premium Admin controls (Bulk delete, Clear history).

## 🟡 Module 3: Client & Order Management (IN PROGRESS)
- [ ] Refined Client cards (History of orders, individual pricing).
- [ ] Order Creation Workflow:
    - [ ] Dynamic item selection from Warehouse.
    - [ ] Real-time stock reservation.
    - [ ] Status tracking (New -> Designer -> Production -> Done).

## 🔴 Module 4: Integrations (PLANNED)
- [ ] CDEK: Shipping label generation and tracking syncing.
- [ ] Telegram/WhatsApp: Auto-notifications for clients.
- [ ] Telegram Bot: Rapid reporting for production employees.

---

## 🚀 BACKLOG / IDEAS
*(Add new items here and move them to Modules when prioritized)*

- **Inventory Barcode**: Генерация и сканирование QR/баркодов для быстрой инвентаризации и перемещений.
- **Audit Diff**: Отображение точных изменений (старое значение vs новое) в журнале аудита.
- **Bulk Import**: Импорт товаров и остатков из Excel/CSV для быстрой настройки.
- **UI**: Поддержка Темной темы (Dark Mode).
- **Reporting**: Еженедельные PDF-отчеты по остаткам для руководства.
- **Tasks**: Авто-создание задачи, если остаток товара упал ниже критического уровня.
