# CRM: Схемы Взаимодействия Модулей

---

## 1. Глобальная Архитектура (Все модули)

```mermaid
flowchart TD
    Browser([Браузер / Сотрудник]) --> App[Next.js App Router]
    App --> SA[Server Actions]
    SA --> Auth[Better Auth\nСессия + Права]
    Auth -->|OK| BL[Бизнес-логика]
    Auth -->|Отказ| Err([Unauthorized])

    BL --> DB[(PostgreSQL\nDrizzle ORM)]
    BL --> Redis[(Redis\nКэш)]
    BL --> S3[(S3 Storage\nФайлы)]

    subgraph Modules [Модули системы]
        CLIENTS[Клиенты]
        ORDERS[Заказы]
        WAREHOUSE[Склад / WMS]
        FINANCE[Финансы]
        DESIGN[Дизайн-редактор]
        PRODUCTION[Производство]
        PRESENCE[Система Присутствия]
    end

    BL --> CLIENTS
    BL --> ORDERS
    BL --> WAREHOUSE
    BL --> FINANCE
    BL --> DESIGN
    BL --> PRODUCTION
    BL --> PRESENCE

    ORDERS -->|Резерв товара| WAREHOUSE
    ORDERS -->|Платёж| FINANCE
    ORDERS -->|Задача дизайнера| DESIGN
    ORDERS -->|Производственная задача| PRODUCTION
    DESIGN -->|Макет в хранилище| S3
    PRODUCTION -->|Брак → Списание| WAREHOUSE
    CLIENTS -->|Статистика LTV/RFM| CLIENTS

    Xiaomi([Камеры Xiaomi]) --> PRESENCE
    PRESENCE --> DB
```

---

## 2. Процесс: Создание Заказа

```mermaid
sequenceDiagram
    actor Manager as Менеджер
    participant UI as Интерфейс
    participant SA as Server Action
    participant DB as База Данных
    participant WH as Склад
    participant FIN as Финансы
    participant Notif as Уведомления

    Manager->>UI: Заполняет форму заказа
    UI->>SA: createOrder(data)

    SA->>SA: getSession() — проверка прав
    SA->>SA: Zod: валидация данных
    SA->>DB: Генерация номера ORD-YY-NNNN

    loop Для каждой позиции
        SA->>WH: reservedQuantity += qty
        WH-->>SA: ОК или Ошибка (нет товара)
    end

    alt Указан промокод
        SA->>DB: validatePromocode() → скидка
        SA->>DB: usageCount++
    end

    alt Есть предоплата
        SA->>FIN: Создание payment записи
    end

    SA->>DB: INSERT order + order_items
    SA->>DB: INSERT audit_log
    SA->>Notif: sendStaffNotifications()
    SA-->>UI: Заказ создан ✅
    UI-->>Manager: Переход на карточку заказа
```

---

## 3. Процесс: Смена Статуса Заказа

```mermaid
flowchart TD
    Start([Запрос: сменить статус]) --> Check{Права доступа?}
    Check -->|Нет| Forbidden([Ошибка: нет доступа])
    Check -->|Да| Allowed{Переход разрешён?}

    Allowed -->|Нет| BadTransition([Ошибка: недопустимый переход])
    Allowed -->|Да| Transition[Обновить status в таблице orders]

    Transition --> Case{Новый статус?}

    Case -->|shipped / done| WriteOff[Склад: qty -= reserved\nСоздать транзакцию OUT]
    Case -->|cancelled| Release[Склад: reservedQty -= qty\nОсвободить резерв]
    Case -->|Другой| Skip[Без изменений склада]

    WriteOff --> AuditLog[Запись в audit_log\nfrom → to]
    Release --> AuditLog
    Skip --> AuditLog

    AuditLog --> Tasks[autoGenerateTasks()\nЗадачи для отделов]
    Tasks --> Done([Завершено ✅])
```

---

## 4. Взаимодействие: Склад ↔ Заказы

```mermaid
flowchart LR
    subgraph Orders [Модуль Заказов]
        O1[createOrder] -->|+reservedQty| W1
        O2[cancelOrder] -->|-reservedQty| W1
        O3[shipOrder: shipped] -->|-qty -reserved| W1
    end

    subgraph Warehouse [Склад / WMS]
        W1[inventory_items\nqty / reservedQty]
        W1 --> W2[inventory_transactions\nТип: in / out / transfer]
        W1 --> W3{Qty < threshold?}
        W3 -->|Да| W4[StockAlert\nУведомление]
        W3 -->|Нет| OK([В норме])
    end

    W2 --> DB[(PostgreSQL)]
    W4 --> NOTIF([Уведомление закупщику])
```

---

## 5. Взаимодействие: Финансы ↔ Заказы

```mermaid
flowchart TD
    subgraph Order [Заказ]
        O[order\ntotalAmount\npaidAmount\npaymentStatus]
    end

    subgraph Finance [Финансы]
        F1[addPayment\nmethod: cash/bank/online]
        F2[payments table\nstatus: completed/pending]
        F3[expenses table\ncategory: rent/salary/tax]
        F4[getPLReport\nВыручка - COGS - Расходы]
    end

    F1 -->|paidAmount += amount| O
    F1 --> F2
    O -->|paymentStatus: partial/paid| O

    F2 --> F4
    F3 --> F4
    F4 --> Result([P&L Отчёт\nЧистая прибыль / Маржа])
```

