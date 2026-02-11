# Технические стандарты разработки MerchCRM

Этот документ содержит правила и паттерны, которые необходимо соблюдать при разработке проекта.

> **ВАЖНО**: Общение ИИ (Antigravity) с пользователем, комментарии к коду и описание изменений должны всегда осуществляться на **русском языке**.


## 1. Уведомления и взаимодействие с пользователем
- **Никаких стандартных браузерных уведомлений**: Не используйте `alert()`, `confirm()` или `prompt()`.
- **Кастомные уведомления**: Используйте хук `useToast` из `@/components/ui/toast`.
  - Пример использования: 
    ```tsx
    const { toast } = useToast();
    toast("Успешно сохранено", "success");
    toast("Произошла ошибка", "error");
    ```
- **Подтверждение действий**: Вместо `confirm()` используйте `ConfirmDialog` из `@/components/ui/confirm-dialog` или `ResponsiveModal`.

## 2. Стилизация и UI компоненты
- **Библиотека компонентов**: Все базовые UI элементы (кнопки, вводы, диалоги) должны браться из `components/ui`.
- **Иконки**: Используйте исключительно `lucide-react`.
- **Анимации**: При создании новых страниц или крупных блоков добавляйте классы `animate-in fade-in duration-500` для плавного появления.
- **Border Radius**: Все функциональные блоки, карточки, контейнеры, кнопки и инпуты ДОЛЖНЫ иметь `rounded-[14px]`. Исключение: только идеально круглые элементы (индикаторы, аватары) могут использовать `rounded-full`.
- **Spacing и Layout**: Sidebar — 300px, основной контент — `flex-1`, между ними `gap-4`.
- **State Persistence**: Все клиентские табы, активные секции и важные состояния ДОЛЖНЫ быть синхронизированы с URL через `useSearchParams` / `router.replace('?tab=...', { scroll: false })`. Это обеспечивает сохранение состояния при обновлении страницы.
- **Хлебные крошки**: Технические сегменты пути (например, `finance`, `promocodes`) ДОЛЖНЫ быть отражены в словаре `routeLabels` в `components/layout/breadcrumbs.tsx`.

## 3. Работа с данными
- **Server Actions**: Все изменения данных (INSERT, UPDATE, DELETE) должны проходить через Server Actions в соответствующих файлах `actions.ts`.
- **Валидация**: Используйте `zod` для валидации данных на стороне сервера.
- **Логирование**: Все важные действия (создание, удаление, изменение настроек) должны записываться в таблицу `audit_logs` через `db.insert(auditLogs)`.

## 4. Язык и локализация
- **Интерфейс**: Весь текст интерфейса должен быть на **русском языке**.
- **Общение с ИИ**: Ответы Antigravity, пояснения к коду, отчеты о проделанной работе и любые другие текстовые взаимодействия должны быть исключительно на **русском языке**.

- **Грамматика и склонения**: СТРОГО ОБЯЗАТЕЛЬНО использовать утилиту `pluralize` из `@/lib/pluralize` для всех динамических чисел.
  - **Числа**: (1 позиция, 2 позиции, 5 позиций).
  - **Род и согласование**: Используйте функции `inflect` или `sentence` для правильного согласования глаголов с существительными (например, "Удалена 1 позиция" vs "Удалено 5 позиций").
  - Пример:
    ```tsx
    import { pluralize, sentence } from "@/lib/pluralize";
    // Простая форма
    <span>{count} {pluralize(count, 'позиция', 'позиции', 'позиций')}</span>
    // Полная фраза с родом (женский род 'f')
    <p>{sentence(count, 'f', { one: 'Удалена', many: 'Удалено' }, { one: 'позиция', few: 'позиции', many: 'позиций' })}</p>
    ```
- **Даты**: Для форматирования дат используйте `date-fns` с локалью `ru`.
  ```tsx
  import { ru } from "date-fns/locale";
  format(date, "d MMMM yyyy", { locale: ru });
  ```

## 5. Доступ и Роли
- **Проверка прав**: Всегда проверяйте права пользователя (роль) как на стороне клиента (для скрытия элементов UI), так и на стороне сервера (в Server Actions).
- **Администратор**: Полный доступ ко всем настройкам и логам.

## 6. Работа с таблицами
- **Единообразие стиля**: Все таблицы в приложении должны иметь одинаковый визуальный стиль (отступы, скругления углов `rounded-[2rem]` или `rounded-3xl`, тени, hover-эффекты).
- **Чек-боксы**: Каждая таблица (Заказы, Клиенты, Склад, Логи и т.д.) должна иметь колонку с чек-боксами для массового выбора записей.
- **Пагинация**: Использование компонента `Pagination` из `@/components/ui/pagination` обязательно для всех таблиц с потенциально большим количеством данных.
- **Массовые действия**: При выборе чек-боксов должна появляться панель массовых действий (Bulk Actions Panel), зафиксированная в нижней части экрана.
- **Адаптивность** *(обязательно)*: Каждая таблица ДОЛЖНА иметь мобильный вид (карточки). Использовать `ResponsiveDataView` с `renderTable` + `renderCard`, или вручную `hidden md:block` + `md:hidden`. Подробности: разделы 13-20.

