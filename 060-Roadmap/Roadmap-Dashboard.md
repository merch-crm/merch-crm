---
tags:
  - roadmap
---

# 🗺️ MerchCRM Roadmap Dashboard

> [!TIP]
> Этот дашборд автоматически собирает данные изо всех файлов фич в разделе Roadmap. 
> Для корректной работы требуется плагин **Dataview**.

## 📈 Общий прогресс

```dataview
TABLE 
  rows.status as "Статусы",
  length(rows) as "Кол-во"
FROM "060-Roadmap"
WHERE phase != null AND file.name != "Roadmap-Dashboard"
GROUP BY phase
```

## 🚀 Текущие задачи (В работе)

```dataview
TABLE
  phase as "Фаза",
  priority as "Приоритет",
  module as "Модуль"
FROM "060-Roadmap"
WHERE status = "in-progress"
SORT priority DESC
```

## 🏗️ Детализация по фазам

### Фаза 0: Фундамент
```dataview
TABLE status, priority, issue
FROM "060-Roadmap/0-Фундамент"
SORT priority DESC
```

### Фаза 1: Критические функции
```dataview
TABLE status, priority, issue
FROM "060-Roadmap/1-Критические"
SORT priority DESC
```

### Фаза 2: Склад и ERP
```dataview
TABLE status, priority, issue
FROM "060-Roadmap/2-Склад-ERP"
SORT priority DESC
```

### Фаза 3: UX и Безопасность
```dataview
TABLE status, priority, issue
FROM "060-Roadmap/3-UX-Безопасность"
SORT priority DESC
```

### Фаза 4: Аналитика и Масштабирование
```dataview
TABLE status, priority, issue
FROM "060-Roadmap/4-Аналитика"
SORT priority DESC
```

## 📋 Бэклог (99)
```dataview
TABLE status, priority, issue
FROM "060-Roadmap/99-Бэклог"
SORT priority DESC
```

---
[🔙 Вернуться к оглавлению](MERCH%20CRM.md)
