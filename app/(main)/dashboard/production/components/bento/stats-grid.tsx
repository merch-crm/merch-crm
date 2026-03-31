// app/(main)/dashboard/production/components/bento/stats-grid.tsx
"use client";

import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  CheckCircle2,
  Gauge
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import type { ConversionStats, ShiftEfficiencyData, ProductionBaseStats } from "../../types";

interface StatsGridProps {
  conversion: ConversionStats | null;
  efficiency: ShiftEfficiencyData | null;
  baseStats: ProductionBaseStats | null;
  className?: string;
}

export function StatsGrid({ conversion, efficiency, baseStats, className }: StatsGridProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-3", className)}>
      {/* Конверсия */}
      <ConversionCard stats={conversion} />
      
      {/* Эффективность смены */}
      <EfficiencyCard stats={efficiency} />
      
      {/* Готово сегодня */}
      <CompletedTodayCard count={baseStats?.completedToday ?? 0} />
    </div>
  );
}

// ----------------------------------------------------------------------------
// Карточка конверсии
// ----------------------------------------------------------------------------

interface ConversionCardProps {
  stats: ConversionStats | null;
}

function ConversionCard({ stats }: ConversionCardProps) {
  const percentage = stats?.onTimePercentage ?? 0;
  const trend = stats?.trend ?? 0;
  const sparklineData = stats?.sparklineData ?? [];

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend >= 0 ? "text-emerald-600" : "text-rose-600";
  const trendBg = trend >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100";

  // Нормализуем данные для sparkline
  const maxVal = Math.max(...sparklineData, 1);
  const normalizedData = sparklineData.map(v => (v / maxVal) * 100);

  return (
    <div className="crm-card relative group flex flex-col justify-between">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-700">Конверсия</span>
        </div>
        {trend !== 0 && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border",
            trendBg,
            trendColor
          )}>
            <TrendIcon className="w-3 h-3" />
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>

      {/* Значение */}
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-bold text-slate-900">{percentage}</span>
          <span className="text-2xl font-bold text-slate-400">%</span>
        </div>
        <p className="text-xs font-bold text-slate-400 mt-1">выполнено в срок</p>
      </div>

      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="mt-4 flex items-end gap-1 h-8">
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
    </div>
  );
}

// ----------------------------------------------------------------------------
// Карточка эффективности
// ----------------------------------------------------------------------------

interface EfficiencyCardProps {
  stats: ShiftEfficiencyData | null;
}

function EfficiencyCard({ stats }: EfficiencyCardProps) {
  const current = Number(stats?.current) || 0;
  const target = Number(stats?.target) || 0;
  const timeElapsed = Number(stats?.timeElapsed) || 0;

  // Определяем цвет в зависимости от выполнения плана
  const isOnTrack = current >= target * 0.9;
  const statusColor = isOnTrack ? "text-emerald-600" : "text-amber-600";
  const statusBg = isOnTrack ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100";
  const statusText = isOnTrack ? "по плану" : "отставание";

  return (
    <div className="crm-card relative group flex flex-col justify-between">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 border border-violet-100">
            <Gauge className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-700">Эффективность</span>
        </div>
        <div className={cn(
          "px-2 py-1 rounded-full text-xs font-bold border",
          statusBg,
          statusColor
        )}>
          {statusText}
        </div>
      </div>

      {/* Значение */}
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-bold text-slate-900">{current}</span>
          <span className="text-2xl font-bold text-slate-400">%</span>
        </div>
        <p className="text-xs font-bold text-slate-400 mt-1">
          план смены: {target}%
        </p>
      </div>

      {/* Прогресс-бар */}
      <div className="mt-4">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isOnTrack ? "bg-emerald-500" : "bg-amber-500"
            )}
            style={{ width: `${Math.min(current, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs font-bold text-slate-400">
            Прошло {timeElapsed}% смены
          </span>
          <span className="text-xs font-bold text-slate-500">
            {stats?.completedTasks ?? 0}/{stats?.plannedTasks ?? 0} задач
          </span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Карточка "Готово сегодня"
// ----------------------------------------------------------------------------

interface CompletedTodayCardProps {
  count: number;
}

function CompletedTodayCard({ count }: CompletedTodayCardProps) {
  return (
    <div className="crm-card relative group flex flex-col justify-between">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-700">Готово сегодня</span>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
          сегодня
        </span>
      </div>

      {/* Значение */}
      <div>
        <div className="text-4xl sm:text-5xl font-bold text-slate-900">{count}</div>
        <p className="text-xs font-bold text-slate-400 mt-1">
          {pluralize(count, "заказ завершён", "заказа завершено", "заказов завершено")}
        </p>
      </div>

      {/* Индикатор активности */}
      <div className="mt-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-400">обновляется в реальном времени</span>
      </div>
    </div>
  );
}
