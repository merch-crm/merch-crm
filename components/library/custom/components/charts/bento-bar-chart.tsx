"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "../../utils/cn";

interface BentoBarChartProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  categoryKey: string;
  color?: string;
  className?: string;
}

export function BentoBarChart({ 
  title, data, dataKey, categoryKey, color = "#8b5cf6", className 
}: BentoBarChartProps) {
  // Find max value to highlight it
  const maxVal = data && data.length > 0 
    ? Math.max(...data.map(d => Number(d[dataKey]) || 0)) 
    : 0;

  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px] flex flex-col min-h-[300px]",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-muted-foreground mb-6  ">{title}</h3>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-20" />
            <XAxis dataKey={categoryKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} className="text-muted-foreground" />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
            />
            <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }} />
            <Bar dataKey={dataKey} radius={[6, 6, 6, 6]} barSize={32}>{data?.map((entry, index) => <Cell key={index} fill={(entry[dataKey] as number) === maxVal ? color : `${color}66`} /* highlight max */ />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
