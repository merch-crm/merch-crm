---
название: "UI-ColorSwatch"
тип: компонент
библиотека: Lumin-Apple
tags: [ui, компонент, дизайн, цвет]
---

# 🎨 UI Компонент: ColorSwatch

## 1. Назначение и Облик
Универсальный элемент выбора цвета, который может выглядеть как полноценное поле ввода с HEX-кодом или как минималистичный квадрат/круг (Swatch). Использует `Popover` для отображения пикера.

Визуальные особенности:
- **Variants**: Поддерживает 3 варианта: `default` (полное поле), `square` (квадрат), `circle` (круг).
- **Sizes**: Доступен в размерах `sm` (8h), `md` (12h), `lg` (14h).
- **Industrial Look**: Тонкие границы `slate-200`, фон `slate-50` и жирный шрифт заголовков.

## 2. Пропсы (Props)
```typescript
export type SwatchVariant = "default" | "square" | "circle";
export type SwatchSize = "sm" | "md" | "lg";

interface ColorSwatchProps {
  color: string;           // Текущий цвет
  onChange: (color: string) => void; // Колбэк изменения
  showHex?: boolean;       // Показ HEX-кода (только для variant="default")
  variant?: SwatchVariant; // Форма компонента
  size?: SwatchSize;       // Размер
  label?: string;          // Текст метки
  className?: string;      // Стили
}
```

## 3. Состояния (States)
- **Compact View:** Для `square` и `circle` отображается только залитый цветом блок.
- **Full View:** Для `default` отображается полоса с HEX-кодом и иконкой раскрытия.
- **Popover:** При клике открывается `ColorPicker` с отступом 8px.

## 4. Особенности реализации
- **Radix Popover**: Обеспечивает корректное позиционирование и портальную отрисовку.
- **Dynamic Classes**: Стили радиуса и высоты вычисляются на основе пропсов `variant` и `size`.

---
## Техническая справка
- **Файл**: `components/ui/color-swatch.tsx`
- **Зависимости**: `lucide-react`, `Radix Popover`, `ColorPicker`.

---
[[015-Компоненты/01-Цвет/01-Цвет|Назад к категории "Цвет"]]
