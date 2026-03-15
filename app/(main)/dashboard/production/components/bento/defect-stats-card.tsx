// app/(main)/dashboard/production/components/bento/defect-stats-card.tsx
"use client";

import Link from "next/link";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import type { DefectStats } from "../../types";

interface DefectStatsCardProps {
  stats: DefectStats | null;
  className?: string;
}

export function DefectStatsCard({ stats, className }: DefectStatsCardProps) {
  const {
    totalDefects = 0,
    defectRate = 0,
    trend = 0,
    byCategory = [],
    sparklineData = [],
  } = stats || {};

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor =
    trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-slate-400";
  const trendBg =
    trend > 0 ? "bg-emerald-50" : trend < 0 ? "bg-rose-50" : "bg-slate-50";

  // Нормализация sparkline
  const maxSparkline = Math.max(...sparklineData, 1);
  const normalizedSparkline = sparklineData.map((v) =>
    Math.round((v / maxSparkline) * 100)
  );

  const hasDefects = totalDefects > 0;

  return (
    <div className={cn("crm-card flex flex-col", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <h3 className="font-semibold text-slate-900">Статистика брака</h3>
        </div>

        {trend !== 0 && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              trendBg,
              trendColor
            )}
          >
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Основные показатели */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-2xl font-bold text-slate-900">
            {totalDefects.toLocaleString("ru-RU")}
          </div>
          <div className="text-xs text-slate-500">
            {pluralize(totalDefects, "единица", "единицы", "единиц")} брака
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{defectRate}%</div>
          <div className="text-xs text-slate-500">Уровень брака</div>
        </div>
      </div>

      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="flex items-end gap-1 h-10 mb-4">
          {normalizedSparkline.map((height, index) => (
            <div
              key={index}
              className="flex-1 bg-rose-100 rounded-t transition-all duration-300 hover:bg-rose-200"
              style={{ height: `${Math.max(height, 4)}%` }}
              title={`${sparklineData[index]} брака`}
            />
          ))}
        </div>
      )}

      {/* Категории брака */}
      {hasDefects && byCategory && byCategory.length > 0 ? (
        <div className="flex-1 space-y-2">
          <div className="text-xs font-medium text-slate-500 mb-2">
            По категориям
          </div>
          {(byCategory || []).slice(0, 4).map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-xs text-slate-600 flex-1 truncate">
                {category.name}
              </span>
              <span className="text-xs font-medium text-slate-900">
                {category.count}
              </span>
              <span className="text-xs text-slate-400">
                ({category.percentage}%)
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
            <AlertCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-sm text-slate-500">Брак не зафиксирован</div>
        </div>
      )}

      {/* Ссылка на детали */}
      <Link
        href="/dashboard/production/reports/defects"
        className="mt-4 flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group"
      >
        <span>Подробный отчёт</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