## 7. Исправление ошибок и Рефакторинг
- **Сохранение дизайна**: При исправлении ошибок линтинга, типов (TypeScript) или техническом рефакторинге СТРОГО ЗАПРЕЩЕНО менять визуальный вид страницы, расположение элементов, отступы или логику UI.
- **Восстановление**: Если техническое исправление требует изменения структуры кода (например, разделения на компоненты), необходимо гарантировать, что итоговый рендер полностью соответствует оригиналу.
- **Проверка**: Перед коммитом технических правок сверяйте текущий вид страницы с предыдущим состоянием.

## 8. Компоновка PremiumSelect (выпадающие списки)

Компонент `PremiumSelect` автоматически определяет оптимальный layout на основе количества опций и средней длины текста.

### Правила автоматического выбора layout:

| Опций | Средняя длина текста | Layout |
|-------|---------------------|--------|
| 1-3 | любая | Вертикальный список |
| 4-8 | ≤ 10 символов | Grid 2 колонки |
| 9-15 | ≤ 4 символов | Grid 3 колонки |
| 16+ | любая | Вертикальный список + поиск |

### Примеры:
- **Статусы** (Активен, Архив) → вертикальный список
- **Размеры** (XS, S, M, L, XL) → grid 2 колонки
- **Короткие коды** (A, B, C, D, E...) → grid 3 колонки
- **Бренды** (16+ названий) → вертикальный список с поиском

### Использование:
```tsx
// Автоматический выбор layout (по умолчанию включен)
<PremiumSelect options={options} value={value} onChange={onChange} />

// Принудительный grid 2 колонки
<PremiumSelect options={options} value={value} onChange={onChange} gridColumns={2} />

// Отключить автоматический layout
<PremiumSelect options={options} value={value} onChange={onChange} autoLayout={false} />
```

## 9. Динамический контраст (Светлое/Темное)

При использовании динамических цветов (например, индикаторы цвета товара, метки категорий) необходимо автоматически подбирать контрастный цвет для иконок или текста.

### Хелпер для определения яркости:
```typescript
const isLightColor = (hex: string) => {
    // Убираем # если он есть
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    
    // Формула яркости (Luminance)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Порог 0.65 оптимален для большинства интерфейсов
    return luminance > 0.65;
};
```

### Пример использования в UI:
```tsx
const hexColor = "#FF69B4"; // Динамический цвет
const isLight = isLightColor(hexColor);

return (
    <div 
        style={{ backgroundColor: hexColor }} 
        className="w-10 h-10 rounded-full flex items-center justify-center"
    >
        <Droplets className={cn(
            "w-5 h-5 transition-colors",
            isLight ? "text-slate-900/40" : "text-white/60"
        )} />
    </div>
);
```

### Правила:
1. **Автоматизация**: Не задавайте цвет иконки вручную для динамических подложек.
2. **Порог**: Для светлых тем проекта используйте порог яркости `0.65`.
3. **Объем**: Для создания эффекта объема на светлых цветах используйте темные внутренние тени (`shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]`), на темных — светлые.

## 10. Панели быстрых действий (Bulk Actions Panel)

Все всплывающие панели массовых действий в приложении должны иметь одинаковый дизайн.

### Стандарт оформления:
- **Расположение**: `fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]`.
- **Контейнер**:
  - **Стиль**: `bg-white/90` (чистый системный белый).
  - **Эффекты**: `backdrop-blur-3xl`, `border border-slate-200/60`, `shadow-[0_20px_50px_rgba(0,0,0,0.1)]`.
  - **Форма**: `rounded-full` (стиль "pill").
  - **Внутренние отступы**: `p-2.5 px-8` (обязательно широкие края, чтобы текст не прижимался).
  - **Расстояние (Gap)**: `gap-4` или `gap-6` (для просторности).
  - **Анимация**: `animate-in slide-in-from-bottom-10 fade-in duration-500`.
- **Элементы внутри**:
  - **Счетчик**: Круглый индикатор (`w-10 h-10 rounded-full`) цвета `bg-primary` с текстом `text-white` и тенью `shadow-lg shadow-primary/20`.
  - **Кнопки действий**: `rounded-full`, эффект `hover:bg-slate-100`, плавный переход `transition-all`.
  - **Текст и иконки**: Основной цвет `text-slate-500`, при наведении `text-slate-900`.
  - **Разделители**: `w-px h-8 bg-slate-200`.

