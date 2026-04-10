"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface BentoDonutChartProps {
  title: string;
  data: { name: string; value: number; color: string }[];
  centerMetric?: { label: string; value: string };
  className?: string;
}

export function BentoDonutChart({ title, data, centerMetric, className }: BentoDonutChartProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-card flex flex-col justify-between items-center relative",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-muted-foreground   w-full mb-2">{title}</h3>
      
      <div className="relative w-full aspect-square max-w-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius="70%" outerRadius="90%" paddingAngle={5} dataKey="value" stroke="none" cornerRadius={12}>
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          </PieChart>
        </ResponsiveContainer>
        
        {centerMetric && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-semibold text-muted-foreground  tracking-whider mb-1">
              {centerMetric.label}
            </span>
            <span className="text-3xl font-black font-heading">
              {centerMetric.value}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-4 w-full">
        {data?.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}
