"use client";

import React from "react";
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "../../utils/cn";

interface BentoComposedChartProps {
  title: string;
  data: Record<string, unknown>[];
  categoryKey: string;
  barKey: string;
  areaKey: string;
  lineKey: string;
  barColor?: string;
  areaColor?: string;
  lineColor?: string;
  className?: string;
}

export function BentoComposedChart({ 
  title, data, categoryKey, barKey, areaKey, lineKey, 
  barColor = "#3b82f6", areaColor = "#8b5cf6", lineColor = "#10b981", className 
}: BentoComposedChartProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px] flex flex-col min-h-[300px]",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-muted-foreground   mb-6">{title}</h3>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-20" />
            <XAxis dataKey={categoryKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} className="text-muted-foreground" />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
            <Area type="monotone" dataKey={areaKey} fill={areaColor} stroke="none" fillOpacity={0.1} />
            <Bar dataKey={barKey} barSize={20} fill={barColor} radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey={lineKey} stroke={lineColor} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
