// app/(main)/dashboard/production/components/bento/shift-efficiency-card.tsx
"use client";

import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShiftEfficiencyData } from "../../types";

interface ShiftEfficiencyCardProps {
  data: ShiftEfficiencyData | null;
  className?: string;
}

export function ShiftEfficiencyCard({ data, className }: ShiftEfficiencyCardProps) {
  const { 
    progress = 0, 
    efficiency = 0, 
    timeRemaining = "0ч", 
    status = "on_track",
    completedItems = 0,
    totalItems = 0
  } = data || {};

  const getStatusColor = (s: string) => {
    switch (s) {
      case "on_track": return "text-emerald-600 bg-emerald-50";
      case "behind": return "text-rose-600 bg-rose-50";
      case "danger": return "text-rose-600 bg-rose-50";
      default: return "text-amber-600 bg-amber-50";
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "on_track": return "В графике";
      case "behind": return "Отставание";
      case "danger": return "Критично";
      default: return "Внимание";
    }
  };

  return (
    <div className={cn("crm-card flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">Эффективность смены</h3>
        <div className={cn("px-2 py-1 rounded-lg text-xs font-bold", getStatusColor(status))}>
          {getStatusLabel(status)}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={364}
              strokeDashoffset={364 - (364 * efficiency) / 100}
              className="text-indigo-600 transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{efficiency}%</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <div className="text-xs text-slate-400 tracking-wider">Прогресс</div>
              <div className="text-sm font-bold text-slate-900">{progress}%</div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-slate-400 tracking-wider">План</div>
              <div className="text-xs font-medium text-slate-600">{completedItems} / {totalItems} шт.</div>
            </div>
          </div>
          
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400 tracking-wider">Осталось</div>
            <div className="text-sm font-bold text-slate-900">{timeRemaining}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
