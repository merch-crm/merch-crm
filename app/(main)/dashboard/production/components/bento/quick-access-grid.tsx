// app/(main)/dashboard/production/components/bento/quick-access-grid.tsx
"use client";

import Link from "next/link";
import { 
  ListTodo, 
  Layers, 
  Users, 
  Settings, 
  Factory, 
  Wrench,
  Calculator,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductionBaseStats } from "../../types";

interface QuickAccessItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  iconColor: string;
  iconBgColor: string;
  borderColor: string;
}

interface QuickAccessGridProps {
  stats: ProductionBaseStats | null;
  className?: string;
}

export function QuickAccessGrid({ stats, className }: QuickAccessGridProps) {
  const quickAccessItems: QuickAccessItem[] = [
    {
      id: "tasks",
      title: "Все задачи",
      description: `${(stats?.inQueue ?? 0) + (stats?.inProgress ?? 0)} активных`,
      href: "/dashboard/production/tasks",
      icon: ListTodo,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      id: "calculators",
      title: "Калькуляторы",
      description: "6 типов нанесения",
      href: "/dashboard/production/calculators",
      icon: Calculator,
      iconColor: "text-primary",
      iconBgColor: "bg-primary/5",
      borderColor: "border-primary/10",
    },
    {
      id: "lines",
      title: "Линии",
      description: `${stats?.activeLines ?? 0} активных`,
      href: "/dashboard/production/lines",
      icon: Layers,
      iconColor: "text-emerald-600",
      iconBgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
    },
    {
      id: "staff",
      title: "Сотрудники",
      description: `${stats?.activeStaff ?? 0} на смене`,
      href: "/dashboard/production/staff",
      icon: Users,
      iconColor: "text-violet-600",
      iconBgColor: "bg-violet-50",
      borderColor: "border-violet-100",
    },
    {
      id: "equipment",
      title: "Оборудование",
      description: "Станки и инструменты",
      href: "/dashboard/production/equipment",
      icon: Settings,
      iconColor: "text-amber-600",
      iconBgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    {
      id: "application-types",
      title: "Типы нанесения",
      description: "Виды печати",
      href: "/dashboard/production/application-types",
      icon: Factory,
      iconColor: "text-teal-600",
      iconBgColor: "bg-teal-50",
      borderColor: "border-teal-100",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between px-0.5">
        <h3 className="text-xs font-bold text-slate-400">Быстрый доступ</h3>
        <Link 
          href="/dashboard/production/settings"
          className="text-xs font-bold text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Настройки</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {quickAccessItems.map((item) => (
          <QuickAccessCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

interface QuickAccessCardProps {
  item: QuickAccessItem;
}

function QuickAccessCard({ item }: QuickAccessCardProps) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative p-4 rounded-2xl bg-white border transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5",
        item.borderColor
      )}
    >
      {/* Иконка */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center mb-3 border shadow-sm",
        item.iconBgColor,
        item.borderColor,
        item.iconColor
      )}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Текст */}
      <h4 className="text-sm font-bold text-slate-900 mb-0.5 truncate">
        {item.title}
      </h4>
      <p className="text-xs font-medium text-slate-400 truncate">
        {item.description}
      </p>

      {/* Стрелка при ховере */}
      <div className={cn(
        "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
        "bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity",
        "group-hover:bg-primary/10 group-hover:text-primary"
      )}>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}
