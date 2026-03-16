/**
 * Основные метрики производства
 */
export interface ProductionMetrics {
    totalCompleted: number;
    totalInProgress: number;
    totalDefects: number;
    defectRate: number;
    averageCompletionTime: number;
    onTimeDeliveryRate: number;
    trend: number;
}

/**
 * Ежедневная выработка
 */
export interface DailyOutput {
    date: string;
    completed: number;
    defects: number;
    target: number;
}

/**
 * Топ сотрудников по эффективности
 */
export interface TopPerformer {
    id: string;
    name: string;
    avatar: string | null;
    completedTasks: number;
    efficiency: number;
    defectRate: number;
}

/**
 * Расход материалов
 */
export interface MaterialUsage {
    id: string;
    name: string;
    consumed: number;
    unit: string;
    cost: number;
    trend: number;
}

/**
 * Брак по типам
 */
export interface DefectByType {
    type: string;
    count: number;
    percentage: number;
    color: string;
}
