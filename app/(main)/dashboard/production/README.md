# Производственный дашборд MerchCRM

## Обзор

Bento-дашборд для управления производственными процессами. Реализован в соответствии с UX_STANDARDS.md.

## Структура файлов

app/(main)/dashboard/production/
├── page.tsx                        # Главная страница дашборда
├── loading.tsx                     # Скелетон загрузки
├── error.tsx                       # Страница ошибки
├── types/
│   ├── index.ts                    # Экспорт типов
│   └── bento-dashboard-types.ts    # Все типы дашборда
├── actions/
│   ├── index.ts                    # Экспорт actions
│   ├── bento-dashboard-actions.ts  # Server actions для виджетов
│   ├── warehouse-integration-actions.ts # Интеграция со складом
│   └── production-dashboard-actions.ts # Существующие actions
├── components/
│   ├── index.ts                    # Экспорт компонентов
│   ├── production-bento-dashboard.tsx # Главный компонент дашборда
│   ├── calculator-layout.tsx       # Раскладка калькуляторов
│   ├── calculator-skeleton.tsx     # Скелетон калькуляторов
│   ├── warehouse-material-picker.tsx # Выбор материалов со склада
│   ├── warehouse-materials-list.tsx # Список выбранных материалов
│   └── bento/
│       ├── index.ts                # Экспорт bento-компонентов
│       ├── hero-production-card.tsx # Герой-блок (оранжевый)
│       ├── attention-card.tsx       # Блок "Внимание"
│       ├── stats-grid.tsx           # Сетка статистики
│       ├── quick-access-grid.tsx    # Быстрый доступ
│       ├── calculators-grid.tsx     # Мини-сетка калькуляторов
│       ├── calculators-tabs.tsx     # Табы калькуляторов
│       ├── weekly-output-chart.tsx  # График выработки
│       ├── line-load-chart.tsx      # Загрузка линий
│       ├── heatmap-card.tsx         # Тепловая карта
│       ├── urgent-tasks-card.tsx    # Срочные задачи
│       ├── deadline-calendar-card.tsx # Календарь дедлайнов
│       ├── top-application-types-card.tsx # Топ типов нанесения
│       ├── defect-stats-card.tsx   # Статистика брака
│       ├── conversion-rate-card.tsx # Конверсия заказов
│       ├── equipment-status-card.tsx # Статус оборудования
│       ├── staff-on-shift-card.tsx  # Сотрудники на смене
│       ├── staff-load-card.tsx      # Рейтинг сотрудников
│       ├── materials-low-card.tsx   # Материалы на исходе
│       ├── material-consumption-card.tsx # Расход материалов
│       ├── notifications-card.tsx   # Уведомления системы
│       └── bento-skeleton.tsx      # Скелетоны загрузки
└── calculators/
    ├── layout.tsx                  # Layout с табами
    ├── page.tsx                    # Обзор калькуляторов
    └── [тип]/                      # Страницы калькуляторов


## Компоненты дашборда

### Герой-блок (`HeroProductionCard`)
- Оранжевый градиент `from-amber-500 via-orange-500 to-orange-600`
- Отображает количество активных заказов
- Среднее время выполнения
- Тренд по сравнению с прошлой неделей

### Блок внимания (`AttentionCard`)
- Срочные и просроченные задачи
- Цветовая индикация (зелёный если всё ок, красный если есть проблемы)

### Статистика (`StatsGrid`)
- Конверсия заказов (% выполненных в срок)
- Эффективность смены (KPI)
- Завершено сегодня

### Тепловая карта (`HeatmapCard`)
- Сетка 7 дней × 12 часов (8:00-20:00)
- Градация цветов по загрузке
- Tooltip с деталями

### Календарь дедлайнов (`DeadlineCalendarCard`)
- Навигация по месяцам
- Индикаторы на днях с дедлайнами
- Попап с деталями заказов

## Server Actions

### `bento-dashboard-actions.ts`

| Функция | Описание |
|---------|----------|
| `getHeroStats()` | Данные для герой-блока |
| `getAttentionStats()` | Срочные/просроченные задачи |
| `getBaseStats()` | Базовая статистика |
| `getConversionStats(period)` | Конверсия заказов |
| `getHeatmapData(days)` | Тепловая карта загрузки |
| `getTopApplicationTypes(limit)` | Топ типов нанесения |
| `getDefectStats(period)` | Статистика брака |
| `getStaffLoadData()` | Загрузка сотрудников |
| `getMaterialAlerts()` | Материалы на исходе |
| `getMaterialConsumption(filters)` | Расход материалов |
| `getShiftEfficiency()` | Эффективность смены |
| `getDeadlineCalendar(month, year)` | Календарь дедлайнов |
| `getSystemNotifications()` | Уведомления системы |
| `getDailyOutput(days)` | Выработка за период |
| `getLineLoad()` | Загрузка линий |

### `warehouse-integration-actions.ts`

| Функция | Описание |
|---------|----------|
| `getWarehouseMaterialsForCalculator(params)` | Материалы для калькулятора |
| `getWarehouseCategoriesForCalculator()` | Категории материалов |
| `reserveMaterialsForOrder(orderId, materials)` | Резервирование |
| `consumeMaterialsForOrder(orderId, materials)` | Списание |

## Типы данных

Все типы определены в `types/bento-dashboard-types.ts`:

- `ProductionHeroStats` — герой-блок
- `AttentionStats` — блок внимания
- `ConversionStats` — конверсия
- `HeatmapData`, `HeatmapCell` — тепловая карта
- `TopApplicationType` — типы нанесения
- `DefectStats`, `DefectCategory` — брак
- `StaffLoadItem`, `StaffLoadData` — сотрудники
- `MaterialAlert` — материалы на исходе
- `ShiftEfficiencyData` — эффективность смены
- `DeadlineCalendarData`, `CalendarDeadline`, `CalendarOrder` — календарь
- `SystemNotification`, `NotificationsData` — уведомления
- `DailyOutputItem`, `LineLoadItem` — графики

## Использование компонентов

### Импорт

```tsx
import {
  HeroProductionCard,
  AttentionCard,
  StatsGrid,
  // ...
} from "./components/bento";

import {
  WarehouseMaterialPicker,
  WarehouseMaterialsList,
} from "./components";
```

### Выбор материалов в калькуляторе

```tsx
import { WarehouseMaterialsList, type SelectedMaterial } from "../components";

const [materials, setMaterials] = useState<SelectedMaterial[]>([]);

<WarehouseMaterialsList
  materials={materials}
  onChange={setMaterials}
  applicationTypeFilter="dtf"
  title="Расходные материалы"
/>
```

## Стилизация
Все компоненты следуют UX_STANDARDS.md:

- Используется класс `crm-card` для карточек
- Скругления: `rounded-2xl` для карточек, `rounded-xl` для внутренних элементов
- Отступы: `gap-3` между блоками, `p-6` внутри карточек
- Цвета: primary (#5d00ff), градации slate для текста

## Адаптивность
- 12-колоночная сетка с брейкпоинтами
- Мобильная версия: все блоки в одну колонку
- Планшеты (md): 2 колонки
- Десктоп (lg): полная bento-сетка

## Производительность
- Все данные загружаются параллельно через `Promise.all`
- Suspense-границы для каждой секции
- Скелетоны для состояния загрузки
- Мемоизация тяжёлых вычислений через `useMemo`
