# MerchCRM UX Standards

> Единый источник истины для дизайна и визуальных правил интерфейса.
> Последнее обновление: 16.02.2026

---

## 🔝 Приоритеты (для AI)
1. **БИБЛИОТЕКА ПРЕЖДЕ ВСЕГО**: ВСЕГДА проверяй директории `@/components/ui/` и `@/components/layout/` перед созданием нового компонента. Переиспользуй существующие UI-примитивы.
2. **РЕГИСТР**: НИКОГДА не используй `uppercase` в текстовом контенте (заголовки, кнопки, метки).
3. **КОМПАКТНОСТЬ**: Мы стремимся к высокой плотности данных без потери читаемости.

---

## 📐 Основы (Foundations)

### Отступы (Spacing)
Интерфейс строится по сетке 4px.

| Свойство | Значение | Tailwind | Описание |
| :--- | :--- | :--- | :--- |
| **Главный/Внешний Gap** | 12px | `gap-3` / `space-y-3` | Стандарт! Между крупными блоками, секциями внутри карточки |
| **Внутренний Gap** | 8px | `gap-2` / `space-y-2` | Между элементами внутри группы (инпуты, статы) |
| **Микро Gap** | 4-6px | `gap-1`, `gap-1.5` | Между иконкой и текстом, внутри бейджей |
| **Паддинг (Card)** | 24px | `p-6` | Стандарт для контента внутри всех карточек и диалогов |

> **Важно**: Мы полностью отказались от `gap-4/6/8` и `space-y-4/6/8` в пользу более компактного расположения элементов (`space-y-3`, `gap-3`). Это единый стандарт для всего проекта.

### Скругления (Border Radius)
Радиус зависит от размера элемента. Это обеспечивает визуальную консистентность.

| Категория | Высота элемента | Радиус | Tailwind | Примеры |
|-----------|-----------------|--------|----------|---------|
| **XL** | > 280px | 16px | `rounded-2xl` | Hero-карточки, большие модалки, таблицы |
| **L** | 150–280px | 12px | `rounded-xl` | Стандартные карточки, диалоги |
| **M** | 80–150px | 8px | `rounded-lg` | Action-карточки, компактные блоки |
| **S** | < 80px | 6px | `rounded-md` | Кнопки (DEFAULT), инпуты, бейджи |

#### 📐 Правило вложенности (Nesting Rule)
Внутренний элемент всегда должен иметь радиус меньше, чем родитель.
- **Принцип**: `inner_radius = outer_radius - padding`.
- ✅ Карточка (`rounded-xl`, 12px) → Кнопка внутри (`rounded-md`, 6px).
- ❌ Карточка (`rounded-xl`, 12px) → Кнопка внутри (`rounded-xl`, 12px).

#### 🤖 Инструкции для AI (Radius Implementation)
1. **Оцени высоту** блока (XL, L, M или S).
2. **Выбери радиус** по таблице.
3. **Для вложенных элементов** используй радиус на 1–2 уровня меньше родительского.

---

## 🎨 Цвета и Типографика

### Палитра
- **Акцентный**: `#5d00ff` (`--primary`). Применяется для главных действий и состояний.
- **Фон**: `#f8fafc` (`--background`). Чистый, светлый фон.
- **Текст**: `#0f172a` (Primary), `#64748b` (Secondary).

### Типографика
- **Шрифт**: Manrope (основной).
- **Кавычки**: Всегда «ёлочки».
- **Регистр**: **Запрещен `uppercase`**. Используйте обычный регистр.

### Динамический контраст (Светлое/Темное)
При использовании динамических цветов (индикаторы цвета товара, метки категорий) необходимо автоматически подбирать контрастный цвет для иконок или текста.

```typescript
const isLightColor = (hex: string) => {
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.65;
};
```

Правила:
1. Не задавайте цвет иконки вручную для динамических подложек.
2. Порог яркости: `0.65`.
3. Эффект объёма: на светлых цветах — тёмные внутренние тени, на тёмных — светлые.

### Метки Полей (Field Labels)
- **Стиль**: `text-sm`, `font-bold`, `text-slate-700`, `ml-1`.

---

## 📦 Компоненты

