"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  AlertCircle,
  AlertTriangle,
  UserX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

type ActivityStatus = "all" | "active" | "attention" | "at_risk" | "inactive";

interface ActivityStatusTabsProps {
  value: ActivityStatus;
  onChange: (value: ActivityStatus) => void;
  counts?: {
    active: number;
    attention: number;
    atRisk: number;
    inactive: number;
    total: number;
  };
  className?: string;
}

import { IconType } from "@/components/ui/stat-card";

interface TabConfig {
  value: ActivityStatus;
  label: string;
  shortLabel: string;
  description: string;
  icon: IconType;
  color: string;
  bgColor: string;
  countKey?: keyof Omit<NonNullable<ActivityStatusTabsProps["counts"]>, "total">;
}

const tabs: TabConfig[] = [
  {
    value: "all",
    label: "Все",
    shortLabel: "Все",
    description: "Все клиенты без фильтрации",
    icon: Users as IconType,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  {
    value: "active",
    label: "Активные",
    shortLabel: "Актив.",
    description: "Заказ менее 60 дней назад",
    icon: UserCheck as IconType,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    countKey: "active",
  },
  {
    value: "attention",
    label: "Внимание",
    shortLabel: "Вним.",
    description: "Заказ 60-89 дней назад",
    icon: AlertCircle as IconType,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    countKey: "attention",
  },
  {
    value: "at_risk",
    label: "В зоне риска",
    shortLabel: "Риск",
    description: "Заказ 90-179 дней назад",
    icon: AlertTriangle as IconType,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    countKey: "atRisk",
  },
  {
    value: "inactive",
    label: "Неактивные",
    shortLabel: "Неакт.",
    description: "Заказ более 180 дней назад",
    icon: UserX as IconType,
    color: "text-red-600",
    bgColor: "bg-red-100",
    countKey: "inactive",
  },
];

export const ActivityStatusTabs = memo(function ActivityStatusTabs({
  value,
  onChange,
  counts,
  className,
}: ActivityStatusTabsProps) {
  return (
    <div className={cn("inline-flex items-center gap-1 p-1 bg-white border-2 border-slate-100 rounded-2xl shadow-sm", className)}>
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        const Icon = tab.icon;
        const count = tab.countKey && counts ? counts[tab.countKey] : tab.value === "all" ? counts?.total : undefined;

        return (
          <Tooltip key={tab.value} side="bottom" content={tab.description}>
            <button
              type="button"
              onClick={() => onChange(tab.value)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all overflow-hidden",
                isActive
                  ? "text-slate-900 shadow-sm ring-1 ring-slate-100"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/50"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activityTabIndicator"
                  className="absolute inset-0 bg-white"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative flex items-center gap-1.5 z-10">
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? tab.color : "text-slate-400")} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {count !== undefined && count > 0 && (
                  <Badge className={cn( "text-xs font-medium border-none transition-colors", isActive && tab.value !== "all" ? `${tab.bgColor} ${tab.color}` : "bg-slate-100 text-slate-500" )} color="gray">
                    {count}
                  </Badge>
                )}
              </span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
});
