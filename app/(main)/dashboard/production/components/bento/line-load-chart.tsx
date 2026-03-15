// app/(main)/dashboard/production/components/bento/line-load-chart.tsx
"use client";

import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import type { LineLoadItem } from "../../types";

interface LineLoadChartProps {
  data: LineLoadItem[];
  className?: string;
}

export function LineLoadChart({ data, className }: LineLoadChartProps) {
  const hasData = data && data.length > 0;
  const totalTasks = data.reduce((acc, line) => acc + line.tasksCount, 0);

  return (
    <div className={cn("crm-card flex flex-col", className)}>
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Загрузка линий</h3>
            <p className="text-xs font-medium text-slate-400">
              {totalTasks} {pluralize(totalTasks, "задача", "задачи", "задач")} в работе
            </p>
          </div>
        </div>
        
        <Link
          href="/dashboard/production/lines"
          className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          <span>Все линии</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Контент */}
      <div className="flex-1">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Layers className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500 mb-1">Нет активных линий</p>
            <p className="text-xs text-slate-400">Добавьте производственные линии</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.slice(0, 5).map((line) => (
              <LineLoadRow key={line.id} line={line} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LineLoadRowProps {
  line: LineLoadItem;
}

function LineLoadRow({ line }: LineLoadRowProps) {
  const loadPercentage = line.loadPercentage ?? 0;
  // Определяем цвет загрузки
  const loadColor = loadPercentage >= 80
    ? "text-rose-600"
    : loadPercentage >= 50
    ? "text-amber-600"
    : "text-emerald-600";

  const progressColor = loadPercentage >= 80
    ? "bg-rose-500"
    : loadPercentage >= 50
    ? "bg-amber-500"
    : "bg-emerald-500";

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Цвет линии */}
          <div
            className="w-3 h-3 rounded-full border-2 border-white shadow-sm shrink-0"
            style={{ backgroundColor: line.color || "#94a3b8" }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 truncate">
                {line.name}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {line.code}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-sm font-bold text-slate-700">
              {line.tasksCount} {pluralize(line.tasksCount, "задача", "задачи", "задач")}
            </div>
            <div className="text-xs font-medium text-slate-400">
              {line.inProgress} в работе
            </div>
          </div>
          <div className={cn("text-sm font-bold tabular-nums w-12 text-right", loadColor)}>
            {loadPercentage}%
          </div>
        </div>
      </div>

      {/* Прогресс-бар */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", progressColor)}
          style={{ width: `${loadPercentage}%` }}
        />
      </div>
    </div>
  );
}
