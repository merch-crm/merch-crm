"use client";

import React from "react";
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "../../utils/cn";

interface BentoFunnelChartProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey: string;
  className?: string;
}

export function BentoFunnelChart({ title, data, dataKey, nameKey, className }: BentoFunnelChartProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px] flex flex-col items-center",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-muted-foreground   w-full mb-4">{title}</h3>
      <div className="flex-1 w-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} 
            />
            <Funnel
              dataKey={dataKey}
              data={data}
              isAnimationActive
            >
              <LabelList position="right" fill="currentColor" opacity={0.7} stroke="none" dataKey={nameKey} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
