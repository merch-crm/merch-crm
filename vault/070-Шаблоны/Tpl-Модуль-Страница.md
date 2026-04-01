---
название: "<% tp.file.title %>"
дата: <% tp.file.creation_date("YYYY-MM-DD") %>
статус: в-работе
прогресс: 0
tags:
  - статус/в-работе
  - тип/страница
---
# 📄 <% tp.file.title %>
#модуль/<% tp.file.folder(true).split('/').pop().toLowerCase() %>

> [!TIP]
> Описание конкретного функционала или раздела модуля.

## 🎯 Цель раздела
Кратко опишите, какую бизнес-задачу решает этот раздел.

## 🔗 Связи
- **Родитель**: [[030-Модули/<% tp.file.folder(true).split('/').pop() %>/<% tp.file.folder(true).split('/').pop() %>|Хаб модуля]]
- **См. также**: [[...]]

## 🛠 Техническая реализация
- **UI**: `app/(main)/<% tp.file.folder(true).split('/').pop().toLowerCase() %>/_components/`
- **Hook**: `lib/hooks/use-<% tp.file.title.toLowerCase().replace(/\s+/g, '-') %>.pc`

---
[[030-Модули/<% tp.file.folder(true).split('/').pop() %>/<% tp.file.folder(true).split('/').pop() %>|Назад в Хаб]] | **Обновлено**: <% tp.date.now("YYYY-MM-DD") %>
