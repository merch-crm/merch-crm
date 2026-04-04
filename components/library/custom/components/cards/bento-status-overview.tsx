"use client";

import React from "react";
import { cn } from "../../utils/cn";

interface StatusItem {
  label: string;
  count: number;
  color: string;
}

interface BentoStatusOverviewProps {
  title: string;
  statuses: StatusItem[];
  className?: string;
}

export function BentoStatusOverview({ title, statuses, className }: BentoStatusOverviewProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px] flex flex-col justify-between",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {statuses.map((status, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
            <div>
              <p className="text-xl font-bold font-heading leading-none mb-1">{status.count}</p>
              <p className="text-xs text-muted-foreground">{status.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
