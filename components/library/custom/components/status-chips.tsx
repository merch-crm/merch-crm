"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Check, AlertCircle, X, Info, Clock } from 'lucide-react';
import { cn } from "../utils/cn";

export type ChipStatus = 'success' | 'warning' | 'error' | 'info' | 'pending';

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

const STATUS_CONFIGS: Record<ChipStatus, StatusConfig> = {
  success: {
    label: 'Завершено',
    icon: Check,
    className: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  warning: {
    label: 'Внимание',
    icon: AlertCircle,
    className: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  error: {
    label: 'Ошибка',
    icon: X,
    className: 'bg-rose-50 text-rose-600 border-rose-100',
  },
  info: {
    label: 'Инфо',
    icon: Info,
    className: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  pending: {
    label: 'Ожидание',
    icon: Clock,
    className: 'bg-slate-50 text-slate-600 border-slate-100',
  },
};

export function ChipStatus({ status, label, className }: { status: ChipStatus, label?: string, className?: string }) {
  const config = STATUS_CONFIGS[status];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-black   shadow-sm transition-colors cursor-default",
        config.className,
        className
      )}
    >
      <Icon className="size-3 stroke-[3px]" />
      <span>{label || config.label}</span>
    </motion.div>
  );
}

export function ChipStatuses() {
  return (
    <div className="flex flex-wrap gap-2">
      <ChipStatus status="success" />
      <ChipStatus status="pending" />
      <ChipStatus status="warning" />
      <ChipStatus status="error" />
      <ChipStatus status="info" />
    </div>
  );
}
