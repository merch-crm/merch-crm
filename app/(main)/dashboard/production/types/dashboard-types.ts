/**
 * @fileoverview Общие типы и интерфейсы для производственной панели управления
 * @module app/(main)/dashboard/production/types
 */

/**
 * Статистика производства
 */
export interface DashboardActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProductionStats {
  inQueue: number;
  inProgress: number;
  completedToday: number;
  completedWeek: number;
  overdue: number;
  paused: number;
  totalQuantityToday: number;
  activeStaff: number;
  totalStaff: number;
  activeLines: number;
  totalLines: number;
}

/**
 * Загрузка производственной линии
 */
export interface LineLoad {
  id: string;
  name: string;
  code: string;
  color: string | null;
  tasksCount: number;
  totalQuantity: number;
  inProgress: number;
}

/**
 * Краткая информация о производственной задаче
 */
export interface ProductionTaskSummary {
  id: string;
  taskNumber: string;
  title: string;
  status: string;
  priority: string;
  progress: number;
  quantity: number;
  lineId: string | null;
  lineName?: string;
  assigneeId: string | null;
  assigneeName?: string;
  dueDate: string | null;
  createdAt: string;
}

/**
 * Статус оборудования
 */
export interface EquipmentStatus {
  id: string;
  name: string;
  status: string;
  category: string;
  nextMaintenanceDate: string | null;
  needsMaintenance: boolean;
}

/**
 * Сотрудник на смене
 */
export interface StaffOnShift {
  id: string;
  name: string;
  position: string | null;
  lineId: string | null;
  lineName?: string;
  activeTasks: number;
}

/**
 * Элемент производственной доски (Order Item)
 */
export interface ProductionBoardItem {
  id: string;
  description: string | null;
  quantity: number;
  order: {
    id: string;
    orderNumber: string | null;
    status: string;
    attachments: { id: string; fileUrl: string; fileName: string }[];
  } | null;
}
