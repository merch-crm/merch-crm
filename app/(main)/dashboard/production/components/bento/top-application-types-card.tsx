// app/(main)/dashboard/production/components/bento/top-application-types-card.tsx
"use client";

import Link from "next/link";
import { Factory, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import type { TopApplicationType } from "../../types";

interface TopApplicationTypesCardProps {
  data: TopApplicationType[];
  className?: string;
}

export function TopApplicationTypesCard({ data, className }: TopApplicationTypesCardProps) {
  const hasData = data && data.length > 0;
  const totalOrders = (data || []).reduce((acc, item) => acc + (item.ordersCount ?? item.count), 0);

  return (
    <div className={cn("crm-card flex flex-col", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Топ типов нанесения</h3>
            <p className="text-xs font-medium text-slate-400">
              {totalOrders} {pluralize(totalOrders, "заказ", "заказа", "заказов")} за 30 дней
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/production/application-types"
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <span>Все</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Контент */}
      <div className="flex-1">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Factory className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500">Нет данных</p>
            <p className="text-xs text-slate-400 mt-1">Заказы с нанесением появятся здесь</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(data || []).slice(0, 5).map((item, index) => (
              <ApplicationTypeRow key={item.id} item={item} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ApplicationTypeRowProps {
  item: TopApplicationType;
  rank: number;
}

function ApplicationTypeRow({ item, rank }: ApplicationTypeRowProps) {
  const trend = item.trend ?? 0;
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-slate-400";

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {/* Ранг */}
          <div className={cn(
            "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold",
            rank === 1 && "bg-amber-100 text-amber-700",
            rank === 2 && "bg-slate-200 text-slate-600",
            rank === 3 && "bg-orange-100 text-orange-700",
            rank > 3 && "bg-slate-100 text-slate-500"
          )}>
            {rank}
          </div>
          
          {/* Название */}
          <span className="text-sm font-bold text-slate-900">{item.name}</span>
          
          {/* Тренд */}
          {trend !== 0 && (
            <div className={cn("flex items-center gap-0.5", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span className="text-xs font-bold">
                {trend > 0 ? "+" : ""}{trend}%
              </span>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className="text-sm font-bold text-slate-700">
            {item.ordersCount ?? item.count}
          </span>
          <span className="text-xs text-slate-400 ml-1">
            ({item.percentage}%)
          </span>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${item.percentage}%`,
            backgroundColor: item.color,
          }}
        />
      </div>
    </div>
  );
}
