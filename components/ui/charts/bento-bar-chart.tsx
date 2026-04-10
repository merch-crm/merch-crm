"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";

interface BentoBarChartProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  categoryKey: string;
  color?: string;
  className?: string;
}

export function BentoBarChart({ 
  title, data, dataKey, categoryKey, color: _color = "#101827", className 
}: BentoBarChartProps) {
  // Find max value to highlight it
  const maxVal = data && data.length > 0 
    ? Math.max(...data.map(d => Number(d[dataKey]) || 0)) 
    : 0;

  return (
    <div
      className={cn(
        "bg-white text-slate-900 shadow-crm-md border border-slate-100 p-6 rounded-card flex flex-col min-h-[300px]",
        className
      )}
    >
      <h3 className="text-sm font-semibold text-slate-400 mb-6 text-left">{title}</h3>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="opacity-50" />
            <XAxis dataKey={categoryKey} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94A3B8" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "#94A3B8" }} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
            />
            <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', fontSize: '10px', fontWeight: 900 }} />
            <Bar dataKey={dataKey} radius={[6, 6, 6, 6]} barSize={24}>{data?.map((entry, index) => <Cell key={index} fill={(entry[dataKey] as number) === maxVal ? "#101827" : "#E2E8F0"} className="transition-all duration-300 hover:opacity-80" />)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
