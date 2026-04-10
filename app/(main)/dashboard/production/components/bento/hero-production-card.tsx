// app/(main)/dashboard/production/components/bento/hero-production-card.tsx
"use client";

import { Factory, TrendingUp, TrendingDown, Timer, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import type { ProductionHeroStats } from "../../types";

interface HeroProductionCardProps {
 stats: ProductionHeroStats | null;
 className?: string;
}

export function HeroProductionCard({ stats, className }: HeroProductionCardProps) {
 const activeOrders = stats?.activeOrders ?? 0;
 const averageTime = stats?.averageCompletionTime ?? 0;
 const trend = stats?.trend ?? 0;

 const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
 const trendColor = trend > 0 ? "text-white/90" : trend < 0 ? "text-white/70" : "text-white/60";
 const trendBg = trend > 0 ? "bg-white/20" : trend < 0 ? "bg-white/10" : "bg-white/10";

 return (
  <div
   className={cn(
    "crm-card col-span-12 lg:col-span-7",
    "!bg-gradient-to-br !from-orange-500 !to-orange-600",
    "text-white flex flex-col justify-between relative group overflow-hidden p-6",
    "!shadow-xl !shadow-orange-500/10 !border-none",
    "min-h-[240px]",
    className
   )}
  >
   {/* Декоративный элемент */}
   <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-60 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
   <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/20 rounded-full -ml-16 -mb-16 blur-2xl opacity-40 pointer-events-none" />

   {/* Заголовок */}
   <div className="flex items-start justify-between relative z-10">
    <div className="flex items-center gap-3">
     <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-white backdrop-blur-sm border border-white/20 shadow-inner">
      <Factory className="w-7 h-7" />
     </div>
     <div>
      <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
       Производство
      </h3>
      <p className="text-sm md:text-base font-medium text-white/70 mt-0.5">
       Активные заказы в работе
      </p>
     </div>
    </div>

    {/* Тренд */}
    {trend !== 0 && (
     <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md",
      trendBg,
      trendColor
     )}>
      <TrendIcon className="w-3.5 h-3.5" />
      <span>{trend > 0 ? '+' : ''}{trend}%</span>
     </div>
    )}
   </div>

   {/* Основное число */}
   <div className="relative z-10 mt-6">
    <div className="flex items-baseline gap-3">
     <span className="text-6xl sm:text-7xl md:text-8xl font-bold tabular-nums">
      {activeOrders}
     </span>
     <span className="text-lg sm:text-xl md:text-2xl font-bold text-white/60">
      {pluralize(activeOrders, "заказ", "заказа", "заказов")}
     </span>
    </div>

    {/* Метрики */}
    <div className="flex flex-wrap items-center gap-2 mt-4">
     <div className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/10">
      <Timer className="w-3.5 h-3.5" />
      <span>Среднее время: {averageTime}ч</span>
     </div>
     <div className="px-3 py-1.5 rounded-full bg-white/15 text-white/80 text-xs font-bold backdrop-blur-md border border-white/10">
      за последние 30 дней
     </div>
    </div>
   </div>
  </div>
 );
}