### 🤖 Обязательные компоненты (Mandatory)
**Путь**: `@/components/ui/` и `@/components/layout/`
AI обязан использовать эти компоненты вместо кастомной верстки:

1. **`ResponsiveModal`**: Для всех диалогов.
2. **`SubmitButton`**: Для всех форм (вместо обычной кнопки).
3. **`Select`**: Для всех выпадающих списков.
4. **`ConfirmDialog`**: Для подтверждения удаления или опасных действий.
5. **`CardHeader`**: Для заголовков внутри карточек.
6. **`ResponsiveDataView`**: Для адаптивных таблиц (десктоп + мобильные карточки).
7. **`DataTable`**: Универсальная таблица с сортировкой и фильтрами (вместо ручной верстки `table`).
8. **`Skeleton*`**: Готовые скелетоны (`SkeletonTable`, `SkeletonCard`, `SkeletonForm`) для состояний загрузки.
9. **`Spinner*`**: Индикаторы загрузки (`Spinner`, `LoadingOverlay`, `LoadingBlock`).
10. **`Progress*`**: Прогресс-бары и шаги (`Progress`, `StepsProgress`, `FileUploadProgress`).
11. **`Tooltip*`**: Подсказки (`Tooltip`, `TooltipRich`, `TooltipIcon`).
12. **`Slider*`**: Ползунки (`Slider`, `RangeSlider`, `PriceRangeSlider`, `QuantitySlider`).
13. **`Radio*`**: Выбор опций (`RadioGroup`, `RadioCards`, `RadioSegments`).
14. **`DateRangePicker`**: Выбор периода (`DateRangePicker`, `DateRangePickerWithPresets`).
15. **`FileUpload`**: Загрузка файлов (`FileUpload`, `ImageUpload`, `ImageGalleryUpload`).
16. **`Accordion*`**: Аккордеоны (`Accordion`, `AccordionCards`, `AccordionFAQ`, `AccordionSettings`).
17. **`ScrollArea*`**: Кастомные скроллбары (`ScrollArea`, `ScrollAreaTable`, `ScrollAreaHorizontalList`).
18. **`TimeTracker`**: Учет времени (`TimeTracker`, `TimeTrackerWidget`, `TimeTrackerCompact`).
19. **`StatusTimeline`**: История статусов (`StatusTimeline`, `StatusTimelineHorizontal`, `StatusTimelineCard`).
20. **`DeliveryTracker`**: Отслеживание доставки (`DeliveryTracker`, `DeliveryTrackerCompact`, `DeliveryBadge`).
21. **`PriceBreakdown`**: Калькуляция стоимости (`PriceBreakdown`, `ProductPriceCalculator`, `PriceComparison`).
22. **`OrderQueueCard`**: Карточка в очереди (`OrderQueueCard`, `OrderQueueCardCompact`, `OrderQueueCardDetailed`, `OrderKanbanCard`).

### Классы для Карточек и Bento-бокс элементов (Cards)
Все крупные визуальные блоки-виджеты на страницах дашборда (Bento grid) должны иметь единый внешний вид и поведение теней, чтобы выглядеть как операционная система:

1. **Базовый класс `crm-card`**: Обязателен для всех внешних виджетов-блоков.
    - Включает в себя правильное скругление (`rounded-[24px]`/`rounded-2xl`), отступы внутри (`p-6`), тени и цвет фона. На мобильных устройствах радиус плавно уменьшается (`max-sm:rounded-[20px]`).
    - Использовать так: `<div className="crm-card">...</div>`
2. **Внутреннее разделение блоков**: Если виджет состоит из шапки с заголовком и внутреннего контента, внутренний контент часто изолируется серым фоном.
    - Разделитель (горизонтальная линия во всю ширину карточки, игнорирующая паддинг): `<div className="card-breakout border-b border-slate-100" />`
    - Радиус внутренних серых блоков (`bg-slate-50` и др.) должен использовать переменную радиуса: `rounded-[var(--radius-inner)]` или `rounded-[calc(var(--radius)-8px)]`.
3. Обязательно добавлять анимацию появления и ховера для кликабельных виджетов: `hover:shadow-md transition-shadow duration-300`.

