"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoComparisonCardProps {
  title: React.ReactNode;
  metricA: { label: React.ReactNode; value: React.ReactNode; color: string };
  metricB: { label: React.ReactNode; value: React.ReactNode; color: string };
  className?: string;
}

export function BentoComparisonCard({ 
  title = "Производительность", 
  metricA = { label: "Текущий год", value: "₽12.4M", color: "#10B981" }, 
  metricB = { label: "Прошлый год", value: "₽10.1M", color: "#64748B" }, 
  className 
}: BentoComparisonCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white text-slate-950 shadow-crm-md border border-slate-100 rounded-card flex flex-col group transition-all hover:border-slate-300",
        className
      )}
    >
      <div className="p-6 border-b border-slate-50 bg-slate-50/30 backdrop-blur-sm">
        <Typo as="h3" className="text-xs font-black tracking-tight text-slate-400 leading-none">{title}</Typo>
      </div>
      <div className="flex flex-1 divide-x divide-slate-100">
        <div className="flex-1 p-6 hover:bg-slate-50/50 transition-colors flex flex-col justify-center">
          <Typo as="p" className="text-xs font-black tracking-tight mb-2 leading-none" style={{ color: metricA.color }}>{metricA.label}</Typo>
          <Typo as="p" className="text-3xl lg:text-4xl font-black font-heading tabular-nums leading-none">{metricA.value}</Typo>
        </div>
        <div className="flex-1 p-6 hover:bg-slate-50/50 transition-colors flex flex-col justify-center text-right sm:text-left">
          <Typo as="p" className="text-xs font-black tracking-tight mb-2 leading-none" style={{ color: metricB.color }}>{metricB.label}</Typo>
          <Typo as="p" className="text-3xl lg:text-4xl font-black font-heading tabular-nums leading-none">{metricB.value}</Typo>
        </div>
      </div>
    </div>
  );
}
