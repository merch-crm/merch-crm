"use client";

import React from "react";
import { RadialBarChart, RadialBar, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface BentoRadialBarChartProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  className?: string;
}

export function BentoRadialBarChart({ title, data, dataKey, className }: BentoRadialBarChartProps) {
  const style = {
    top: '50%',
    right: 0,
    transform: 'translate(0, -50%)',
    lineHeight: '24px',
  };

  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-card flex flex-col",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-muted-foreground   mb-2">{title}</h3>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="40%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={16} data={data}>
            <RadialBar label={{ position: 'insideStart', fill: '#fff', fontSize: 11, fontWeight: 'bold' }} background={{ fill: 'currentColor', opacity: 0.05 }} dataKey={dataKey} cornerRadius={8} />
            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={style} />
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
