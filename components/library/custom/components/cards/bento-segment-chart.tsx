"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface Segment {
  label: string;
  value: number;
  color: string;
}

interface BentoSegmentChartProps {
  title: string;
  total: string;
  segments: Segment[];
  className?: string;
}

export function BentoSegmentChart({ title, total, segments, className }: BentoSegmentChartProps) {
  const sum = segments.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px]",
        className
      )}
    >
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <p className="text-2xl font-black font-heading">{total}</p>
      </div>

      <div className="flex h-3 rounded-full overflow-hidden mb-6 gap-0.5 bg-secondary">
        {segments.map((seg, i) => {
          const width = `${(seg.value / sum) * 100}%`;
          return (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width }}
              transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
              className="h-full"
              style={{ backgroundColor: seg.color }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-y-3 gap-x-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground truncate">{seg.label}</span>
            <span className="font-bold ml-auto">{Math.round((seg.value / sum) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
