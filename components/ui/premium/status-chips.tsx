"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  PauseCircle,
  HelpCircle,
  type LucideIcon 
} from "lucide-react";

export type StatusType = "success" | "pending" | "warning" | "error" | "paused" | "unknown";

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

const STATUS_MAP: Record<StatusType, StatusConfig> = {
  success: {
    label: "Выполнено",
    icon: CheckCircle,
    colorClass: "text-emerald-700 dark:text-emerald-400",
    bgClass: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100/80 dark:border-emerald-800/50",
  },
  pending: {
    label: "В процессе",
    icon: Clock,
    colorClass: "text-blue-700 dark:text-blue-400",
    bgClass: "bg-blue-50/60 dark:bg-blue-950/30 border-blue-100/80 dark:border-blue-800/50",
  },
  warning: {
    label: "Внимание",
    icon: AlertCircle,
    colorClass: "text-amber-700 dark:text-amber-400",
    bgClass: "bg-amber-50/60 dark:bg-amber-950/30 border-amber-100/80 dark:border-amber-800/50",
  },
  error: {
    label: "Ошибка",
    icon: XCircle,
    colorClass: "text-rose-700 dark:text-rose-400",
    bgClass: "bg-rose-50/60 dark:bg-rose-950/30 border-rose-100/80 dark:border-rose-800/50",
  },
  paused: {
    label: "Приостановлено",
    icon: PauseCircle,
    colorClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-50/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/50",
  },
  unknown: {
    label: "Неизвестно",
    icon: HelpCircle,
    colorClass: "text-slate-400 dark:text-slate-500",
    bgClass: "bg-slate-50/60 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/30",
  },
};

interface StatusChipProps {
  status: StatusType;
  label?: string;
  className?: string;
  showIcon?: boolean;
  variant?: "solid" | "outline" | "glass";
}

export function StatusChip({ 
  status, 
  label, 
  className, 
  showIcon = true,
  variant = "glass" 
}: StatusChipProps) {
  const config = STATUS_MAP[status] || STATUS_MAP.unknown;
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all duration-300",
      variant === "glass" ? config.bgClass : "",
      variant === "solid" ? `bg-white shadow-sm border-slate-100` : "",
      variant === "outline" ? "bg-transparent" : "",
      config.colorClass,
      className
    )}>
      {showIcon && <Icon className="size-3.5 stroke-[2.2px]" />}
      <span>{label || config.label}</span>
    </div>
  );
}

export function StatusChipsGroup() {
  return (
    <div className="flex flex-wrap gap-3">
      <StatusChip status="success" />
      <StatusChip status="pending" />
      <StatusChip status="warning" />
      <StatusChip status="error" />
      <StatusChip status="paused" />
    </div>
  );
}
