---
tags:
  - стандарты
  - стандарт
  - ui
  - компоненты
  - фронтенд
обновлено: 2026-04-09
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
| Карточка заказа (Канбан)      | `OrderKanbanCard`          | `@/components/ui/order-cards`                |
| Карточка заказа (Очередь)     | `OrderQueueCard`           | `@/components/ui/order-cards`                |
| Трекинг доставки              | `DeliveryTracker`          | `@/components/ui/delivery-tracker`           |
| Хронология (Лента событий)    | `StatusTimeline`           | `@/components/ui/status-timeline`            |
| Расчет стоимости (Детали)     | `PriceBreakdown`           | `@/components/ui/price-breakdown`            |
| Бейдж роли / статуса          | `RoleBadge` / `DeliveryBadge` | `@/components/ui/badges`                  |
| Кнопка отправки формы         | `SubmitButton`             | `@/components/ui/submit-button`              |
| Уведомление                   | `toast` / `useToast`       | `@/components/ui/toast`                      |
| Подтверждение действия        | `ConfirmDialog`            | `@/components/ui/confirm-dialog`             |
| Брендинг (цвета, CSS-vars)    | `BrandingProvider`         | `@/components/branding-provider`             |

## Правила состояний
- Загрузка → `Skeleton` или `Spinner`
- Пусто → `EmptyState` или `GlassEmptyState`
- Ошибка → `ErrorView`
- Отправка → `SubmitButton` с `loading`
- Статус → Кастомные `Badges` для CRM из `@/components/ui/badges`

---
[[Merch-CRM|Назад к оглавлению]]
