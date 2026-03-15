// app/(main)/dashboard/production/components/bento/top-types-card.tsx
"use client";

import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

interface TopTypeItem {
  id: string;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

interface TopTypesCardProps {
  items: TopTypeItem[];
  className?: string;
}

export function TopTypesCard({ items, className }: TopTypesCardProps) {
  return (
    <div className={cn("crm-card flex flex-col h-full", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
            <Layers className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Топ типов нанесения</h3>
        </div>
        <span className="text-xs font-bold text-slate-400">30 дней</span>
      </div>

      <div className="flex-1 space-y-3">
        {(items || []).slice(0, 5).map((item, index) => (
          <div key={item.id} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-orange-500 w-4">{index + 1}</span>
              <span className="text-xs font-bold text-slate-700 truncate max-w-[140px]">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-900">{item.count}</span>
              <span className="text-xs font-medium text-slate-300">({item.percentage}%)</span>
            </div>
          </div>
        ))}
        
        {(items?.length || 0) === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-12 gap-2">
            <Layers className="w-8 h-8 opacity-20" />
            <span>Нет данных</span>
          </div>
        )}
      </div>

      {(items?.length || 0) > 5 && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-center">
          <button type="button" className="text-xs font-bold text-primary hover:underline">Показать все</button>
        </div>
      )}
    </div>
  );
}
