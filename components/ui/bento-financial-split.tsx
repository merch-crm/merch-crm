"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoFinancialSplitProps {
  className?: string;
  revenue?: number;
  expenses?: number;
}

export function BentoFinancialSplit({
  className,
  revenue = 284500,
  expenses = 67200,
}: BentoFinancialSplitProps) {
  const net = revenue - expenses;
  const revenuePercent = (revenue / (revenue + expenses)) * 100;

  return (
    <div
      className={cn(
        "relative overflow-hidden shadow-crm-lg border border-border",
        "rounded-card flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-700",
        className
      )}
    >
      {/* 90/10 Visual Conflict: Revenue dominates */}
      <div className="flex flex-1 min-h-0">
        {/* Revenue — 85% of visual real estate */}
        <div className="flex-1 bg-emerald-500 text-white p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Watermark number */}
          <div 
            style={{ animationDelay: '400ms' }}
            className="absolute -bottom-6 -right-4 text-[120px] font-black leading-none pointer-events-none select-none opacity-[0.08] animate-in fade-in duration-1000 fill-mode-both"
          >
            +
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={16} className="text-emerald-200" />
              <span className="text-[11px] font-black tracking-tight text-emerald-100">Выручка</span>

            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold ">
              ${(revenue / 1000).toFixed(1)}k
            </h2>
            <p className="text-[11px] font-bold text-emerald-100/80 mt-1 tracking-tighter cursor-default">+18.3% к прошлому месяцу</p>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-emerald-100 tracking-tight">Чистая прибыль</span>
              <span className="text-lg font-black tracking-tighter text-white">${(net / 1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>

        {/* Expenses — compressed 15% margin */}
        <div className="w-28 md:w-36 bg-card text-card-foreground p-4 flex flex-col justify-between border-l border-border">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <ArrowDownRight size={14} className="text-rose-500" />
              <span className="text-[11px] font-semibold text-muted-foreground">Расходы</span>
            </div>
            <p className="text-xl font-bold">${(expenses / 1000).toFixed(1)}k</p>
            <p className="text-[11px] text-muted-foreground mt-1">-4.2%</p>
          </div>

          {/* Vertical proportion bar */}
          <div className="mt-auto">
            <div className="w-full h-24 bg-secondary rounded-lg overflow-hidden flex flex-col-reverse">
              <div
                style={{ height: `${revenuePercent}%`, animationDelay: '500ms' }}
                className="bg-emerald-500 w-full rounded-t-md animate-in slide-in-from-bottom-full duration-1000 fill-mode-both"
              />
            </div>
            <p className="text-[11px] text-center text-muted-foreground mt-2">
              маржа {revenuePercent.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
