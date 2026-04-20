---
title: Button
description: Унифицированный компонент кнопки.
обновлено: 2026-04-20
---

# Button

`Button` — это базовый компонент для всех кликабельных элементов интерфейса (кроме ссылок навигации). Построен на базе `class-variance-authority` (CVA).

## Импорт

```tsx
import { Button } from "@/components/ui/button";
```

## Свойства (Props)

| Свойство | Тип | По умолчанию | Описание |
|---|---|---|---|
| `color` | `black`, `red`, `yellow`, `purple`, `gray`, `green` | `black` | Смысловой оттенок кнопки. |
| `variant` | `solid`, `outline`, `ghost`, `link` | `solid` | Визуальный стиль. |
| `size` | `sm`, `md`, `lg`, `xl`, `icon`, `icon-sm` | `md` | Размер кнопки. |
| `type` | `button`, `submit`, `reset` | `button` | HTML-тип кнопки. **Важно**: по умолчанию `"button"`, а не `"submit"`. |
| `isLoading` | `boolean` | `false` | Состояние загрузки (блокирует кнопку и показывает спиннер). |
| `loadingText` | `React.ReactNode` | — | Текст, отображаемый рядом со спиннером во время загрузки. |
| `asChild` | `boolean` | `false` | Если true, компонент рендерится как дочерний элемент (через Radix Slot). |

> [!WARNING]
> По умолчанию `type="button"`. Для отправки форм используй `type="submit"` явно или компонент [[SubmitButton]].

## Примеры использования

### Размеры (Sizes)

- **md** (по умолчанию): `46px` высота. Основной размер для всех форм и диалогов.
- **lg**: `56px` высота. Для лендингов или акцентированных действий.
- **sm**: `38px` высота. Для таблиц и компактных блоков.
- **icon**: `44x44px`. Квадратная кнопка для иконок.

```tsx
<Button size="sm">Маленькая</Button>
<Button size="md">Обычная</Button>
<Button size="lg">Большая</Button>
<Button size="icon"><Plus /></Button>
```

### Цвета (Colors)

| Цвет | Токен | Назначение | Пример |
|---|---|---|---|
| `black` | `slate-950` | Основное действие (CTA) | Сохранить, Создать |
| `red` | `rose-500` | Деструктивное действие | Удалить, Отменить |
| `yellow` | `amber-500` | Предупреждающее действие | Архивировать |
| `purple` | `primary (#5d00ff)` | Брендовое/акцентное | Категория, Фильтры |
| `green` | `emerald-500` | Позитивное действие | Подтвердить, Принять |
| `gray` | `slate-500` | Вторичное действие | Отмена, Назад |

> [!IMPORTANT]
> Набор цветов `color` **унифицирован** между Button и Badge (PillBadge, StatusChip). Используй одинаковые названия повсюду.

```tsx
<Button color="black">Сохранить</Button>
<Button color="red" variant="outline">Удалить</Button>
<Button color="gray" variant="ghost">Отмена</Button>
```

### Состояния

Кнопка автоматически обрабатывает состояние `disabled` и `isLoading`.

```tsx
<Button isLoading loadingText="Сохранение...">
  Сохранить
</Button>
```

## Дизайн-токены (Standardization)

Согласно системе **Lumin-Apple**, компонент `Button` полностью управляет своей геометрией.

> [!IMPORTANT]
> **Любое использование `h-12`, `rounded-2xl`, `btn-dark` и подобных классов на компоненте `<Button>` запрещено.**

### Актуальная привязка к токенам:
- **Высота**:
    - `size="lg"` -> `56px`
    - `size="md"` -> `46px` (Стандарт)
    - `size="sm"` -> `38px`
- **Радиус закругления**:
    - `size="md"`, `size="lg"` -> `var(--radius-inner)` (16px / `rounded-2xl`)
    - `size="sm"` -> `var(--radius-inner)` (относительно меньше / `rounded-xl`)

## Сочетания (Common Patterns)

### Кнопка сохранения в форме
```tsx
<Button type="submit" color="black" size="md">
  Сохранить
</Button>
```

### Кнопка отмены/удаления в диалоге
```tsx
<div className="flex gap-3">
  <Button variant="ghost" color="gray" onClick={onClose}>
    Отмена
  </Button>
  <Button color="red">
    Удалить безвозвратно
  </Button>
</div>
```

### Инструмент в таблице
```tsx
<Button size="icon" variant="ghost" color="purple">
  <Edit2 className="size-5" />
</Button>
```
