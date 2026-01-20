# Lumin-Apple Design System

> **Философия**: Премиальная лаконичность Apple + функциональность Bento-раскладок + высокая контрастность типографики.

---

## 🎨 Геометрия и Отступы

### Радиусы (Border Radius)
```css
--radius-outer: 24px;  /* Внешние контейнеры, основные страницы */
--radius-inner: 14px;  /* Внутренние элементы, карточки, кнопки */
```

**Применение:**
- **Страницы и секции**: `rounded-[var(--radius-outer)]`
- **Карточки, кнопки, инпуты**: `rounded-[var(--radius-inner)]`
- **Иконки в контейнерах**: `rounded-[var(--radius-inner)]`

### Сетка (Bento Grid)
```css
--crm-grid-gap: 16px;
```

**Применение:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[var(--crm-grid-gap)]">
  {/* Карточки */}
</div>
```

### Утилита `.crm-card`
Базовый класс для всех карточек:
```css
.crm-card {
  @apply bg-white border border-slate-200/60 rounded-[var(--radius-outer)] shadow-sm;
}
```

### Scrollbars
Все скроллбары скрыты для эффекта нативного приложения:
```css
* {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
*::-webkit-scrollbar {
  display: none;
}
```

---

## ✍️ Типографика

### Заголовки страниц
```tsx
<h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
  Заголовок
</h1>
<p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-3">
  Описание под заголовком
</p>
```

**Правила:**
- Всегда `font-black` (не `font-bold`)
- `tracking-tighter` для заголовков
- `tracking-widest` для подписей
- `uppercase` для всех важных текстов
- `leading-none` для компактности

### Заголовки карточек
```tsx
<h3 className="text-xl font-black text-slate-900 tracking-tighter leading-none uppercase">
  Название карточки
</h3>
```

### Подписи и метки
```tsx
<span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
  МЕТКА
</span>
```

### Данные и числа
```tsx
{/* Крупные показатели */}
<p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
  {value}
</p>

{/* ID и коды */}
<span className="font-mono tracking-tighter text-slate-600">
  ORD-12345
</span>
```

---

## 🎨 Цвета и Эффекты

### Основная палитра
- **Primary**: `indigo-600` (кнопки, акценты)
- **Success**: `emerald-600` (положительные статусы)
- **Warning**: `amber-500` (предупреждения)
- **Danger**: `rose-600` (ошибки, удаление)
- **Neutral**: `slate-900` (основной текст)

### Фоны статусов
Используем пастельные фоны с яркими текстами:
```tsx
<div className="bg-emerald-50 text-emerald-600">Активно</div>
<div className="bg-rose-50 text-rose-600">Критично</div>
<div className="bg-amber-50 text-amber-600">Ожидание</div>
```

### Glassmorphism
Для навигации и модальных окон:
```tsx
<div className="bg-white/95 backdrop-blur-xl border border-slate-200/50">
  {/* Контент */}
</div>
```

### Тени
```tsx
{/* Покой */}
<div className="shadow-sm">

{/* Hover */}
<div className="hover:shadow-xl hover:shadow-indigo-500/10">

{/* Акцентные элементы */}
<div className="shadow-2xl shadow-indigo-500/15">
```

---

## ⚡️ Интерактивность

### Hover-эффекты карточек
```tsx
<div className="crm-card hover:-translate-y-1 hover:shadow-xl transition-all duration-500">
  {/* Контент */}
</div>
```

### Кнопки
```tsx
{/* Primary */}
<button className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[var(--radius-inner)] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
  Действие
</button>

{/* Secondary */}
<button className="h-14 px-8 bg-white hover:bg-slate-50 text-slate-900 rounded-[var(--radius-inner)] font-black text-[11px] uppercase tracking-widest border border-slate-200 transition-all">
  Отмена
</button>
```

### Иконки в контейнерах
```tsx
<div className="h-14 w-14 rounded-[var(--radius-inner)] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-all duration-500">
  <Icon className="w-7 h-7" />
</div>
```

### Анимации появления
```tsx
<div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
  {/* Контент */}
</div>
```

---

## 📦 Компоненты

### Статистическая карточка (Bento)
```tsx
<div className="crm-card p-6 bg-white flex items-center justify-between group hover:-translate-y-1 transition-all duration-500 border-none">
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">
      Метка
    </p>
    <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
      {value}
    </p>
  </div>
  <div className="h-14 w-14 rounded-[var(--radius-inner)] bg-indigo-50 flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-lg shadow-indigo-500/5">
    <Icon className="w-7 h-7 text-indigo-600" />
  </div>
</div>
```

### Модальное окно
```tsx
<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" />
  <div className="relative w-full max-w-md bg-white rounded-[var(--radius-outer)] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8">
    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-4">
      Заголовок
    </h2>
    <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-loose mb-10">
      Описание действия
    </p>
    {/* Кнопки */}
  </div>
</div>
```

### Таблица
```tsx
<div className="crm-card overflow-hidden">
  <table className="w-full">
    <thead className="bg-slate-50/50">
      <tr>
        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Колонка
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
        <td className="px-6 py-4 text-sm font-black text-slate-900">
          Данные
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badge
```tsx
<span className="inline-flex items-center px-4 py-2 rounded-[10px] bg-indigo-50 border border-indigo-100 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
  Статус
</span>
```

---

## 🚫 Антипаттерны

### ❌ Избегать:
```tsx
{/* Старые стили */}
<h1 className="text-2xl font-bold">Заголовок</h1>
<p className="text-sm font-medium">Текст</p>
<button className="rounded-lg">Кнопка</button>
<div className="rounded-xl">Карточка</div>
```

### ✅ Правильно:
```tsx
{/* Lumin-Apple */}
<h1 className="text-4xl font-black tracking-tighter uppercase">Заголовок</h1>
<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Текст</p>
<button className="rounded-[var(--radius-inner)] font-black uppercase tracking-widest">Кнопка</button>
<div className="rounded-[var(--radius-outer)]">Карточка</div>
```

---

## 📐 Размерная сетка

### Высоты элементов
- **Кнопки**: `h-14` (56px)
- **Инпуты**: `h-12` (48px)
- **Иконки в контейнерах**: `h-14 w-14` или `h-16 w-16`
- **Аватары**: `h-10 w-10` (малые), `h-16 w-16` (большие)

### Отступы (Padding)
- **Карточки**: `p-6` или `p-8`
- **Модальные окна**: `p-8` или `p-10`
- **Кнопки**: `px-8 py-4`

---

## 🎯 Контрольный чеклист

Перед коммитом проверьте:
- [ ] Все заголовки используют `font-black`
- [ ] Все важные тексты в `uppercase`
- [ ] Радиусы только `var(--radius-outer)` или `var(--radius-inner)`
- [ ] Трекинг: `tracking-tighter` для заголовков, `tracking-widest` для меток
- [ ] Высота строк: `leading-none` для компактных блоков
- [ ] Hover-эффекты на всех интерактивных элементах
- [ ] Анимации `transition-all duration-500` для плавности
- [ ] Тени используют `shadow-{color}/10` или `/20`

---

**Последнее обновление**: 19.01.2026  
**Версия**: 1.0 (Lumin-Apple)
