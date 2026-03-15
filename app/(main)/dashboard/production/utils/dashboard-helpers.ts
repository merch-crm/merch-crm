import { format, formatDistanceToNow, isToday, isTomorrow, isPast } from "date-fns";
import { ru } from "date-fns/locale";

/**
 * Форматирует дату для отображения в дашборде
 */
export function formatDashboardDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(d)) return "Сегодня";
  if (isTomorrow(d)) return "Завтра";
  
  return format(d, "d MMMM", { locale: ru });
}

/**
 * Форматирует относительное время
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: ru });
}

/**
 * Проверяет, просрочена ли дата
 */
export function isOverdue(date: Date | string | null): boolean {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return isPast(d) && !isToday(d);
}

/**
 * Вычисляет процент с округлением
 */
export function calculatePercentage(value: number, total: number, decimals: number = 0): number {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return Number(percentage.toFixed(decimals));
}

/**
 * Вычисляет тренд между двумя значениями
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Получает цвет для значения загрузки
 */
export function getLoadColor(percentage: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (percentage >= 80) {
    return {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    };
  }
  if (percentage >= 50) {
    return {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    };
  }
  return {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  };
}

/**
 * Получает цвет для значения эффективности
 */
export function getEfficiencyColor(percentage: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (percentage >= 80) {
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    };
  }
  if (percentage >= 50) {
    return {
      text: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    };
  }
  return {
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-100",
  };
}

/**
 * Получает цвет для тренда
 */
export function getTrendColor(trend: number, invertColors: boolean = false): {
  text: string;
  bg: string;
  border: string;
} {
  const isPositive = invertColors ? trend < 0 : trend > 0;
  const isNegative = invertColors ? trend > 0 : trend < 0;

  if (isPositive) {
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    };
  }
  if (isNegative) {
    return {
      text: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    };
  }
  return {
    text: "text-slate-500",
    bg: "bg-slate-100",
    border: "border-slate-200",
  };
}

/**
 * Получает цвет для приоритета
 */
export function getPriorityColor(priority: "high" | "medium" | "low"): {
  text: string;
  bg: string;
  border: string;
  dot: string;
} {
  switch (priority) {
    case "high":
      return {
        text: "text-rose-600",
        bg: "bg-rose-50",
        border: "border-rose-200",
        dot: "bg-rose-500",
      };
    case "medium":
      return {
        text: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        dot: "bg-amber-500",
      };
    case "low":
    default:
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
  }
}

/**
 * Нормализует массив данных для sparkline (0-100)
 */
export function normalizeSparklineData(data: number[]): number[] {
  if (!Array.isArray(data) || data.length === 0) return [];
  const max = Math.max(...(data || []), 1);
  return (data || []).map((v) => Math.round((v / max) * 100));
}

/**
 * Генерирует цвет для тепловой карты
 */
export function getHeatmapColor(value: number): string {
  if (value === 0) return "bg-slate-100";
  if (value < 25) return "bg-emerald-200";
  if (value < 50) return "bg-emerald-400";
  if (value < 75) return "bg-amber-400";
  return "bg-rose-500";
}

/**
 * Форматирует число с разделителями тысяч
 */
export function formatNumber(value: number): string {
  return value.toLocaleString("ru-RU");
}

/**
 * Форматирует валюту
 */
export function formatCurrency(value: number, currency: string = "₽"): string {
  return `${formatNumber(value)} ${currency}`;
}

/**
 * Генерирует инициалы из имени
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
