# MerchCRM Design System

> Единый документ дизайн-системы  
> Последнее обновление: 01.02.2026

---

## 🎨 Основные принципы

1. **Радиусы**: 18px (outer), 12px (inner) для всех элементов
2. **Акцентный цвет**: #5d00ff (фиолетовый)
3. **Темный цвет**: Графитовый (используется минимально)
4. **Типографика**: Manrope, стандартные веса, без сжатия букв
5. **Кавычки**: Строгий запрет на прямые кавычки (" "). Использовать только кавычки-ёлочки (« ») для всех текстовых элементов.
6. **Регистр**: Строгий запрет на `uppercase` (капс). Использовать только обычный регистр предложений.

---

## 📐 Геометрия и Отступы

### Радиусы (Unified System)
```css
--radius-outer: 18px;       /* Панели, карточки, модальные окна */
--radius-inner: 12px;       /* Кнопки, инпуты, вложенные элементы */
--radius-padding: 24px;     /* Стандартный padding для контента */
```

### Отступы
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;

--grid-gap: 16px;           /* Между блоками Bento */
```

---

## 🎨 Цветовая палитра

### Основные цвета
```css
/* Акцентный */
--primary: #5d00ff;
--primary-hover: #731cff;
--primary-light: rgba(93, 0, 255, 0.1);
--primary-foreground: #ffffff;

/* Фон */
--background-main: #f8fafc;
--background-card: #ffffff;

/* Текст */
--text-primary: #0f172a;
--text-secondary: #64748b;
--text-tertiary: #94a3b8;

/* Границы */
--border-light: #e2e8f0;
--border-medium: #cbd5e1;
```

### Графитовый (минимальное использование)
```css
--graphite-dark: #2d3748;
--graphite-medium: #4a5568;
--graphite-light: #718096;
```

**Использование графитового:**
- Только для особо важных блоков на дашборде
- Не более 1-2 карточек на странице
- Всегда с белым текстом

### Статусы
```css
--status-success: #10b981;
--status-warning: #f59e0b;
--status-error: #ef4444;
--status-info: #3b82f6;
```

### Деструктивные действия
```css
--destructive: #f43f5e;
--destructive-hover: #ff5a75;
--destructive-light: rgba(244, 63, 94, 0.1);
```

---

## ✍️ Типографика

### Шрифт
```css
font-family: var(--font-manrope), 'Manrope', sans-serif;
```

### Размеры и веса

#### Заголовки
```css
/* H1 */
font-size: 32px;
font-weight: 700;
line-height: 1.2;
letter-spacing: normal; /* НЕ сжимать */

/* H2 */
font-size: 24px;
font-weight: 700;
line-height: 1.3;

/* H3 */
font-size: 20px;
font-weight: 600;
line-height: 1.4;

/* H4 */
font-size: 18px;
font-weight: 600;
line-height: 1.4;
```

#### Основной текст
```css
/* Body Large */
font-size: 16px;
font-weight: 400;
line-height: 1.5;

/* Body */
font-size: 14px;
font-weight: 400;
line-height: 1.5;

/* Body Small */
font-size: 13px;
font-weight: 400;
line-height: 1.5;
```

#### Числа и метрики
```css
/* Крупные числа (дашборд) */
font-size: 48px;
font-weight: 700;
line-height: 1;

/* Средние числа (карточки) */
font-size: 32px;
font-weight: 600;
line-height: 1.1;

/* Маленькие числа (таблицы) */
font-size: 14px;
font-weight: 500;
line-height: 1.5;
```

#### Labels и подписи
```css
font-size: 12px;
font-weight: 500;
line-height: 1.4;
text-transform: none; /* НЕ uppercase */
letter-spacing: normal;
color: var(--text-secondary);
```

#### Пунктуация
- **Кавычки**: Всегда «ёлочки», никогда "прямые"
- **Пример**: Удалить «Баблгам»?

**❌ КАТЕГОРИЧЕСКИ НЕ ИСПОЛЬЗОВАТЬ:**
- `text-transform: uppercase` (никаких исключений)
- `letter-spacing: tight` или `tracking-tighter` / `tracking-widest`
- `font-weight: 900` (класс `font-black`)
- Прямые кавычки `" "` в тексте (использовать « »)

---

## 🃏 Карточки

### Светлая карточка (основная)
```css
.card {
  background: var(--background-card);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
```

### Графитовая карточка (минимально)
```css
.card-graphite {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  color: #ffffff;
}
```

**Правила использования графитовых карточек:**
- Максимум 1-2 на странице
- Только для ключевых метрик
- Акценты внутри — фиолетовый (#5d00ff)

---

## 🔘 Кнопки

### Primary
```css
.btn-primary {
  background: var(--primary);
  color: #ffffff;
  border-radius: 18px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px -5px rgba(93, 0, 255, 0.3);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: scale(1.02);
  box-shadow: 0 15px 30px -5px rgba(93, 0, 255, 0.4);
}

.btn-primary:active {
  transform: scale(0.98);
}
```

### Destructive (для опасных действий)
```css
.btn-destructive {
  background: var(--destructive);
  color: #ffffff;
  border-radius: 18px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  box-shadow: 0 8px 20px -5px rgba(244, 63, 94, 0.3);
}

.btn-destructive:hover {
  background: var(--destructive-hover);
  transform: scale(1.02);
  box-shadow: 0 15px 25px -5px rgba(244, 63, 94, 0.45);
}
```

### Destructive Ghost (для иконок удаления)
```css
.btn-destructive-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
}

