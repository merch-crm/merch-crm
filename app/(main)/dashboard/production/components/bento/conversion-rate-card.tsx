// app/(main)/dashboard/production/components/bento/conversion-rate-card.tsx
"use client";

import { useState } from "react";
import { Target, TrendingUp, TrendingDown, Minus, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConversionStats, StatsPeriod } from "../../types";

interface ConversionRateCardProps {
 stats: ConversionStats | null;
 onPeriodChange?: (period: StatsPeriod) => void;
 className?: string;
}

export function ConversionRateCard({ stats, onPeriodChange, className }: ConversionRateCardProps) {
 const [period, setPeriod] = useState<StatsPeriod>("week");

 const handlePeriodChange = (newPeriod: StatsPeriod) => {
  setPeriod(newPeriod);
  onPeriodChange?.(newPeriod);
 };

 const percentage = stats?.onTimePercentage ?? 0;
 const totalCompleted = stats?.totalCompleted ?? 0;
 const completedOnTime = stats?.completedOnTime ?? 0;
 const completedLate = stats?.completedLate ?? 0;
 const trend = stats?.trend ?? 0;
 const sparklineData = stats?.sparklineData ?? [];

 const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
 const trendColor = trend >= 0 ? "text-emerald-600" : "text-rose-600";
 const trendBg = trend >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100";

 // Цвет в зависимости от процента
 const percentageColor = percentage >= 90
  ? "text-emerald-600"
  : percentage >= 70
  ? "text-amber-600"
  : "text-rose-600";

 // Нормализуем sparkline
 const normalizedData = sparklineData.map(v => v);

 return (
  <div className={cn("crm-card flex flex-col", className)}>
   {/* Заголовок */}
   <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
      <Target className="w-5 h-5" />
     </div>
     <div>
      <h3 className="text-sm font-bold text-slate-900">Конверсия заказов</h3>
      <p className="text-xs font-medium text-slate-400">
       Выполнено в срок
      </p>
     </div>
    </div>

    {/* Переключатель периода */}
    <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
     {(["week", "month"] as StatsPeriod[]).map((p) => (
      <button
      type="button"
       key={p}
       onClick={() => handlePeriodChange(p)}
       className={cn(
        "px-2.5 py-1 rounded-md text-xs font-bold transition-all",
        period === p
         ? "bg-white text-slate-900 shadow-sm"
         : "text-slate-500 hover:text-slate-700"
       )}
      >
       {p === "week" ? "Неделя" : "Месяц"}
      </button>
     ))}
    </div>
   </div>

   {/* Основной процент */}
   <div className="flex items-center gap-3 mb-3">
    <div>
     <div className="flex items-baseline gap-1">
      <span className={cn("text-5xl font-bold", percentageColor)}>
       {percentage}
      </span>
      <span className="text-2xl font-bold text-slate-400">%</span>
     </div>
    </div>

    {trend !== 0 && (
     <div className={cn(
      "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border",
      trendBg,
      trendColor
     )}>
      <TrendIcon className="w-3.5 h-3.5" />
      <span>{trend > 0 ? "+" : ""}{trend}%</span>
     </div>
    )}
   </div>

   {/* Sparkline */}
   {sparklineData.length > 0 && (
    <div className="flex items-end gap-1 h-10 mb-4">
     {normalizedData.map((value, index) => (
      <div
       key={index}
       className={cn(
        "flex-1 rounded-sm transition-all",
        index === normalizedData.length - 1
         ? "bg-primary"
         : "bg-slate-200"
       )}
       style={{ height: `${Math.max(value, 10)}%` }}
      />
     ))}
    </div>
   )}

   {/* Детализация */}
   <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
    <div className="flex-1 flex items-center gap-2">
     <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
      <CheckCircle className="w-4 h-4 text-emerald-600" />
     </div>
     <div>
      <div className="text-sm font-bold text-slate-900">{completedOnTime}</div>
      <div className="text-xs font-medium text-slate-400">в срок</div>
     </div>
    </div>

    <div className="w-px h-10 bg-slate-100" />

    <div className="flex-1 flex items-center gap-2">
     <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
      <XCircle className="w-4 h-4 text-rose-600" />
     </div>
     <div>
      <div className="text-sm font-bold text-slate-900">{completedLate}</div>
      <div className="text-xs font-medium text-slate-400">с опозданием</div>
     </div>
    </div>

    <div className="w-px h-10 bg-slate-100" />

    <div className="flex-1">
     <div className="text-sm font-bold text-slate-900">{totalCompleted}</div>
     <div className="text-xs font-medium text-slate-400">всего</div>
    </div>
   </div>
  </div>
 );
}
