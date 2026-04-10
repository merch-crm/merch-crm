"use client";

import React from "react";
import { ArrowUp, Activity, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceAnalyticsSummaryProps {
  actualMax: number;
  avg: number;
  actualMin: number;
  currencySymbol: string;
}

export function PriceAnalyticsSummary({
  actualMax,
  avg,
  actualMin,
  currencySymbol
}: PriceAnalyticsSummaryProps) {
  const stats = [
    { label: 'Мин', value: actualMin, color: 'text-emerald-500', icon: ArrowDown },
    { label: 'Средняя', value: avg, color: 'text-primary', icon: Activity },
    { label: 'Макс', value: actualMax, color: 'text-rose-500', icon: ArrowUp }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 relative z-10 mt-2">
      {stats.map((stat, i) => (
        <div key={i} className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 hover:shadow-sm",
          stat.label === 'Мин' ? "bg-emerald-50/50 border-emerald-100/50" :
            stat.label === 'Макс' ? "bg-rose-50/50 border-rose-100/50" :
              "bg-blue-50/50 border-blue-100/50"
        )}>
          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center bg-white shadow-sm", stat.color)}>
            <stat.icon className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs font-bold text-slate-500">{stat.label}:</span>
            <span className="text-sm font-black text-slate-900">
              {Math.round(stat.value).toLocaleString()} <span className="text-xs opacity-50">{currencySymbol}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
