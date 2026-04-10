"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface BentoAreaChartProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  categoryKey: string;
  color?: string;
  gradientId?: string;
  className?: string;
}

export function BentoAreaChart({ 
  title, data, dataKey, categoryKey, color = "#10b981", gradientId = "colorArea", className 
}: BentoAreaChartProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-card flex flex-col min-h-[300px]",
        className
      )}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-muted-foreground  ">{title}</h3>
        <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-20" />
            <XAxis dataKey={categoryKey} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} className="text-muted-foreground" />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
            />
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={4} fillOpacity={1} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
