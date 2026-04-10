"use client";

import React from "react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { cn } from "../../utils/cn";

interface BentoMetricChartProps {
  title: string;
  metric: string;
  subtitle?: string;
  data: Record<string, unknown>[];
  dataKey: string;
  trend: "up" | "down";
  color?: string;
  className?: string;
}

export function BentoMetricChart({ 
  title, metric, subtitle, data, dataKey, trend, color = "#10b981", className 
}: BentoMetricChartProps) {
  const isUp = trend === "up";

  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border rounded-[27px] overflow-hidden flex flex-col md:flex-row group relative",
        className
      )}
    >
      {/* Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" 
        style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }} 
      />

      <div className="p-8 pb-4 md:pb-8 flex-1 flex flex-col justify-center min-w-[200px] relative z-10">
        <p className="text-sm font-semibold   text-muted-foreground mb-4">
          {title}
        </p>
        <h2 className="text-5xl md:text-6xl font-black font-heading  mb-2" style={{ color: isUp ? "inherit" : "#ef4444" }}>
          {metric}
        </h2>
        {subtitle && (
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-secondary/50 max-w-fit">
            {subtitle}
          </div>
        )}
      </div>

      <div className="h-[200px] md:h-auto md:flex-1 relative z-10 border-l border-border/10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.6}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={4} fillOpacity={1} fill={`url(#gradient-${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
