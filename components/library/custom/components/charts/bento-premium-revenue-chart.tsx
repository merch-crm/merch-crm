"use client";

import React from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';

export interface BentoPremiumRevenueChartProps {
  title?: string;
  value?: string;
  data?: number[];
  icon?: React.ReactNode;
}

export function BentoPremiumRevenueChart({
  title = "Выручка за месяц",
  value = "8.45М ₽",
  data = [40, 60, 45, 80, 55, 90, 75],
  icon = <LineChartIcon className="size-5" />
}: BentoPremiumRevenueChartProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer group overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-xs font-black text-gray-400 mb-1">{title}</h4>
          <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2 h-20 group-hover:gap-3 transition-all duration-300">
        {data?.map((h, i) => (
          <div key={i} className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-500 transition-colors duration-300 cursor-cell relative group/bar" style={{ height: `${h}%` }}>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 shadow-sm border border-slate-100 text-[11px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
            {h}k
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