### Пример структуры:
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
## 11. Панели фильтров и тулбары таблиц (Filter Trays)

Все основные таблицы и списки должны использовать единую систему фильтрации и поиска (стиль "Photo 2").

### Основные правила оформления:
- **Контейнер**: Класс `.crm-filter-tray`.
  - **Стиль**: `bg-slate-100/50`, `p-1.5`, `rounded-[20px]`, `border border-slate-200/30`.
  - **Эффекты**: `shadow-inner` (внутренняя тень для эффекта "утопленности").
  - **Layout**: `flex flex-row items-center gap-6`.
- **Поисковая строка**:
  - **Контейнер**: `relative flex-1`.
  - **Input**: Высота `h-11`, скругление `rounded-[14px]`, фон `bg-white`, `shadow-sm`.
  - **Шрифт**: `text-[13px] font-bold text-slate-900`.
- **Переключатели (Tabs / Filters)**:
  - **Анимация**: ОБЯЗАТЕЛЬНО Использовать `framer-motion` и `layoutId` для создания эффекта перетекающего фона.
  - **Кнопка**: `px-6 py-2.5 rounded-[14px] text-[13px] font-bold transition-all duration-300`.
  - **Активное состояние**: Текст `text-white`, индикатор `bg-primary` с тенью `shadow-lg shadow-primary/25`.
  - **Неактивное состояние**: Текст `text-slate-500`, при наведении `text-slate-900`.

### Пример структуры (Toolbar):
```tsx
<div className="crm-filter-tray gap-6 mb-8">
    {/* Search Box */}
    <div className="relative flex-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
            type="text" 
            placeholder="Поиск..." 
            className="w-full h-11 bg-white border-none rounded-[14px] pl-12 pr-10 text-[13px] font-bold text-slate-900 placeholder:text-slate-400 shadow-sm"
        />
    </div>

    {/* Animated Tabs */}
    <div className="flex items-center px-1 gap-2">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                    "relative px-6 py-2.5 rounded-[14px] text-[13px] font-bold transition-all duration-300 group",
                    active === tab.id ? "text-white" : "text-slate-500 hover:text-slate-900"
                )}
            >
                {active === tab.id && (
                    <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute inset-0 bg-primary rounded-[14px] shadow-lg shadow-primary/25"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <span className="relative z-10">{tab.label}</span>
            </button>
        ))}
    </div>
</div>
```

## 12. Мобильные шторки и модальные окна (BottomSheet / ResponsiveModal)

### Общие правила:
- **Компонент**: Для адаптивных модальных окон использовать `ResponsiveModal` из `@/components/ui/responsive-modal`.
- **Закрытие**: Системная кнопка закрытия предоставляется компонентом автоматически. **НЕ добавляйте** вторую ручную кнопку X в хедер.

### Закреплённый футер (Sticky Footer) — ОБЯЗАТЕЛЬНО
Во всех шторках блок кнопок действий **ДОЛЖЕН** быть закреплён внизу и **НЕ ДОЛЖЕН** скроллиться вместе с контентом.

#### Структура диалога:
```tsx
<ResponsiveModal isOpen={isOpen} onClose={onClose}>
    <div className="flex flex-col h-full overflow-hidden">
        {/* Header - НЕ скроллится */}
        <div className="p-6 pb-2 shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Заголовок</h2>
                    <p className="text-[11px] font-bold text-slate-500">Подзаголовок</p>
                </div>
            </div>
        </div>
        
        {/* Content - СКРОЛЛИТСЯ */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
            <form className="space-y-5">...</form>
        </div>
        
        {/* Footer - НЕ скроллится, закреплён внизу */}
        <div className="sticky bottom-0 z-10 p-5 pt-3 flex flex-row items-center justify-between gap-3 shrink-0 bg-white border-t border-slate-100">
            <button className="h-11 flex-1 w-0 lg:flex-none lg:w-auto lg:px-8 px-4 text-slate-400 hover:text-slate-600 font-bold text-sm">
                Отмена
            </button>
            <Button className="h-11 flex-1 w-0 lg:flex-none lg:w-auto lg:px-10 px-4 btn-dark rounded-[var(--radius-inner)] font-bold text-sm">
                Сохранить
            </Button>
        </div>
    </div>
</ResponsiveModal>
```

### Ключевые моменты:
1. **Родительский контейнер**: `flex flex-col h-full overflow-hidden` — критически важно для правильной работы.
2. **Скроллящаяся область**: `flex-1 overflow-y-auto` — только эта часть скроллится.
3. **Футер**: `sticky bottom-0 shrink-0` — всегда внизу, не участвует в скролле.
4. **Кнопки**: `flex-1 w-0` обеспечивает равную ширину (50/50), `px-4` задаёт минимальные отступы.

