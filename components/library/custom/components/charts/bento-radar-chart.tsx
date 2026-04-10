"use client";

import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "../../utils/cn";

interface BentoRadarChartProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey1: string;
  dataKey2?: string;
  color1?: string;
  color2?: string;
  categoryKey: string;
  className?: string;
}

export function BentoRadarChart({ 
  title, data, dataKey1, dataKey2, color1 = "#8b5cf6", color2 = "#10b981", categoryKey, className 
}: BentoRadarChartProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px] flex flex-col",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-muted-foreground   mb-2">{title}</h3>
      <div className="flex-1 w-full min-h-[250px] relative">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-75 pointer-events-none" />
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="currentColor" className="opacity-10 dark:opacity-20" />
            <PolarAngleAxis dataKey={categoryKey} tick={{ fill: "currentColor", fontSize: 11, opacity: 0.6 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            <Radar name={dataKey1} dataKey={dataKey1} stroke={color1} strokeWidth={2} fill={color1} fillOpacity={0.4} />
            {dataKey2 && (
              <Radar name={dataKey2} dataKey={dataKey2} stroke={color2} strokeWidth={2} fill={color2} fillOpacity={0.4} />
            )}
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
