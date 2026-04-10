// app/(main)/dashboard/production/components/bento/weekly-output-chart.tsx
"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import type { DailyOutputItem } from "../../types";

interface WeeklyOutputChartProps {
 data: DailyOutputItem[];
 className?: string;
}

export function WeeklyOutputChart({ data, className }: WeeklyOutputChartProps) {
 // Вычисляем статистику
 const stats = useMemo(() => {
  if (!Array.isArray(data) || data.length === 0) {
   return { total: 0, average: 0, max: 0, trend: 0, maxValue: 1 };
  }

  const total = (data || []).reduce((acc, d) => acc + (d.completedTasks ?? d.completed), 0);
  const average = Math.round(total / data.length);
  const max = Math.max(...(data || []).map((d) => d.completedTasks ?? d.completed));
  
  // Тренд: сравнение последних 3 дней с предыдущими
  const recent = (data || []).slice(-3).reduce((acc, d) => acc + (d.completedTasks ?? d.completed), 0);
  const previous = (data || []).slice(0, 3).reduce((acc, d) => acc + (d.completedTasks ?? d.completed), 0);
  const trend = previous > 0 ? Math.round(((recent - previous) / previous) * 100) : 0;

  // Максимальное значение для масштабирования (с запасом)
  const maxValue = Math.max(max, 1) * 1.2;

  return { total, average, max, trend, maxValue };
 }, [data]);

 const TrendIcon = stats.trend > 0 ? TrendingUp : stats.trend < 0 ? TrendingDown : Minus;
 const trendColor = stats.trend > 0 ? "text-emerald-600" : stats.trend < 0 ? "text-rose-600" : "text-slate-400";

 return (
  <div className={cn("crm-card flex flex-col", className)}>
   {/* Заголовок */}
   <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
     <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
      <BarChart3 className="w-5 h-5" />
     </div>
     <div>
      <h3 className="text-sm font-bold text-slate-900">Выработка за неделю</h3>
      <p className="text-xs font-medium text-slate-400">
       {stats.total} {pluralize(stats.total, "задача", "задачи", "задач")} завершено
      </p>
     </div>
    </div>
    
    {/* Тренд */}
    {stats.trend !== 0 && (
     <div className={cn(
      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
      stats.trend > 0 ? "bg-emerald-50 border border-emerald-100" : "bg-rose-50 border border-rose-100",
      trendColor
     )}>
      <TrendIcon className="w-3 h-3" />
      <span>{stats.trend > 0 ? "+" : ""}{stats.trend}%</span>
     </div>
    )}
   </div>

   {/* График */}
   <div className="flex-1 flex items-end gap-2 min-h-[160px] pt-4">
    {(data || []).map((item, index) => {
     const completed = item.completedTasks ?? item.completed;
     const height = (completed / stats.maxValue) * 100;
     const isToday = index === (data?.length || 0) - 1;
     const dayName = format(parseISO(item.date), "EEEEEE", { locale: ru });
     const dayNumber = format(parseISO(item.date), "d", { locale: ru });

     return (
      <div
       key={item.date}
       className="flex-1 flex flex-col items-center gap-2 group"
      >
       {/* Значение при ховере */}
       <div className={cn(
        "text-xs font-bold transition-opacity",
        "opacity-0 group-hover:opacity-100",
        isToday ? "text-primary" : "text-slate-600"
       )}>
        {completed}
       </div>

       {/* Столбец */}
       <div className="w-full flex-1 flex items-end">
        <div
         className={cn(
          "w-full rounded-t-lg transition-all duration-300",
          "group-hover:opacity-80",
          isToday
           ? "bg-gradient-to-t from-primary to-primary/70 shadow-lg shadow-primary/20"
           : "bg-gradient-to-t from-slate-200 to-slate-100"
         )}
         style={{ height: `${Math.max(height, 8)}%` }}
        />
       </div>

       {/* Подпись дня */}
       <div className="text-center">
        <div className={cn(
         "text-xs font-bold",
         isToday ? "text-primary" : "text-slate-400"
        )}>
         {dayName}
        </div>
        <div className={cn(
         "text-xs font-bold",
         isToday ? "text-slate-900" : "text-slate-500"
        )}>
         {dayNumber}
        </div>
       </div>
      </div>
     );
    })}
   </div>

   {/* Статистика внизу */}
   <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
    <div className="flex items-center gap-3">
     <div>
      <div className="text-xs font-medium text-slate-400">Среднее</div>
      <div className="text-sm font-bold text-slate-900">{stats.average} / день</div>
     </div>
     <div className="w-px h-8 bg-slate-100" />
     <div>
      <div className="text-xs font-medium text-slate-400">Максимум</div>
      <div className="text-sm font-bold text-slate-900">{stats.max}</div>
     </div>
    </div>
   </div>
  </div>
 );
}