---

## 13. Адаптивная вёрстка — главный принцип

> **Весь функционал доступен на ВСЕХ устройствах.** Нет "урезанной" мобильной версии.

| Устройство | Отображение | Взаимодействие |
|------------|-------------|----------------|
| **Десктоп** | Таблицы, сайдбар, Dialog | Клик, горячие клавиши, drag-n-drop |
| **Планшет** | Таблицы/карточки, Sheet справа | Тап, свайп |
| **Мобильный** | Карточки, Sheet снизу | Тап, свайп |

### Полный функционал везде:

| Функция | Десктоп | Планшет | Мобильный |
|---------|---------|---------|-----------| 
| Просмотр списков | ✅ Таблицы | ✅ Таблицы | ✅ Карточки |
| Детали записи | ✅ Dialog | ✅ Sheet справа | ✅ Sheet снизу |
| Создание/Редактирование | ✅ Dialog | ✅ Sheet справа | ✅ Sheet снизу |
| Удаление | ✅ Dialog confirm | ✅ Sheet confirm | ✅ Sheet confirm |
| Массовые действия | ✅ Чекбоксы + тулбар | ✅ Чекбоксы + тулбар | ✅ Режим выбора + Sheet |
| Фильтрация | ✅ Inline | ✅ Inline/Sheet | ✅ Sheet |
| Сортировка | ✅ Клик по колонке | ✅ Клик по колонке | ✅ Sheet с опциями |

## 14. Брейкпоинты

| Префикс | Ширина | Устройства | Способ открытия контента |
|---------|--------|------------|--------------------------|
| (нет) | 0-639px | Телефоны | Bottom Sheet |
| `sm:` | ≥640px | Большие телефоны | Bottom Sheet |
| `md:` | ≥768px | Планшеты | Sheet справа |
| `lg:` | ≥1024px | Ноутбуки | Dialog / inline |
| `xl:` | ≥1280px | Десктопы | Dialog / inline |
| `2xl:` | ≥1536px | Большие мониторы | Dialog / inline |

Устройства для тестирования: 320px (iPhone SE), 375px (iPhone 12-14), 768px (iPad), 1024px (iPad Pro), 1280px (MacBook Air), 1920px (Full HD).

## 15. Обязательные адаптивные компоненты

| Задача | Компонент | Импорт |
|--------|-----------|--------|
| Любое модальное окно | `ResponsiveModal` | `@/components/ui/responsive-modal` |
| Таблица с данными | `ResponsiveDataView` | `@/components/ui/responsive-data-view` |
| Подтверждение действия | `ConfirmDialog` | `@/components/ui/confirm-dialog` |

## 16. ResponsiveDataView — адаптивные таблицы

Десктоп (md+) → полноценная таблица. Мобильный (<md) → карточки.

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

### Ручная альтернатива:
```tsx
{/* Десктоп — таблица */}
<div className="hidden md:block"><table>...</table></div>

{/* Мобильный — карточки */}
<div className="md:hidden divide-y divide-slate-100">
    {items.map(item => <div key={item.id} className="p-4">...</div>)}
</div>
```

## 17. Адаптивные сетки

```tsx
// ✅ Правильно — адаптивная сетка
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// ❌ Неправильно — фиксированная сетка
<div className="grid grid-cols-4 gap-4">
```

## 18. Адаптивный текст кнопок

```tsx
// ✅ Текст скрывается на мобильном, иконка остаётся
<button>
    <Plus className="w-4 h-4" />
    <span className="hidden sm:inline">Добавить позицию</span>
</button>
```

## 19. Запрещённые паттерны (адаптивность)

| Паттерн | Почему нельзя | Что использовать |
|---------|---------------|-----------------|
| `import { Dialog } from "@/components/ui/dialog"` | Не адаптивный | `ResponsiveModal` |
| `<table>` без мобильной альтернативы | Не читается на мобильном | `ResponsiveDataView` |
| `overflow-x-auto` вокруг таблицы (без `hidden md:block`) | Горизонтальный скролл | Карточки на мобильном |
| `grid-cols-N` без `grid-cols-1` базы | Не адаптивный | `grid-cols-1 sm:grid-cols-N` |
| Фиксированная ширина (`w-[500px]`) | Ломает мобильный | `w-full max-w-[500px]` |

## 20. Чеклист адаптивности перед коммитом

- [ ] Все модальные окна используют `ResponsiveModal`
- [ ] Все таблицы имеют мобильный вид (карточки)
- [ ] Все сетки начинаются с `grid-cols-1`
- [ ] Нет фиксированных ширин без `max-w-`
- [ ] Текст кнопок скрыт на мобильном (`hidden sm:inline`)
- [ ] Нет прямых импортов `Dialog` / `DialogContent`
