---
название: "<% tp.file.title %>"
дата: <% tp.file.creation_date("YYYY-MM-DD") %>
статус: в-работе
прогресс: 0
tags:
  - модуль/<% tp.file.folder(true).split('/').pop().toLowerCase() %>
  - статус/в-работе
  - тип/хаб
---
# 🧱 Хаб: <% tp.file.title %>

> [!NOTE]
> Центральный узел навигации и контроля функционала. 
> Стандарт: [[010-Стандарты/Правила-Обсидиана|Obsidian Standard 2026]]

## 📁 Состав модуля
```dataview
LIST
FROM "030-Модули/<% tp.file.folder(true).split('/').pop() %>"
WHERE file.name != this.file.name
SORT file.name ASC
```

## 🔗 Связи и Интеграции
- **Родитель**: [[000-Навигация/MERCH-CRM|Центр Управления]]
- **Зависимости**:
    - [[...]]

## 🛠 Техническая реализация
- **Схема БД**: `lib/schema/<% tp.file.title.toLowerCase() %>.ts`
- **API**: `app/api/<% tp.file.title.toLowerCase() %>/route.ts`
- **UI**: `app/(main)/<% tp.file.title.toLowerCase() %>/`

---
[[000-Навигация/MERCH-CRM|Главное Меню]] | **Обновлено**: <% tp.date.now("YYYY-MM-DD") %>
