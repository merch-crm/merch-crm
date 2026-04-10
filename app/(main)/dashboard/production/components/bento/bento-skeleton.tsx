"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface BentoSkeletonProps {
 className?: string;
}

export function ProductionDashboardSkeleton({ className }: BentoSkeletonProps) {
 return (
  <div className={cn("flex flex-col gap-3 animate-in fade-in duration-500", className)}>
   {/* Заголовок */}
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
    <div className="space-y-2">
     <Skeleton className="h-8 w-48" />
     <Skeleton className="h-4 w-72" />
    </div>
    <Skeleton className="h-11 w-36 rounded-xl" />
   </div>

   {/* Герой-блок + Внимание */}
   <div className="grid grid-cols-12 gap-3">
    <HeroSkeleton className="col-span-12 lg:col-span-7" />
    <AttentionSkeleton className="col-span-12 lg:col-span-5" />
   </div>

   {/* Статистика */}
   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <StatCardSkeleton />
    <StatCardSkeleton />
    <StatCardSkeleton />
   </div>

   {/* Быстрый доступ */}
   <QuickAccessSkeleton />

   {/* Графики */}
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <ChartSkeleton />
    <ChartSkeleton />
   </div>

   {/* Нижний ряд */}
   <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
    <CardSkeleton className="lg:col-span-8" rows={4} />
    <CardSkeleton className="lg:col-span-4" rows={5} />
   </div>
  </div>
 );
}

// ----------------------------------------------------------------------------
// Скелетон герой-блока
// ----------------------------------------------------------------------------

function HeroSkeleton({ className }: { className?: string }) {
 return (
  <div className={cn(
   "crm-card min-h-[220px] bg-gradient-to-br from-amber-500/20 to-orange-500/20",
   className
  )}>
   <div className="flex items-start justify-between">
    <div className="flex items-center gap-3">
     <Skeleton className="w-14 h-14 rounded-2xl bg-white/30" />
     <div className="space-y-2">
      <Skeleton className="h-6 w-32 bg-white/30" />
      <Skeleton className="h-4 w-48 bg-white/20" />
     </div>
    </div>
    <Skeleton className="h-7 w-16 rounded-full bg-white/20" />
   </div>

   <div className="mt-auto pt-8">
    <Skeleton className="h-20 w-32 bg-white/30" />
    <div className="flex gap-2 mt-4">
     <Skeleton className="h-7 w-36 rounded-full bg-white/20" />
     <Skeleton className="h-7 w-28 rounded-full bg-white/20" />
    </div>
   </div>
  </div>
 );
}

// ----------------------------------------------------------------------------
// Скелетон блока внимания
// ----------------------------------------------------------------------------

function AttentionSkeleton({ className }: { className?: string }) {
 return (
  <div className={cn("crm-card min-h-[220px] flex flex-col", className)}>
   <div className="flex items-center gap-3">
    <Skeleton className="w-12 h-12 rounded-xl" />
    <div className="space-y-2">
     <Skeleton className="h-5 w-36" />
     <Skeleton className="h-4 w-28" />
    </div>
   </div>

   <div className="mt-auto">
    <Skeleton className="h-16 w-20" />
    <div className="flex gap-2 mt-3">
     <Skeleton className="h-7 w-28 rounded-full" />
     <Skeleton className="h-7 w-24 rounded-full" />
    </div>
   </div>
  </div>
 );
}

// ----------------------------------------------------------------------------
// Скелетон карточки статистики
// ----------------------------------------------------------------------------

function StatCardSkeleton({ className }: { className?: string }) {
 return (
  <div className={cn("crm-card", className)}>
   <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
     <Skeleton className="w-10 h-10 rounded-xl" />
     <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-6 w-14 rounded-full" />
   </div>

   <div className="space-y-2">
    <Skeleton className="h-12 w-24" />
    <Skeleton className="h-4 w-32" />
   </div>

   <div className="flex items-end gap-1 h-8 mt-4">
    {Array.from({ length: 7 }).map((_, i) => (
     <Skeleton key={i} className="flex-1 rounded-sm" style={{ height: `${((i * 37) % 60) + 20}%` }} />
    ))}
   </div>
  </div>
 );
}

// ----------------------------------------------------------------------------
// Скелетон быстрого доступа
// ----------------------------------------------------------------------------

function QuickAccessSkeleton({ className }: { className?: string }) {
 return (
  <div className={cn("crm-card !bg-slate-50/50", className)}>
   <div className="flex items-center justify-between mb-4">
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-4 w-20" />
   </div>

   <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
     <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200">
      <Skeleton className="w-10 h-10 rounded-xl mb-3" />
      <Skeleton className="h-4 w-20 mb-1" />
      <Skeleton className="h-3 w-16" />
     </div>
    ))}
   </div>
  </div>
 );
}

// ----------------------------------------------------------------------------
// Скелетон графика
// ----------------------------------------------------------------------------

function ChartSkeleton({ className }: { className?: string }) {
 return (
  <div className={cn("crm-card", className)}>
   <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
     <Skeleton className="w-10 h-10 rounded-xl" />
     <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
     </div>
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
   </div>

   <div className="flex items-end gap-2 h-[160px] pt-4">
    {Array.from({ length: 7 }).map((_, i) => (
     <div key={i} className="flex-1 flex flex-col items-center gap-2">
      <Skeleton className="w-full rounded-t-lg" style={{ height: `${((i * 43) % 60) + 30}%` }} />
      <Skeleton className="h-3 w-6" />
      <Skeleton className="h-3 w-4" />
     </div>
    ))}
   </div>

   <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
    <div className="flex items-center gap-3">
     <div className="space-y-1">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-4 w-16" />
     </div>
     <Skeleton className="w-px h-8 bg-slate-100" />
     <div className="space-y-1">
      <Skeleton className="h-3 w-12" />
      <Skeleton className="h-4 w-12" />
     </div>
    </div>
   </div>
  </div>
 );
}

// ----------------------------------------------------------------------------
// Универсальный скелетон карточки
// ----------------------------------------------------------------------------

interface CardSkeletonProps {
 className?: string;
 rows?: number;
}

function CardSkeleton({ className, rows = 3 }: CardSkeletonProps) {
 return (
  <div className={cn("crm-card", className)}>
   <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
     <Skeleton className="w-10 h-10 rounded-xl" />
     <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-20" />
     </div>
    </div>
    <Skeleton className="h-4 w-12" />
   </div>

   <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
     <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
      <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
       <Skeleton className="h-4 w-3/4" />
       <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-12 rounded-lg" />
     </div>
    ))}
   </div>
  </div>
 );
}

// Экспортируем отдельные скелетоны для использования в Suspense
export { HeroSkeleton, AttentionSkeleton, StatCardSkeleton, QuickAccessSkeleton, ChartSkeleton, CardSkeleton };
