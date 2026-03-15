# Чеклист готовности производственного дашборда

## Компоненты Bento-дашборда

### Герой-блок и статистика
- [x] `HeroProductionCard` — оранжевый герой-блок
- [x] `AttentionCard` — блок срочных/просроченных
- [x] `StatsGrid` — сетка статистики (конверсия, эффективность, готово сегодня)
- [x] `ProductionStagesCard` — этапы производства

### Быстрый доступ
- [x] `QuickAccessGrid` — 6 карточек быстрого доступа
- [x] `CalculatorsGrid` — мини-сетка калькуляторов
- [x] `CalculatorsTabs` — табы навигации калькуляторов

### Графики и аналитика
- [x] `WeeklyOutputChart` — выработка за неделю
- [x] `LineLoadChart` — загрузка линий
- [x] `HeatmapCard` — тепловая карта загрузки
- [x] `TopApplicationTypesCard` — топ типов нанесения
- [x] `DefectStatsCard` — статистика брака
- [x] `ConversionRateCard` — конверсия заказов

### Задачи и дедлайны
- [x] `UrgentTasksCard` — срочные задачи
- [x] `DeadlineCalendarCard` — календарь дедлайнов
- [x] `MiniCalendar` — мини-календарь
- [x] `UpcomingDeadlinesCard` — ближайшие дедлайны

### Сотрудники и оборудование
- [x] `EquipmentStatusCard` — статус оборудования
- [x] `StaffOnShiftCard` — сотрудники на смене
- [x] `StaffLoadCard` — рейтинг сотрудников

### Материалы и склад
- [x] `MaterialsLowCard` — материалы на исходе
- [x] `MaterialConsumptionCard` — расход материалов
- [x] `WarehouseMaterialPicker` — выбор материала
- [x] `WarehouseMaterialsList` — список выбранных материалов

### Уведомления
- [x] `NotificationsCard` — системные уведомления

### Скелетоны
- [x] `ProductionDashboardSkeleton` — полный скелетон
- [x] Отдельные скелетоны для секций

## Server Actions

### `bento-dashboard-actions.ts`
- [x] `getHeroStats`
- [x] `getAttentionStats`
- [x] `getBaseStats`
- [x] `getConversionStats`
- [x] `getHeatmapData`
- [x] `getTopApplicationTypes`
- [x] `getDefectStats`
- [x] `getStaffLoadData`
- [x] `getMaterialAlerts`
- [x] `getMaterialConsumption`
- [x] `getShiftEfficiency`
- [x] `getDeadlineCalendar`
- [x] `getSystemNotifications`
- [x] `getDailyOutput`
- [x] `getLineLoad`

### `warehouse-integration-actions.ts`
- [x] `getWarehouseMaterialsForCalculator`
- [x] `getWarehouseCategoriesForCalculator`
- [x] `reserveMaterialsForOrder`
- [x] `consumeMaterialsForOrder`

## Типы данных

- [x] `ProductionHeroStats`
- [x] `AttentionStats`
- [x] `ProductionBaseStats`
- [x] `ConversionStats`
- [x] `HeatmapData`, `HeatmapCell`
- [x] `TopApplicationType`
- [x] `DefectStats`, `DefectCategory`
- [x] `StaffLoadItem`, `StaffLoadData`
- [x] `MaterialAlert`
- [x] `MaterialConsumptionData`, `MaterialConsumptionFilters`
- [x] `ShiftEfficiencyData`
- [x] `DeadlineCalendarData`, `CalendarDeadline`, `CalendarOrder`
- [x] `SystemNotification`, `NotificationsData`
- [x] `DailyOutputItem`, `LineLoadItem`
- [x] `StatsPeriod`, `DashboardFilters`

## Страницы

- [x] `page.tsx` — главная страница с Suspense
- [x] `loading.tsx` — страница загрузки
- [x] `error.tsx` — страница ошибки

## Калькуляторы

- [x] `layout.tsx` — layout с табами
- [x] `page.tsx` — обзор калькуляторов
- [x] `CalculatorLayout` — раскладка форма/результаты
- [x] `CalculatorSkeleton` — скелетон калькулятора

## Утилиты и хуки

- [x] `dashboard-helpers.ts` — вспомогательные функции
- [x] `use-dashboard-refresh.ts` — хук обновления
- [x] `use-period-filter.ts` — хук фильтра периода

## Документация

- [x] `README.md` — описание структуры и использования
- [x] `CHECKLIST.md` — этот чеклист

## Соответствие UX_STANDARDS.md

- [x] Использован класс `crm-card` для карточек
- [x] Скругления по стандарту (rounded-2xl, rounded-xl)
- [x] Отступы: gap-3 между блоками
- [x] Нет uppercase в тексте
- [x] Адаптивная сетка с grid-cols-1 базой
- [x] Компоненты из @/components/ui/
- [x] Framer Motion для анимации табов

## Интеграции

- [x] Связь со складом (warehouse)
- [x] Связь с задачами (productionTasks)
- [x] Связь с оборудованием (equipment)
- [x] Связь с сотрудниками (productionStaff)
- [x] Связь с линиями (productionLines)
- [x] Связь с типами нанесения (applicationTypes)

## Тестирование (TODO)

- [ ] Unit-тесты для утилит
- [ ] Unit-тесты для хуков
- [ ] Integration-тесты для server actions
- [ ] E2E-тесты для дашборда