.btn-destructive-ghost:hover {
  background: var(--destructive-light);
  color: var(--destructive);
}
```

### Secondary
```css
.btn-secondary {
  background: #ffffff;
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  border-radius: 18px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: var(--border-medium);
}
```

### Ghost
```css
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 18px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: #f1f5f9;
  color: var(--text-primary);
}
```

### Кнопки диалоговых окон
Стандарт для всех диалогов — высота **h-11** (44px).

```css
.btn-dialog {
  height: 44px; /* h-11 */
  border-radius: 12px; /* --radius-inner */
  font-weight: 700;
  font-size: 14px;
}
```

---

## 📝 Формы и инпуты

### Input
```css
.input {
  background: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 18px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.input:focus {
  background: #ffffff;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(93, 0, 255, 0.1);
  outline: none;
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### Label
```css
.label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}
```

### Переключатели (Switches)
Минималистичный «пул» стиль: сплошной контрастный фон и крупный белый бегунок.

```tsx
/* Контейнер (Трэк) */
const trackClass = cn(
  "w-10 h-6 rounded-full transition-all duration-300 flex items-center px-0.5 relative z-10",
  isActive ? "bg-primary" : "bg-slate-300" // Акцентный цвет зависит от контекста
);

/* Бегунок (Thumb) */
const thumbClass = cn(
  "w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-sm",
  isActive ? "translate-x-4" : "translate-x-0"
);
```

**Правила цветов для Switch:**
- **Общие настройки**: `bg-primary` (#5d00ff)
- **Статус активности (Active/Online)**: `bg-emerald-500`
- **Выключенное состояние**: `bg-slate-300`

---

## 🏷️ Badges и статусы

### Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 18px;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
}

/* Success */
.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

/* Warning */
.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

/* Error */
.badge-error {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* Info */
.badge-info {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}
```

---

## 📊 Графики

### Прогресс-бар
```css
.progress {
  height: 8px;
  background: #e2e8f0;
  border-radius: 18px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--primary);
  border-radius: 18px;
  transition: width 0.3s ease;
}
```

### Круговая диаграмма
- Толщина: 12-16px
- Активный цвет: var(--primary)
- Фон: #e2e8f0
- Центр: крупное число (32-48px)

---

## 🎭 Тени

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
--shadow-md: 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-2xl: 0 20px 60px rgba(0, 0, 0, 0.15);
```

---

## 🎬 Анимации

### Hover
```css
transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### Появление
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
animation: fadeIn 0.3s ease-out;
```

### Загрузка (Skeleton)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
animation: pulse 1.5s ease-in-out infinite;
```

### Переключение табов (Framer Motion)
Строгий стандарт для всех переключателей и табов (`layoutId`):
```tsx
transition={{ type: "spring", bounce: 0, duration: 0.4 }}
```
**Запрещено:** использовать `bounce > 0` (эффект пружины) для табов.

---

## 📱 Адаптивность

### Breakpoints
```css
--breakpoint-mobile: 640px;
--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1280px;
```

### Bento Grid
```css
/* Desktop */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

/* Tablet */
@media (max-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 640px) {
  .bento-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## ✅ Чек-лист применения

При создании нового компонента проверь:

- [ ] Радиус 18px (outer) / 12px (inner)
- [ ] Акцентный цвет #5d00ff
- [ ] Графитовый используется минимально
- [ ] НЕТ uppercase
- [ ] НЕТ letter-spacing: tight
- [ ] Стандартные font-weight (400, 500, 600, 700)
- [ ] Тени мягкие
- [ ] Hover эффекты плавные (0.2s)
- [ ] Анимация табов строгая (bounce: 0, duration: 0.4)
- [ ] Отступы из системы spacing
- [ ] Кавычки только «ёлочки»
- [ ] Деструктивные кнопки используют btn-destructive / btn-destructive-ghost
- [ ] Переключатели (Switch) имеют сплошной фон и белый бегунок (Minimal Pool Style)

---

## 🚫 Антипаттерны

**НЕ делать:**

```css
/* ❌ Неправильно */
border-radius: 12px;         /* для карточек */
border-radius: 24px;
text-transform: uppercase;
letter-spacing: -0.02em;
font-weight: 900;
background: #000000;         /* только графитовый */
```

```css
/* ✅ Правильно */
border-radius: 18px;
text-transform: none;
letter-spacing: normal;
font-weight: 700;
background: #2d3748;         /* графитовый, минимально */
```

**НЕ использовать в текстах:**
```
❌ "Баблгам"
✅ «Баблгам»
```

---

**Статус**: Утверждено и готово к применению  
**Версия**: 2.0
