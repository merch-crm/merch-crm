"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface BentoLineChartProps {
  title: string;
  data: Record<string, unknown>[];
  lines: { key: string; color: string; label?: string }[];
  categoryKey: string;
  className?: string;
}

export function BentoLineChart({ 
  title, data, lines, categoryKey, className 
}: BentoLineChartProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-card flex flex-col min-h-[300px]",
        className
      )}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground  ">{title}</h3>
        <div className="flex gap-3">
          {lines.map((line, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: line.color }} />
              {line.label || line.key}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-20" />
            <XAxis dataKey={categoryKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} className="text-muted-foreground" />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
            {lines.map((line, i) => (
              <Line key={i} type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }} activeDot={{ r: 6, strokeWidth: 0 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
