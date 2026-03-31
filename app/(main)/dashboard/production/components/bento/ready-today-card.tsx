// app/(main)/dashboard/production/components/bento/ready-today-card.tsx
"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadyTodayCardProps {
  count: number;
  className?: string;
}

export function ReadyTodayCard({ count, className }: ReadyTodayCardProps) {
  return (
    <div className={cn("crm-card flex flex-col justify-between p-4 bg-white", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-700">Готово сегодня</span>
        </div>
        <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          сегодня
        </div>
      </div>

      <div className="mt-4">
        <div className="text-5xl font-bold text-slate-900 leading-none">
          {count}
        </div>
        <p className="text-xs font-medium text-slate-400 mt-2">
          заказов завершено
        </p>
      </div>
      
      <div className="mt-3 flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-xs font-medium text-slate-400">обновляется в реальном времени</span>
      </div>
    </div>
  );
}
