---
название: "UI-ColorGroup"
тип: компонент
библиотека: Lumin-Apple
tags: [ui, компонент, дизайн, цвет]
---

# 🎨 UI Компонент: ColorGroup & ColorPickerSwatchesGroup

## 1. Назначение и Облик
Компоненты для быстрого выбора цвета из фиксированного набора образцов (палитры). Используются там, где неоправданно открытие полного пикера, например, при категоризации мелких сущностей, или как часть комбинированного пикера.

Визуальные особенности:
- **Radio-style**: Каждый образец ведет себя как радио-кнопка с визуальной индикацией выбора (галочка `Check`).
- **Focus Rings**: Четкие кольца фокусировки для навигации с клавиатуры.
- **Micro-interactions**: Увеличение масштаба (`scale-110`) при наведении.

## 2. Пропсы (Props)
### ColorGroup (простой вариант)
```typescript
interface ColorGroupProps {
  selectedColor?: string;              // Выбранный HEX-цвет
  onColorChange?: (color: string) => void; // Колбэк при клике
  colors?: string[];                   // Массив HEX-строк (опционально)
  className?: string;                  // Стили контейнера
}
```

### ColorPickerSwatchesGroup (с кастомным цветом)
```typescript
export interface ColorPickerSwatchesGroupProps {
  value?: string;
  onChange?: (color: string) => void;
  colors?: string[];
}
```
*Дополнительно*: `ColorPickerSwatchesGroup` включает кнопку "+" (радужную), при клике на которую выпадает полный `ColorPicker` для выбора произвольного цвета, отсутствующего в стандартной палитре.

## 3. Особенности реализации
- **Accessibility**: Имеет роль `radiogroup` и соответствующие `aria-label` для скринридеров.
- **Indicator**: Выбранный цвет выделяется не только галочкой, но и внутренним отступом (`boxShadow: inset...`), что создает эффект приподнятости. Динамически меняет цвет галочки (белый или темный) в зависимости от светлоты выбранного цвета.
- **Responsive Grid**: `ColorPickerSwatchesGroup` автоматически подстраивает `grid-template-columns` под длину переданного массива `colors`.

---
## Техническая справка
- **Файлы**: 
  - `components/ui/color-group.tsx` (простой `ColorGroup`)
  - `components/ui/color-picker-variants.tsx` (продвинутый `ColorPickerSwatchesGroup`)
- **Зависимости**: `lucide-react`, `cn`, `ColorPicker` (для кастомного варианта).

---
[[015-Компоненты/01-Цвет/01-Цвет|Назад к категории "Цвет"]]
