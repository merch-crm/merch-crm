---
название: "<% tp.file.title %>"
дата: <% tp.file.creation_date("YYYY-MM-DD") %>
обновлено: <% tp.date.now("YYYY-MM-DD") %>
статус: черновик
прогресс: 0
ответственный: User
теги:
  - модуль
  - версия-3
---

# <% tp.file.title %>

## 1. Описание (Goal)
Опиши, зачем нужен этот модуль и какую бизнес-ценность он несет.

## 2. Связи БД (Relations)
```mermaid
erDiagram
    <% tp.file.title %> ||--o{ OTHER_TABLE : "связь"
```

## 3. Требования (Requirements)
- [ ] Требование 1
- [ ] Требование 2

## 4. Техническая реализация (Implementation)
> Стандарт: [[010-Стандарты/Actions|Server Actions v3.0]]

**Файлы:**
- `lib/schema/...`
- `app/api/...`
- `components/modules/...`

## Подзадачи
- [ ] Спроектировать БД
- [ ] Реализовать Server Actions
- [ ] Сделать UI (Lumin-Apple)
- [ ] Написать тесты

---
[[MERCH CRM|Назад к оглавлению]]
