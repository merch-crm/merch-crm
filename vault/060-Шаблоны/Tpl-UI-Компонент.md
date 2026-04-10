---
название: "UI-<% tp.file.title %>"
тип: компонент
библиотека: Apple
tags: [ui, компонент, дизайн]
---

# 🎨 UI Компонент: <% tp.file.title %>

## 1. Назначение и Облик
Опиши визуальную концепцию (Apple, Glassmorphism, Vibrancy).
*Разместить скриншот/мокап из Figma.*

## 2. Пропсы (Props)
```typescript
interface <% tp.file.title %>Props {
  label: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
  isLoading?: boolean;
}
```

## 3. Состояния (States)
- **Default:** Описание обычного вида.
- **Hover/Active:** Анимации, изменение теней/градиентов.
- **Loading:** Скелетон или Spinner.
- **Disabled:** Прозрачность, курсор `not-allowed`.

## 4. Анимации (Framer Motion)
- Начальное состояние: `initial: { opacity: 0 }`
- Анимация: `animate: { opacity: 1 }`
- Переход: `spring` (stiffness: 400, damping: 10)

## 5. Доступность (A11y)
- [ ] Группировка ролей (WAI-ARIA).
- [ ] Контроль через клавиатуру (Tab).
- [ ] Описание для Screen Reader.

---
[[010-Стандарты/UI-UX|Дизайн-система]]
