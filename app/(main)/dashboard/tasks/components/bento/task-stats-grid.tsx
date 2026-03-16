"use client";

import React from "react";

import { 
  Circle,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

interface TaskStatsGridProps {
  stats: {
    new: number;
    inProgress: number;
    review: number;
    done: number;
  };
  className?: string;
}

export function TaskStatsGrid({ stats, className }: TaskStatsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {/* Новые задачи */}
      <StatCard 
        title="Новые"
        count={stats.new}
        icon={Circle}
        color="text-violet-600"
        bgColor="bg-violet-50 border-violet-100"
        gradient="from-violet-500 to-purple-500"
      />
      
      {/* В работе */}
      <StatCard 
        title="В работе"
        count={stats.inProgress}
        icon={Clock}
        color="text-blue-600"
        bgColor="bg-blue-50 border-blue-100"
        gradient="from-blue-500 to-indigo-500"
      />
      
      {/* На проверке */}
      <StatCard 
        title="Проверка"
        count={stats.review}
        icon={AlertCircle}
        color="text-amber-600"
        bgColor="bg-amber-50 border-amber-100"
        gradient="from-amber-400 to-orange-500"
      />
      
      {/* Готово (За сегодня / Всего) */}
      <StatCard 
        title="Готово"
        count={stats.done}
        icon={CheckCircle2}
        color="text-emerald-600"
        bgColor="bg-emerald-50 border-emerald-100"
        gradient="from-emerald-400 to-green-500"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  gradient: string;
}

function StatCard({ title, count, icon: Icon, color, bgColor, gradient }: StatCardProps) {
  return (
    <div className="crm-card relative group flex flex-col justify-between overflow-hidden">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", bgColor, color)}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-700">{title}</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl sm:text-5xl font-bold text-slate-900">{count}</span>
        </div>
        <p className="text-xs font-bold text-slate-400 mt-1">
          {pluralize(count, "задача", "задачи", "задач")}
        </p>
      </div>

      {/* Линия снизу */}
      <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50", gradient)} />
    </div>
  );
}