### Кнопки (Button)
- **Иконки**: Все основные кнопки действий (Сохранить, Создать, Переместить) **обязательно** должны содержать иконку.
- **Скругление**: По умолчанию `rounded-md`.
- **Анимации**: При создании новых страниц или крупных блоков добавляйте `animate-in fade-in duration-500`.
- **Адаптивный текст**: Текст скрывается на мобильном, иконка остаётся: `<span className="hidden sm:inline">Добавить</span>`.

### Select (выпадающие списки)
Компонент автоматически определяет оптимальный layout:

| Опций | Средняя длина текста | Layout |
|-------|---------------------|--------|
| 1-3 | любая | Вертикальный список |
| 4-8 | ≤ 10 символов | Grid 2 колонки |
| 9-15 | ≤ 4 символов | Grid 3 колонки |
| 16+ | любая | Вертикальный список + поиск |

```tsx
// Автоматический layout (по умолчанию)
<Select options={options} value={value} onChange={onChange} />
// Принудительный grid 2 колонки
<Select options={options} value={value} onChange={onChange} gridColumns={2} />
```

### Диалоги и Модальные окна
Используем `ResponsiveModal` для всех всплывающих окон.
- **Закрытие**: Системная кнопка закрытия предоставляется компонентом автоматически. **НЕ добавляйте** вторую ручную кнопку X.

**Стандарт футера (Ideal Footer Style):**
Используйте проп `footer` для изоляции логики подвала. Это обеспечивает липкость (sticky) и правильные отступы.

```tsx
<ResponsiveModal
  title="Название"
  footer={
    <div className="dialog-footer">
      <Button variant="ghost" className="text-rose-500 hover:text-rose-600">Удалить</Button>
      <div className="dialog-footer-actions">
        <Button variant="ghost" onClick={onClose}>Отмена</Button>
        <SubmitButton icon={<Check />} label="Сохранить" />
      </div>
    </div>
  }
>
  <div className="space-y-4">
    {/* Контент */}
  </div>
</ResponsiveModal>
```

#### Структура диалога (ручная, если без пропа footer):
```tsx
<ResponsiveModal isOpen={isOpen} onClose={onClose}>
    <div className="flex flex-col h-full overflow-hidden">
        {/* Header - НЕ скроллится */}
        <div className="p-6 pb-2 shrink-0">...</div>
        
        {/* Content - СКРОЛЛИТСЯ */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
            <form className="space-y-4">...</form>
        </div>
        
        {/* Footer - НЕ скроллится, закреплён внизу */}
        <div className="sticky bottom-0 z-10 p-5 pt-3 flex flex-row items-center justify-between gap-3 shrink-0 bg-white border-t border-slate-100">
            <button className="h-11 flex-1 w-0 lg:flex-none lg:w-auto lg:px-8 px-4">Отмена</button>
            <Button className="h-11 flex-1 w-0 lg:flex-none lg:w-auto lg:px-10 px-4 btn-dark rounded-[var(--radius-inner)]">Сохранить</Button>
        </div>
    </div>
</ResponsiveModal>
```

Ключевые моменты:
1. Родительский контейнер: `flex flex-col h-full overflow-hidden`.
2. Скроллящаяся область: `flex-1 overflow-y-auto`.
3. Футер: `sticky bottom-0 shrink-0`.
4. Кнопки: `flex-1 w-0` — равная ширина (50/50).

---

## 📊 Работа с таблицами

- **Скругление**: `rounded-2xl` (таблица как XL-элемент, высота > 280px).
- **Чек-боксы**: Каждая таблица ДОЛЖНА иметь колонку с чек-боксами для массового выбора.
- **Пагинация**: Использовать `Pagination` из `@/components/ui/pagination`.
- **Адаптивность**: Каждая таблица ДОЛЖНА иметь мобильный вид (карточки). Использовать `ResponsiveDataView` с `renderTable` + `renderCard`, или `hidden md:block` + `md:hidden`.

