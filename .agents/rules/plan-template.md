---
description: Template for all `{task-slug}.md` files to ensure consistent planning
---

# [Task Name]

**Goal:** [Brief description of what this task accomplishes]

## 1. Зависимости и Файлы
- Какие файлы будут затронуты
- Зависимости, которые нужно учесть перед началом работы

## 2. Изменения в Базе Данных (Schema)
- Выбор модулей, таблиц
- Изменения индексов или полей
- Проверка триггеров (updated_at, RFM_stats)

## 3. Изменения в API / Server Actions
- Новые или измененные Server Actions
- Правила валидации Zod
- Проверки авторизации и контроль доступа (защита от IDOR)
- Логирование финансовых или критических действий (`audit()`)

## 4. UI и Клиентские Компоненты
- Клиентская логика (защита от hydration mismatch - без прямого `Math.random()` или `new Date()`)
- Состояние (useState / useStore)
- Работа с массивами (Null safety, `items?.map`)

## 5. Стратегия тестирования
- Какие тесты будут добавлены (Vitest/Playwright)
- Ручная проверка
