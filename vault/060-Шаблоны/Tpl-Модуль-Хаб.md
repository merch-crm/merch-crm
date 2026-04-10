---
название: "<% tp.file.title %>"
дата: <% tp.file.creation_date("YYYY-MM-DD") %>
status: planned
прогресс: 0
tags:
  - статус/в-работе
  - тип/хаб
---
# 🧱 Хаб: <% tp.file.title %>
#модуль/<% tp.file.folder(true).split('/').pop().toLowerCase() %>

> [!NOTE]
> Центральный узел навигации и контроля функционала. 
> Стандарт: [[010-Стандарты/Работа-с-Обсидианом|Obsidian Standard 2026]]

## 📁 Состав модуля
```dataview
LIST
FROM "030-Модули/<% tp.file.folder(true).split('/').pop() %>"
WHERE file.name != this.file.name
SORT file.name ASC
```

## 🔗 Связи и Интеграции
- **Родитель**: [[000-Навигация/Merch-CRM|Центр Управления]]
- **Зависимости**:
    - [[...]]

## 🛠 Техническая реализация
- **Схема БД**: `lib/schema/<% tp.file.title.toLowerCase() %>.ts`
- **API**: `app/api/<% tp.file.title.toLowerCase() %>/route.ts`
- **UI**: `app/(main)/dashboard/<% tp.file.title.toLowerCase() %>/`

---
[[000-Навигация/Merch-CRM|Главное Меню]] | **Обновлено**: <% tp.date.now("YYYY-MM-DD") %>
