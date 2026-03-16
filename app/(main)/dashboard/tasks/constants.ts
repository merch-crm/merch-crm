import type { TaskStatus, TaskPriority, TaskType } from "@/lib/types/tasks";

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; className: string; bgClass: string }
> = {
  new: {
    label: "Новая",
    color: "#8b5cf6",
    className: "text-violet-700",
    bgClass: "bg-violet-100",
  },
  in_progress: {
    label: "В работе",
    color: "#3b82f6",
    className: "text-blue-700",
    bgClass: "bg-blue-100",
  },
  review: {
    label: "Проверка",
    color: "#f59e0b",
    className: "text-amber-700",
    bgClass: "bg-amber-100",
  },
  done: {
    label: "Готово",
    color: "#10b981",
    className: "text-emerald-700",
    bgClass: "bg-emerald-100",
  },
  cancelled: {
    label: "Отменена",
    color: "#ef4444",
    className: "text-red-700",
    bgClass: "bg-red-100",
  },
  archived: {
    label: "В архиве",
    color: "#6b7280",
    className: "text-gray-700",
    bgClass: "bg-gray-100",
  },
};

export const TASK_PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; className: string; bgClass: string }
> = {
  low: {
    label: "Низкий",
    color: "#94a3b8",
    className: "text-slate-600",
    bgClass: "bg-slate-100",
  },
  normal: {
    label: "Средний",
    color: "#3b82f6",
    className: "text-blue-600",
    bgClass: "bg-blue-100",
  },
  high: {
    label: "Высокий",
    color: "#f59e0b",
    className: "text-amber-600",
    bgClass: "bg-amber-100",
  },
  urgent: {
    label: "Срочный",
    color: "#ef4444",
    className: "text-red-600",
    bgClass: "bg-red-100",
  },
};

export const TASK_TYPE_CONFIG: Record<TaskType, { label: string; icon: string }> = {
  general: { label: "Общая", icon: "📋" },
  design: { label: "Дизайн", icon: "🎨" },
  production: { label: "Производство", icon: "🏭" },
  acquisition: { label: "Закупка", icon: "🛒" },
  delivery: { label: "Доставка", icon: "🚚" },
  inventory: { label: "Склад", icon: "📦" },
  maintenance: { label: "Обслуживание", icon: "🔧" },
  other: { label: "Другое", icon: "📌" },
};

export const KANBAN_COLUMNS: TaskStatus[] = ["new", "in_progress", "review", "done"];