---

## 6. Процесс: Дизайн → Производство

```mermaid
sequenceDiagram
    actor Designer as Дизайнер
    actor Manager as Менеджер
    participant Queue as Очередь Задач
    participant Editor as Fabric.js Редактор
    participant S3 as S3 Storage
    participant Production as Производство

    Manager->>Queue: Заказ создан → задача pending
    Queue-->>Designer: Задача в очереди

    Designer->>Queue: Принять задачу (in_progress)
    Designer->>Editor: Открыть редактор
    Designer->>Editor: addImage / addText / Layers
    Editor->>Editor: HistoryManager: Undo/Redo
    Designer->>Editor: exportImage(PNG)
    Editor->>S3: Загрузить файл → fileUrl

    Designer->>Queue: Сменить статус → review
    Queue-->>Manager: На согласование

    alt Утверждено
        Manager->>Queue: approved ✅
        Queue->>Production: Задача производства активна
    else Отклонено
        Manager->>Queue: Вернуть дизайнеру
        Queue-->>Designer: Доработать
    end
```

---

## 7. Взаимодействие: Система Присутствия

```mermaid
flowchart TD
    subgraph Hardware [Оборудование]
        CAM[Камера Xiaomi\nStreamUrl / LocalIp]
        CLOUD[Xiaomi Cloud API\nToken + Region]
    end

    subgraph Recognition [Распознавание]
        CAM --> ENGINE[Recognition Engine\nОблать детекции: rect/polygon/circle]
        CLOUD --> ENGINE
        ENGINE -->|Сотрудник обнаружен| LOG[presence_logs\ntype: detected/recognized]
        ENGINE -->|Уверенность < threshold| UNKNOWN[type: unknown]
    end

    subgraph Aggregation [Агрегация]
        LOG --> SESSION[work_sessions\nstartTime / endTime / duration]
        SESSION --> DAILY[daily_work_stats\nworkSeconds / idleSeconds / lateArrival]
        DAILY --> KPI[KPI Report\nПродуктивность %]
    end

    KPI --> ADMIN([Админ-панель\nОтчёты по сотрудникам])
```

---

## 8. Взаимодействие: Клиент → Воронка → Аналитика

```mermaid
flowchart TD
    NEW([Новый клиент]) --> LEAD[Этап: lead]
    LEAD -->|Менеджер связался| CONTACT[Этап: first_contact]
    CONTACT -->|Обсуждение КП| NEG[Этап: negotiation]
    NEG -->|Первый заказ| FIRST[Этап: first_order]
    FIRST -->|Повторные заказы| REGULAR[Этап: regular]

    NEG -->|Не договорились| LOST{Потерян}
    CONTACT --> LOST
    LOST -->|Причина| ARCHIVE([Архив])

    FIRST --> ORDER[Заказ создан]
    ORDER -->|LTV ++| RFM[Пересчёт RFM\nRecency / Frequency / Monetary]
    RFM --> SEGMENT[Сегмент:\nЧемпионы / Под угрозой / Спящие]
    SEGMENT --> LOYALTY[Уровень лояльности\nBronze / Silver / Gold]
    LOYALTY -->|Скидка %| CHECKOUT([Применяется к заказам])
```

---

## 9. Архитектура запроса: Server Action (Middleware)

```mermaid
flowchart TD
    REQ([Client Request]) --> ACTION[Server Action]
    ACTION --> S1{getSession}
    S1 -->|null| E1([401 Unauthorized])
    S1 -->|session| S2{checkRole\nАдмин / Продажи / Цех}
    S2 -->|Нет прав| E2([403 Forbidden])
    S2 -->|OK| S3{Zod Validate}
    S3 -->|Ошибка| E3([400 Bad Request])
    S3 -->|OK| S4[DB Transaction\nDrizzle ORM]
    S4 -->|Fail| S4R[Rollback + logError]
    S4 -->|OK| S5[Redis: invalidateCache]
    S5 --> S6[audit_log: INSERT]
    S6 --> S7([revalidatePath / return data])
```

---

## 10. Полный Жизненный Цикл Товара (Склад)

```mermaid
flowchart TD
    SUPPLIER([Поставщик]) -->|Приход| IN[Транзакция: IN\nqty++]
    IN --> STOCK[inventory_items\nqty / reservedQty]

    STOCK -->|Новый заказ| RESERVE[reservedQty++\nТранзакция: PENDING]
    RESERVE -->|Отмена заказа| FREE[reservedQty--\nОсвобождение]
    FREE --> STOCK

    RESERVE -->|Отгрузка| SHIP[qty-- / reservedQty--\nТранзакция: OUT]
    SHIP --> PROFIT([Выручка → Финансы])

    STOCK -->|Инвентаризация| ADJ[Транзакция: ADJUSTMENT\n±qty]
    STOCK -->|Брак на производстве| DEFECT[Транзакция: WRITEOFF\nqty-- + defects table]
    STOCK -->|Перемещение| TRANSFER[Транзакция: TRANSFER\nСклад A → Склад B]

    SHIP --> CHECK{qty < threshold?}
    CHECK -->|Да| ALERT[StockAlert 🔴]
    CHECK -->|Нет| OK([OK])
    ALERT --> BUYER([Уведомление закупщику])
```