```tsx
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

<ResponsiveDataView
    data={items}
    mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
    desktopClassName="hidden md:block"
    renderTable={() => (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>...</thead>
                <tbody>{items.map(item => <tr key={item.id}>...</tr>)}</tbody>
            </table>
        </div>
    )}
    renderCard={(item) => (
        <div key={item.id} className="p-4">{/* Карточка */}</div>
    )}
/>
```

---

## 🎯 Панели быстрых действий (Bulk Actions Panel)

Все панели массовых действий должны иметь одинаковый дизайн:
- **Расположение**: `fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]`.
- **Контейнер**: `bg-white/90`, `backdrop-blur-3xl`, `rounded-full` (pill), `p-2.5 px-8`, `gap-4/6`.
- **Анимация**: `animate-in slide-in-from-bottom-10 fade-in duration-500`.
- **Счетчик**: `w-10 h-10 rounded-full bg-primary text-white shadow-lg shadow-primary/20`.
- **Кнопки**: `rounded-full`, `hover:bg-slate-100`, `transition-all`.
- **Разделители**: `w-px h-8 bg-slate-200`.

```tsx
<div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center bg-white/90 backdrop-blur-3xl p-2.5 px-8 gap-6 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-10 fade-in duration-500 border border-slate-200/60">
    <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20 text-white">
            {selectedIds.length}
        </div>
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Выбрано</span>
    </div>
    <div className="w-px h-8 bg-slate-200 mx-2" />
    <button className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-slate-100 transition-all group">
        <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Действие</span>
    </button>
</div>
```

---

## 🔍 Панели фильтров и тулбары (Filter Trays)

- **Контейнер**: `.crm-filter-tray` — `bg-slate-100/50`, `p-1.5`, `rounded-[20px]`, `border border-slate-200/30`, `shadow-inner`.
- **Поиск**: `h-11`, `rounded-[14px]`, `bg-white`, `shadow-sm`, `text-[13px] font-bold`.
- **Табы**: ОБЯЗАТЕЛЬНО `framer-motion` + `layoutId` для анимации перетекающего фона.
  - Активный: `text-white`, `bg-primary`, `shadow-lg shadow-primary/25`.
  - Неактивный: `text-slate-500`, `hover:text-slate-900`.

---

## 📱 Адаптивная вёрстка

> **Весь функционал доступен на ВСЕХ устройствах.** Нет "урезанной" мобильной версии.

### Брейкпоинты

| Префикс | Ширина | Устройства | Способ открытия контента |
|---------|--------|------------|--------------------------|
| (нет) | 0-639px | Телефоны | Bottom Sheet |
| `sm:` | ≥640px | Большие телефоны | Bottom Sheet |
| `md:` | ≥768px | Планшеты | Sheet справа |
| `lg:` | ≥1024px | Ноутбуки | Dialog / inline |
| `xl:` | ≥1280px | Десктопы | Dialog / inline |
| `2xl:` | ≥1536px | Большие мониторы | Dialog / inline |

### Адаптивные сетки
```tsx
// ✅ Правильно — адаптивная сетка
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// ❌ Неправильно — фиксированная сетка
<div className="grid grid-cols-4 gap-4">
```

---

## 🚫 Антипаттерны

- ❌ Использовать `gap-8` или `space-y-6/8`.
- ❌ Оставлять кнопки без иконок.
- ❌ Использовать `uppercase`.
- ❌ Хардкодить футеры внутри основного контента диалога.
- ❌ `import { Dialog }` из `@/components/ui/dialog` — используй `ResponsiveModal`.
- ❌ `<table>` без мобильной альтернативы — используй `ResponsiveDataView`.
- ❌ `grid-cols-N` без `grid-cols-1` базы.
- ❌ Фиксированная ширина (`w-[500px]`) — используй `w-full max-w-[500px]`.

### Чеклист перед коммитом
- [ ] Все модальные окна используют `ResponsiveModal`
- [ ] Все таблицы имеют мобильный вид (карточки)
- [ ] Все сетки начинаются с `grid-cols-1`
- [ ] Нет фиксированных ширин без `max-w-`
- [ ] Текст кнопок скрыт на мобильном (`hidden sm:inline`)
- [ ] Нет прямых импортов `Dialog` / `DialogContent`

---
**Версия 4.0 (Design System) — 16.02.2026**
