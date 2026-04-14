---
название: "UI-CompactColorPicker"
тип: компонент
библиотека: Lumin-Apple
tags: [ui, компонент, дизайн, цвет]
---

# 🎨 UI Компонент: CompactColorPicker

## 1. Назначение и Облик
Компактный контроллер для выбора цвета, объединяющий текстовое поле (HEX), превью цвета и выпадающий полный пикер. Идеально подходит для форм настроек и панелей управления.

Визуальные особенности:
- **Indicator**: Градиентное превью "радуга", если цвет не выбран.
- **Typography**: Использование `font-black` и `tabular-nums` для HEX-кода.
- **Micro-interactions**: Иконка пипетки (`Pipette`) меняет цвет при активации.

## 2. Пропсы (Props)
```typescript
interface CompactColorPickerProps {
  value?: string;           // Текущее значение цвета
  onChange?: (color: string | null) => void; // Колбэк
  label?: string;           // Текст метки (Field label)
  description?: string;     // Описание под полем
  placeholder?: string;     // Текст, если значение не задано (по умолчанию "#000000")
  required?: boolean;       // Обязательное поле
  className?: string;       // Стили контейнера
}
```

## 3. Состояния (States)
- **Closed:** Отображается компактная плашка с HEX-кодом.
- **Open:** Поверх плашки (через `AnimatePresence`) выплывает `ColorPicker`.
- **Empty:** Если `value` отсутствует, отображается плейсхолдер и радужный индикатор.

## 4. Особенности реализации
- **AnimatePresence**: Плавное появление и исчезновение выпадающего окна.
- **Outside Click**: Автоматическое закрытие при клике вне области компонента.

---
## Техническая справка
- **Файл**: `components/ui/compact-color-picker.tsx`
- **Зависимости**: `framer-motion`, `lucide-react`, `ColorPicker`.

---
[[015-Компоненты/01-Цвет/01-Цвет|Назад к категории "Цвет"]]
