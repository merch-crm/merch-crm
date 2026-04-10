"use strict";

/**
 * Типы для Bento-дашборда производства
 * @description Все интерфейсы для виджетов и данных дашборда
 */

// ============================================================================
// Герой-блок и базовая статистика
// ============================================================================

/** Данные для главного герой-блока */
export interface ProductionHeroStats {
 /** Активные заказы в производстве */
 activeOrders: number;
 /** Среднее время выполнения заказа (строка, например "45 мин") */
 averageCompletionTime: string;
 /** Тренд по сравнению с прошлым периодом (-100 до +100) */
 trend: number;
}

/** Данные блока "Внимание" */
export interface AttentionStats {
 /** Срочные задачи */
 urgent: number;
 /** Просроченные задачи */
 overdue: number;
 /** Общее количество требующих внимания (опционально) */
 total?: number;
}

/** Базовая статистика производства (Устарело, используем ConversionStats для воронки) */
export interface ProductionBaseStats {
 inQueue: number;
 inProgress: number;
 paused: number;
 completedToday: number;
 overdue: number;
 activeLines: number;
 activeStaff: number;
}

// ============================================================================
// Конверсия и Воронка
// ============================================================================

/** Статистика конверсии и воронки статусов */
export interface ConversionStats {
 /** В очереди */
 inQueue: number;
 /** В работе */
 inProgress: number;
 /** На паузе */
 paused: number;
 /** Завершено сегодня */
 completedToday: number;
 /** Просрочено */
 overdue: number;
 /** Активные линии */
 activeLines: number;
 /** Сотрудники на смене */
 activeStaff: number;
 
 // Дополнительные поля для расширенной логики (опционально)
 onTimePercentage?: number;
 totalCompleted?: number;
 completedOnTime?: number;
 completedLate?: number;
 trend?: number;
 sparklineData?: number[];
}

// ============================================================================
// Тепловая карта загрузки
// ============================================================================

/** Ячейка тепловой карты */
export interface HeatmapCell {
 /** День недели (0-6) */
 dayOfWeek: number;
 /** Час (0-23) */
 hour: number;
 /** Значение загрузки (0-100) */
 value: number;
 /** Количество задач (опционально) */
 tasksCount?: number;
}

/** Данные тепловой карты */
export interface HeatmapData {
 /** Ячейки карты */
 cells: HeatmapCell[];
 /** Максимальное значение */
 maxValue: number;
 /** Средняя загрузка (опционально) */
 averageLoad?: number;
 /** Пиковый час */
 peakHour: number;
 /** Пиковый день */
 peakDay: number;
}

// ============================================================================
// Топ типов нанесения
// ============================================================================

/** Тип нанесения в топе */
export interface TopApplicationType {
 /** ID типа */
 id: string;
 /** Название */
 name: string;
 /** Код (опционально) */
 code?: string;
 /** Количество заказов (для совместимости) */
 count: number;
 /** Количество заказов (расширенно, опционально) */
 ordersCount?: number;
 /** Общее количество изделий (опционально) */
 totalQuantity?: number;
 /** Процент от общего */
 percentage: number;
 /** Цвет для отображения */
 color: string;
 /** Тренд (опционально) */
 trend?: number;
}

/** Статус задачи */
export type ProductionTaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'paused';

/** Приоритет задачи */
export type ProductionTaskPriority = 'low' | 'normal' | 'high' | 'urgent';

/** Тип категории брака */
export type DefectCategoryType = 'print' | 'material' | 'application' | 'other';

/** Описание категории брака */
export interface DefectCategoryInfo {
 id: DefectCategoryType;
 label: string;
 color: string;
 description: string;
}

/** Константы категорий брака */
export const DEFECT_CATEGORIES: DefectCategoryInfo[] = [
 { 
  id: 'print', 
  label: 'Печать', 
  color: '#ef4444', 
  description: 'Ошибки печати, цветопередачи, смещение' 
 },
 { 
  id: 'material', 
  label: 'Материал', 
  color: '#f59e0b', 
  description: 'Брак самого изделия или расходников' 
 },
 { 
  id: 'application', 
  label: 'Нанесение', 
  color: '#3b82f6', 
  description: 'Проблемы с термопрессом, вышивкой, сушкой' 
 },
 { 
  id: 'other', 
  label: 'Прочее', 
  color: '#6b7280', 
  description: 'Другие причины' 
 },
];

// ============================================================================
// Статистика брака
// ============================================================================

/** Статистика брака */
export interface DefectStats {
 totalDefects: number;
 defectRate: number; // %
 trend: number; // %
 byCategory: Array<{
  name: string;
  count: number;
  percentage: number;
  color: string;
 }>;
 recentDefects?: Array<{
  id: string;
  taskNumber: string;
  itemName: string;
  category: string;
  quantity: number;
  date: string;
 }>;
 sparklineData?: number[];
}

// ============================================================================
// Загрузка сотрудников
// ============================================================================

/** Данные загрузки сотрудника */
export interface StaffLoadItem {
 id: string;
 name: string;
 position: string | null;
 avatarUrl: string | null;
 /** Активные задачи (опционально) */
 activeTasks?: number;
 /** Завершено сегодня (опционально) */
 completedToday?: number;
 /** Процент загрузки (0-100) */
 loadPercentage: number;
 /** Эффективность (0-100) */
 efficiency: number;
 /** Линия */
 lineName: string | null;
}

/** Общие данные загрузки сотрудников */
export interface StaffLoadData {
 staff: StaffLoadItem[];
 averageLoad: number;
 averageEfficiency: number;
}

// ============================================================================
// Материалы (связь со складом)
// ============================================================================

