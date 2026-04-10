"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface StatusItem {
  label: React.ReactNode;
  count: React.ReactNode;
  color: string;
}

interface BentoStatusOverviewProps {
  title: React.ReactNode;
  statuses: StatusItem[];
  className?: string;
}

export function BentoStatusOverview({ title, statuses, className }: BentoStatusOverviewProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-card flex flex-col justify-between",
        className
      )}
    >
      <Typo as="h3" className="text-sm font-semibold text-muted-foreground mb-4 uppercase">{title}</Typo>
      <div className="grid grid-cols-2 gap-3">
        {statuses.map((status, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
            <div>
              <Typo as="p" className="text-xl font-bold font-heading leading-none mb-1 tabular-nums">{status.count}</Typo>
              <Typo as="p" className="text-xs text-muted-foreground uppercase">{status.label}</Typo>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
