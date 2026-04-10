"use client";

import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { value: 400 }, { value: 600 }, { value: 550 }, { value: 900 },
  { value: 800 }, { value: 1100 }, { value: 950 }, { value: 1300 }
];

export function BentoMiniSparkline({ label = "Active Node Performance" }: { label?: string }) {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3 group">
      <div className="flex justify-between items-start px-2">
         <div className="flex flex-col">
            <span className="text-[11px] font-black text-gray-400 normal-case leading-none">{label === "Active Node Performance" ? "Производительность Узла" : label}</span>
            <div className="flex items-baseline gap-2 mt-1">
               <span className="text-2xl font-black text-gray-900 tracking-normal">1.4k</span>
               <span className="text-[11px] font-black text-emerald-500">+18%</span>
            </div>
         </div>
         <div className="size-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary-base transition-colors">
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
         </div>
      </div>

      <div className="h-24 w-full mt-2">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
               <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
               </defs>
               <Area type="monotone" dataKey="value" stroke="#0F172A" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" animationDuration={2000} />
               <Tooltip content={() => null} cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }} />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
}
