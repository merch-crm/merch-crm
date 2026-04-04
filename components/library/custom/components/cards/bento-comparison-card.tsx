"use client";

import React from "react";
import { cn } from "../../utils/cn";

interface BentoComparisonCardProps {
  title: string;
  metricA: { label: string; value: string; color: string };
  metricB: { label: string; value: string; color: string };
  className?: string;
}

export function BentoComparisonCard({ title, metricA, metricB, className }: BentoComparisonCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-md border border-border rounded-[27px] flex flex-col",
        className
      )}
    >
      <div className="p-5 border-b border-border/50">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
      </div>
      <div className="flex flex-1 divide-x divide-border/50">
        <div className="flex-1 p-5 hover:bg-muted/30 transition-colors flex flex-col justify-center">
          <p className="text-xs  font-bold  mb-2" style={{ color: metricA.color }}>{metricA.label}</p>
          <p className="text-3xl lg:text-4xl font-black font-heading">{metricA.value}</p>
        </div>
        <div className="flex-1 p-5 hover:bg-muted/30 transition-colors flex flex-col justify-center">
          <p className="text-xs  font-bold  mb-2" style={{ color: metricB.color }}>{metricB.label}</p>
          <p className="text-3xl lg:text-4xl font-black font-heading">{metricB.value}</p>
        </div>
      </div>
    </div>
  );
}
