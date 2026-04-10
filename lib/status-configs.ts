import { type LucideIcon, Shield, ShieldCheck, User, HardHat, Palette, Printer, Sparkles, Paintbrush, Settings2, CheckCircle2, Truck, Flame, Thermometer, Snowflake, Zap, Circle, CircleDashed, PieChart, RefreshCcw } from "lucide-react";
import type { BadgeColor } from "@/components/ui/badge";

export interface BadgeConfig {
  label: string;
  color: BadgeColor;
  icon?: LucideIcon;
}

/**
 * Конфигурация ролей пользователей
 */
export const ROLE_CONFIGS: Record<string, BadgeConfig> = {
  "Администратор": { label: "АДМИНИСТРАТОР", color: "danger" as BadgeColor, icon: Shield },
  "Управляющий": { label: "УПРАВЛЯЮЩИЙ", color: "warning" as BadgeColor, icon: ShieldCheck },
  "Отдел продаж": { label: "ПРОДАЖИ", color: "info" as BadgeColor, icon: User },
  "Дизайнер": { label: "ДИЗАЙНЕР", color: "primary" as BadgeColor, icon: Palette },
  "Печатник": { label: "ПЕЧАТНИК", color: "success" as BadgeColor, icon: Printer },
  "Монтажник": { label: "МОНТАЖНИК", color: "neutral" as BadgeColor, icon: HardHat },
};

/**
 * Конфигурация статусов заказов
 */
export const ORDER_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  "new": { label: "НОВЫЙ", color: "info" as BadgeColor, icon: Sparkles },
  "design": { label: "ДИЗАЙН", color: "primary" as BadgeColor, icon: Paintbrush },
  "production": { label: "ПРОИЗВОДСТВО", color: "warning" as BadgeColor, icon: Settings2 },
  "done": { label: "ГОТОВ", color: "success" as BadgeColor, icon: CheckCircle2 },
  "shipped": { label: "ОТПРАВЛЕН", color: "neutral" as BadgeColor, icon: Truck },
};

/**
 * Конфигурация температуры лида
 */
export const LEAD_TEMP_CONFIGS: Record<string, BadgeConfig> = {
  "hot": { label: "ГОРЯЧИЙ", color: "danger" as BadgeColor, icon: Flame },
  "warm": { label: "ТЕПЛЫЙ", color: "warning" as BadgeColor, icon: Thermometer },
  "cold": { label: "ХОЛОДНЫЙ", color: "info" as BadgeColor, icon: Snowflake },
};

/**
 * Конфигурация приоритетов заказов
 */
export const PRIORITY_CONFIGS: Record<string, BadgeConfig> = {
  "normal": { label: "ОБЫЧНЫЙ", color: "neutral" as BadgeColor, icon: Circle },
  "medium": { label: "СРЕДНИЙ", color: "warning" as BadgeColor, icon: Circle },
  "high": { label: "СРОЧНЫЙ", color: "danger" as BadgeColor, icon: Zap },
};

/**
 * Конфигурация статусов оплаты
 */
export const PAYMENT_STATUS_CONFIGS: Record<string, BadgeConfig> = {
  "unpaid": { label: "НЕ ОПЛАЧЕН", color: "neutral" as BadgeColor, icon: CircleDashed },
  "partial": { label: "ЧАСТИЧНО", color: "warning" as BadgeColor, icon: PieChart },
  "paid": { label: "ОПЛАЧЕН", color: "success" as BadgeColor, icon: CheckCircle2 },
  "refunded": { label: "ВОЗВРАТ", color: "danger" as BadgeColor, icon: RefreshCcw },
};

/**
 * Вспомогательная функция для получения конфига роли
 */
export function getRoleBadgeConfig(role: string): BadgeConfig {
  return ROLE_CONFIGS[role] || { label: role.toUpperCase(), color: "neutral", icon: User };
}

/**
 * Вспомогательная функция для получения конфига статуса
 */
export function getOrderStatusBadgeConfig(status: string): BadgeConfig {
  return ORDER_STATUS_CONFIGS[status] || ORDER_STATUS_CONFIGS.new;
}

/**
 * Вспомогательная функция для получения конфига лида
 */
export function getLeadTempBadgeConfig(temp: string): BadgeConfig {
  return LEAD_TEMP_CONFIGS[temp] || LEAD_TEMP_CONFIGS.cold;
}
/**
 * Вспомогательная функция для получения конфига приоритета
 */
export function getPriorityBadgeConfig(priority: string): BadgeConfig {
  return PRIORITY_CONFIGS[priority] || PRIORITY_CONFIGS.normal;
}

/**
 * Вспомогательная функция для получения конфига статуса оплаты
 */
export function getPaymentStatusBadgeConfig(status: string): BadgeConfig {
  return PAYMENT_STATUS_CONFIGS[status] || PAYMENT_STATUS_CONFIGS.unpaid;
}

