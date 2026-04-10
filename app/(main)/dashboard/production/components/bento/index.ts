// app/(main)/dashboard/production/components/bento/index.ts

// Герой-блок и статистика
export { HeroProductionCard } from './hero-production-card';
export { AttentionCard } from './attention-card';
export { StatsGrid } from './stats-grid';
export { ProductionStagesCard } from './production-stages-card';

// Быстрый доступ и калькуляторы
export { QuickAccessGrid } from './quick-access-grid';
export { CalculatorsGrid } from './calculators-grid';
export { CalculatorsTabs } from './calculators-tabs';

// Графики
export { WeeklyOutputChart } from './weekly-output-chart';
export { LineLoadChart } from './line-load-chart';
export { HeatmapCard } from './heatmap-card';

// Задачи и дедлайны
export { UrgentTasksCard } from './urgent-tasks-card';
export { DeadlineCalendarCard } from './deadline-calendar-card';
export { MiniCalendar } from './mini-calendar';
export { UpcomingDeadlinesCard } from './upcoming-deadlines-card';

// Аналитика
export { TopApplicationTypesCard } from './top-application-types-card';
export { DefectStatsCard } from './defect-stats-card';
export { ConversionRateCard } from './conversion-rate-card';

// Сотрудники и оборудование
export { EquipmentStatusCard } from './equipment-status-card';
export { StaffOnShiftCard } from './staff-on-shift-card';
export { StaffLoadCard } from './staff-load-card';

// Материалы и склад
export { MaterialsLowCard } from './materials-low-card';
export { MaterialConsumptionCard } from './material-consumption-card';

// Уведомления
export { NotificationsCard } from './notifications-card';

// Скелетоны
export {
 ProductionDashboardSkeleton,
 HeroSkeleton,
 AttentionSkeleton,
 StatCardSkeleton,
 QuickAccessSkeleton,
 ChartSkeleton,
 CardSkeleton,
} from './bento-skeleton';
