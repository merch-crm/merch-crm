"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from "@/lib/utils";

interface SparklineChartProps {
  data?: { value: number }[];
  color?: string;
  className?: string;
}

export function SparklineChart({ data: propData, color = "var(--primary-base)", className }: SparklineChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<{ value: number }[]>([]);

  useEffect(() => {
    setIsMounted(true);
    // audit-ok: hydration (inside useEffect)
    const defaultData = Array.from({ length: 20 }, () => ({ 
      value: Math.floor(Math.random() * 50) + 20 
    }));
    setData(propData || defaultData);
  }, [propData]);


  if (!isMounted) return <div className={cn("h-full w-full bg-gray-50 animate-pulse rounded-lg", className)} />;

  return (
    <div className={cn("h-full w-full min-h-[40px]", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data || []}>
          <defs>
            <linearGradient id={`sparkline-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip content={() => null}
             cursor={{ stroke: color, strokeWidth: 1 }}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#sparkline-${color.replace(/[^a-zA-Z0-9]/g, '')})`} animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
