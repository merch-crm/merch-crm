---
tags: [стандарт, ui, компоненты, фронтенд]
updated: 2026-03-30
related:
  - "[[UX-дизайн]]"
  - "[[Звуковая-обратная-связь]]"
---

# Каталог обязательных UI-компонентов

Все компоненты — из `@/components/ui/`. Не создавай аналоги.

## Маппинг: задача → компонент

| Задача                        | Компонент                  | Импорт                                      |
|-------------------------------|----------------------------|----------------------------------------------|
| Диалог / модальное окно       | `ResponsiveModal`          | `@/components/ui/responsive-modal`           |
| Таблица с данными             | `DataTable`                | `@/components/ui/table`                      |
| Адаптивный список/таблица     | `ResponsiveDataView`       | `@/components/ui/responsive-data-view`       |
| Кнопка отправки формы         | `SubmitButton`             | `@/components/ui/submit-button`              |
| Уведомление                   | `toast` / `useToast`       | `@/components/ui/toast`                      |
| Подтверждение действия        | `ConfirmDialog`            | `@/components/ui/confirm-dialog`             |

## Правила состояний
- Загрузка → `Skeleton` или `Spinner`
- Пусто → `EmptyState` или `GlassEmptyState`
- Ошибка → `ErrorView`
- Отправка → `SubmitButton` с `loading`

---
[[000-Навигация/ОГЛАВЛЕНИЕ|Назад к оглавлению]]
