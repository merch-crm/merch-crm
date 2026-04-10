"use client";

import { CheckSquare, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

interface HeroTaskCardProps {
 totalTasks: number;
 completedToday: number;
 className?: string;
}

export function HeroTaskCard({ totalTasks, completedToday, className }: HeroTaskCardProps) {
 return (
  <div
   className={cn(
    "crm-card col-span-12 lg:col-span-8",
    "!bg-gradient-to-br !from-violet-500 !to-purple-600",
    "text-white flex flex-col justify-between relative group overflow-hidden p-6 lg:p-8",
    "!shadow-xl !shadow-violet-500/20 !border-none",
    "min-h-[240px]",
    className
   )}
  >
   {/* Декоративный фон */}
   <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-60 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
   <div className="absolute bottom-0 left-0 w-56 h-56 bg-purple-400/20 rounded-full -ml-20 -mb-20 blur-2xl opacity-40 pointer-events-none" />

   {/* Заголовок */}
   <div className="flex items-start justify-between relative z-10">
    <div className="flex items-center gap-3">
     <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white backdrop-blur-sm border border-white/20 shadow-inner">
      <CheckSquare className="w-7 h-7" />
     </div>
     <div>
      <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
       Задачи
      </h3>
      <p className="text-sm md:text-base font-medium text-white/70 mt-0.5">
       Управление задачами и поручениями
      </p>
     </div>
    </div>
   </div>

   {/* Основные показатели */}
   <div className="relative z-10 mt-8">
    <div className="flex items-baseline gap-3">
     <span className="text-6xl sm:text-7xl md:text-8xl font-bold tabular-nums ">
      {totalTasks}
     </span>
     <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white/70">
      {pluralize(totalTasks, "активная задача", "активные задачи", "активных задач")}
     </span>
    </div>

    {/* Доп. инфо */}
    <div className="flex flex-wrap items-center gap-3 mt-6">
     <div className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-bold flex items-center gap-2 backdrop-blur-md border border-white/10 shadow-sm">
      <TrendingUp className="w-4 h-4 text-emerald-300" />
      <span>Выполнено сегодня: <span className="text-emerald-50 ml-1">{completedToday}</span></span>
     </div>
    </div>
   </div>
  </div>
 );
}
