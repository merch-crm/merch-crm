// app/(main)/dashboard/production/components/bento/heatmap-card.tsx
"use client";

import { useMemo } from "react";
import { Activity, Clock, Calendar, AlertCircle } from "lucide-react";
import { pluralize } from "@/lib/pluralize";
import { cn } from "@/lib/utils";
import type { HeatmapData } from "../../types";

interface HeatmapCardProps {
 data: HeatmapData | null;
 className?: string;
}

const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

export function HeatmapCard({ data, className }: HeatmapCardProps) {
 const { cells = [], maxValue = 0, peakHour = 12, peakDay = 1 } = data || {};

 // Преобразуем массив ячеек в удобную для рендеринга структуру
 const heatmapGrid = useMemo(() => {
  const grid: Record<string, number> = {};
  cells.forEach((cell) => {
   grid[`${cell.dayOfWeek}-${cell.hour}`] = cell.value;
  });
  return grid;
 }, [cells]);

 const getColorClass = (value: number) => {
  if (value === 0) return "bg-slate-50";
  if (value < 25) return "bg-emerald-500 hover:bg-emerald-600";
  if (value < 50) return "bg-lime-400 hover:bg-lime-500";
  if (value < 75) return "bg-amber-400 hover:bg-amber-500";
  return "bg-rose-500 hover:bg-rose-600";
 };

 const hasData = cells.length > 0 && maxValue > 0;

 return (
  <div className={cn("crm-card flex flex-col", className)}>
   {/* Заголовок */}
   <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2">
     <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
      <Activity className="w-4 h-4 text-indigo-600" />
     </div>
     <div>
      <h3 className="text-sm font-bold text-slate-900 leading-none">Тепловая карта загрузки</h3>
      <span className="text-xs font-medium text-slate-400">Загрузка по дням и часам</span>
     </div>
    </div>
    <div className="flex items-center gap-2">
     <span className="text-xs font-bold text-slate-400">Загрузка:</span>
     <div className="flex gap-0.5">
      <div className="w-2 h-2 rounded-sm bg-emerald-500" />
      <div className="w-2 h-2 rounded-sm bg-lime-400" />
      <div className="w-2 h-2 rounded-sm bg-amber-400" />
      <div className="w-2 h-2 rounded-sm bg-rose-500" />
     </div>
    </div>
   </div>

   {hasData ? (
    <>
     <div className="flex-1 flex flex-col min-h-0">
      {/* Сетка часов (шапка) */}
      <div className="flex mb-1">
       <div className="w-6 shrink-0" /> {/* Отступ для названий дней */}
       <div className="flex-1 flex justify-between px-1">
        <span className="text-xs text-slate-400">8:00</span>
        <span className="text-xs text-slate-400">14:00</span>
        <span className="text-xs text-slate-400">20:00</span>
       </div>
      </div>

      {/* Основная сетка */}
      <div className="flex-1 flex flex-col gap-1 min-h-0">
       {DAYS.map((dayName, dayIndex) => (
        <div key={dayIndex} className="flex gap-1 h-full items-center">
         <span className="w-6 text-xs font-medium text-slate-400 shrink-0">
          {dayName}
         </span>
         <div className="flex-1 flex gap-1 h-full min-h-[12px]">
          {HOURS.map((hour) => {
           const value = heatmapGrid[`${dayIndex}-${hour}`] || 0;
           return (
            <div
             key={hour}
             className={cn(
              "flex-1 rounded-sm transition-colors duration-200 cursor-help",
              getColorClass(value)
             )}
             title={`${DAYS[dayIndex]}, ${hour}:00 — Загрузка ${value}${pluralize(value, "%", "%", "%")}`}
            />
           );
          })}
         </div>
        </div>
       ))}
      </div>
     </div>

     {/* Инфо-панель */}
     <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
      <div className="flex items-center gap-2">
       <Clock className="w-3.5 h-3.5 text-slate-400" />
       <div className="text-xs leading-tight">
        <span className="text-slate-500 block">Пик. час:</span>
        <span className="font-semibold text-slate-900">
         {peakHour}:00 - {peakHour + 1}:00
        </span>
       </div>
      </div>
      <div className="flex items-center gap-2">
       <Calendar className="w-3.5 h-3.5 text-slate-400" />
       <div className="text-xs leading-tight">
        <span className="text-slate-500 block">Пик. день:</span>
        <span className="font-semibold text-slate-900">
         {DAYS[peakDay]}
        </span>
       </div>
      </div>
     </div>
    </>
   ) : (
    <div className="flex-1 flex flex-col items-center justify-center py-8">
     <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
      <AlertCircle className="w-5 h-5 text-slate-300" />
     </div>
     <div className="text-sm text-slate-400">Нет данных для анализа</div>
    </div>
   )}
  </div>
 );
}
