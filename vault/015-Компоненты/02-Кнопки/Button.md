---
title: Button
description: Унифицированный компонент кнопки.
---

# Button

`Button` — это базовый компонент для всех кликабельных элементов интерфейса (кроме ссылок навигации). Построен на базе `class-variance-authority` (CVA).

## Импорт

```tsx
import { Button } from "@/components/ui/button";
```

## Свойства (Props)

| Свойство | Тип | Описание |
|---|---|---|
| `color` | `dark`, `danger`, `warning`, `system`, `success`, `neutral` | Смысловой оттенок кнопки. |
| `variant` | `solid`, `outline`, `ghost`, `link` | Визуальный стиль. |
| `size` | `sm`, `md`, `lg`, `icon` | Размер кнопки. |
| `isLoading` | `boolean` | Состояние загрузки (блокирует кнопку и показывает спиннер). |
| `loadingText` | `React.ReactNode` | Текст, отображаемый рядом со спиннером во время загрузки. |
| `asChild` | `boolean` | Если true, компонент рендерится как дочерний элемент (через Radix Slot). |

## Примеры использования

### Размеры (Sizes)

- **md** (по умолчанию): `46px` высота. Основной размер для всех форм и диалогов.
- **lg**: `56px` высота. Для лендингов или акцентированных действий.
- **sm**: `36px` высота. Для таблиц и компактных блоков.
- **icon**: `46x46px`. Квадратная кнопка для иконок.

```tsx
<Button size="sm">Маленькая</Button>
<Button size="md">Обычная</Button>
<Button size="lg">Большая</Button>
<Button size="icon"><Plus /></Button>
```

### Состояния

Кнопка автоматически обрабатывает состояние `disabled` и `isLoading`.

```tsx
<Button isLoading loadingText="Сохранение...">
  Сохранить
</Button>
```

## Дизайн-токены

Компонент использует следующие Radius токены:
- `md`, `lg`: `rounded-2xl` (16px) — **Inner Radius**.
- `sm`: `rounded-xl` (12px).
