"use client";

import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "../../utils/cn";

interface BentoScatterChartProps {
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  zKey?: string; // Optional for bubble size
  color?: string;
  className?: string;
}

export function BentoScatterChart({ 
  title, data, xKey, yKey, zKey, color = "#f43f5e", className 
}: BentoScatterChartProps) {
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
          <ScatterChart margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-20" />
            <XAxis dataKey={xKey} type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} className="text-muted-foreground" />
            <YAxis dataKey={yKey} type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
            <Scatter name="Data" data={data} fill={color}>
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={(entry["color"] as string) || color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