/** Материал с критичным остатком */
export interface MaterialAlert {
 id: string;
 name: string;
 currentStock: number;
 minThreshold: number;
 unit: string;
 urgency: "critical" | "warning";
 // Поля для совместимости (опционально)
 sku?: string | null;
 currentQuantity?: number;
 minQuantity?: number;
 percentOfMin?: number;
 category?: string | null;
 applicationTypes?: string[];
}

/** Данные расхода материала (график) */
export interface MaterialConsumptionItem {
 date: string;
 amount: number;
 prediction: number;
}

/** Объект данных расхода (для Bento-дашборда может быть массивом или объектом) */
export type MaterialConsumptionData = MaterialConsumptionItem[] | {
 items: MaterialConsumptionItem[];
 totalValue: number;
 currency: string;
};

// ============================================================================
// Эффективность смены
// ============================================================================

/** Данные эффективности смены */
export interface ShiftEfficiencyData {
 /** Прогресс выполнения плана (%) */
 progress: number;
 /** Текущая эффективность (%) */
 efficiency: number;
 /** Выполнено изделий */
 completedItems: number;
 /** Всего изделий в плане */
 totalItems: number;
 /** Оставшееся время (строка) */
 timeRemaining: string;
 /** Статус */
 status: "on_track" | "behind" | "danger";
 
 // Дополнительные поля (опционально)
 current?: number;
 target?: number;
 plannedTasks?: number;
 completedTasks?: number;
 shiftStart?: string;
 shiftEnd?: string;
 timeElapsed?: number;
}

// ============================================================================
// Календарь дедлайнов
// ============================================================================

/** Заказ в календаре */
export interface CalendarOrder {
 id: string;
 number: string | null;
 client: string;
 status: "pending" | "in_progress" | "completed" | "paused";
 priority: "low" | "normal" | "high" | "urgent";
}

/** Дедлайн на календаре */
export interface CalendarDeadline {
 date: string;
 count: number; // Количество дедлайнов (для совместимости)
 ordersCount?: number;
 isUrgent: boolean;
 priorities?: {
  high: number;
  medium: number;
  low: number;
 };
 orders: CalendarOrder[];
}

/** Данные календаря дедлайнов */
export interface DeadlineCalendarData {
 deadlines: CalendarDeadline[];
 todaySummary: {
  count: number;
  urgent: number;
 };
 // Поля для расширенного календаря (опционально)
 month?: number;
 year?: number;
 totalOrders?: number;
}

// ============================================================================
// Выработка и графики
// ============================================================================

/** Данные выработки за день */
export interface DailyOutputItem {
 date: string;
 completed: number;
 defects: number;
 target: number;
 // Поля для совместимости (опционально)
 completedTasks?: number;
 completedQuantity?: number;
 planned?: number;
}

/** Данные загрузки линии */
export interface LineLoadItem {
 id: string;
 name: string;
 load: number; // %
 status: "active" | "idle" | "maintenance";
 tasksCount: number;
 color: string;
 // Расширенные поля (опционально)
 code?: string;
 inProgress?: number;
 pending?: number;
 completed?: number;
 totalQuantity?: number;
 loadPercentage?: number;
}

// ============================================================================
// Срочные задачи и Оборудование
// ============================================================================

/** Срочная задача для виджета */
export interface UrgentTask {
 id: string;
 taskNumber: string;
 title: string;
 status: string;
 priority: string;
 quantity: number;
 completedQuantity: number;
 progress: number;
 dueDate: string | null;
}

/** Элемент статуса оборудования */
export interface EquipmentStatusItem {
 id: string;
 name: string;
 status: "active" | "idle" | "maintenance" | "repair" | "offline";
 category: string;
 nextMaintenanceDate: string | null;
 needsMaintenance: boolean;
}

// ============================================================================
// Уведомления
// ============================================================================

export type NotificationType = 'overdue_task' | 'equipment_maintenance' | 'low_material' | 'unassigned_order' | 'system_alert' | 'approval_needed';
export type NotificationPriority = 'critical' | 'warning' | 'info';

export interface SystemNotification {
 id: string;
 type: NotificationType;
 priority: NotificationPriority;
 title: string;
 description: string;
 createdAt: string;
 href?: string;
}

export interface NotificationsData {
 notifications: SystemNotification[];
 counts: {
  critical: number;
  warning: number;
  info: number;
 };
}

// ============================================================================
// Общий тип данных дашборда
// ============================================================================

export interface OrderItem {
  id: string;
  description: string | null;
  quantity: number;
  order: {
    id: string;
    orderNumber: string;
    client: { name: string | null } | null;
    priority: string | null;
    attachments?: { id: string; fileUrl: string; fileName: string }[];
  };
  stagePrepStatus: string;
  stagePrintStatus: string;
  stageApplicationStatus: string;
  stagePackagingStatus: string;
}

/** Все данные для Bento-дашборда производства */
export interface ProductionBentoDashboardData {
 hero: ProductionHeroStats;
 attention: AttentionStats;
 baseStats?: ProductionBaseStats;
 conversion: ConversionStats;
 heatmap: HeatmapData;
 topApplicationTypes: TopApplicationType[];
 defects: DefectStats;
 staffLoad: StaffLoadData;
 materialAlerts: MaterialAlert[];
 materialConsumption: MaterialConsumptionData;
 shiftEfficiency: ShiftEfficiencyData;
 deadlineCalendar: DeadlineCalendarData;
 dailyOutput: DailyOutputItem[];
 lineLoad: LineLoadItem[];
 // Опциональные блоки
 notifications?: NotificationsData;
 urgentTasks?: UrgentTask[];
 equipmentStatus?: EquipmentStatusItem[];
 /** Позиции для Kanban-доски */
 kanbanItems?: OrderItem[];
}

export type StatsPeriod = "day" | "week" | "month";
