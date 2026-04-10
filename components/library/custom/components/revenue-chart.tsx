"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Zap, Activity, Calendar } from 'lucide-react';
import { cn } from "@/components/library/custom/utils/cn";
import { BentoCard, BentoIconContainer } from "@/components/library/custom/ui/bento-primitives";

const DEFAULT_DATA = [
  { name: 'ЯНВ', revenue: 4000, profit: 2400 },
  { name: 'ФЕВ', revenue: 3000, profit: 1398 },
  { name: 'МАР', revenue: 2000, profit: 9800 },
  { name: 'АПР', revenue: 2780, profit: 3908 },
  { name: 'МАЙ', revenue: 1890, profit: 4800 },
  { name: 'ИЮН', revenue: 2390, profit: 3800 },
  { name: 'ИЮЛ', revenue: 3490, profit: 4300 },
];

export function RevenueChart({ 
  data: propData,
  total = "98,500 ₽",
  trend = { value: 24, direction: 'up' },
  className
}: { 
  data?: { name: string; revenue: number; profit: number }[];
  total?: string;
  trend?: { value: number; direction: 'up' | 'down' };
  className?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const data = propData || DEFAULT_DATA;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
     return <div className="w-full h-[400px] bg-slate-50/50 rounded-[3rem] border border-slate-100 animate-pulse" />;
  }

  return (
    <BentoCard className={cn("p-6 flex flex-col gap-6 group hover:shadow-2xl transition-all duration-700 overflow-hidden relative", className)}>
      <div className="flex items-start justify-between relative z-10">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
               <BentoIconContainer className="size-8 bg-slate-50 text-slate-900 border border-slate-100 shadow-sm">
                  <Activity className="size-4" />
               </BentoIconContainer>
               <h3 className="text-sm font-bold text-slate-900 tracking-normal leading-none">Чистая выручка</h3>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
               <span className={cn(
                 "text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 tracking-normal",
                 trend.direction === 'up' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
               )}>
                  <Zap className={cn("size-3", trend.direction === 'up' ? "fill-emerald-500" : "fill-rose-500")} /> 
                  {trend.direction === 'up' ? '+' : '-'}{trend.value}% к прошл. периоду
               </span>
            </div>
         </div>
         <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium text-slate-400 tracking-normal flex items-center gap-1.5">
               <Calendar className="size-3" /> Q3 2025
            </span>
            <div className="text-xl font-bold text-slate-950 tracking-normal tabular-nums">{total}</div>
         </div>
      </div>

      <div className="h-56 w-full relative group/chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f8fafc" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 500, fill: '#94a3b8' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#94a3b8' }} />
            <Tooltip cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xl backdrop-blur-xl">
                        <p className="text-xs font-semibold text-slate-400 tracking-normal mb-3 border-b border-slate-50 pb-2">{payload[0].payload.name}</p>
                        <div className="flex flex-col gap-2.5">
                           <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-2">
                                 <div className="size-2 rounded-full bg-blue-500" />
                                 <span className="text-xs font-semibold text-slate-700 tracking-normal">Выручка</span>
                              </div>
                              <span className="text-xs font-bold text-blue-600 tabular-nums">{payload[0].value?.toLocaleString()} ₽</span>
                           </div>
                           <div className="flex items-center justify-between gap-6">
                              <div className="flex items-center gap-2">
                                 <div className="size-2 rounded-full bg-emerald-500" />
                                 <span className="text-xs font-semibold text-slate-500 tracking-normal">Прибыль</span>
                              </div>
                              <span className="text-xs font-bold text-emerald-500 tabular-nums">{payload[1].value?.toLocaleString()} ₽</span>
                           </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
               }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevPremium)" animationDuration={3000} strokeLinecap="round" />
            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={4} fill="none" strokeDasharray="10 10" animationDuration={3000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 relative z-10">
         <BentoCard className="p-5 bg-slate-50/50 group/stat relative overflow-hidden">
            <span className="text-xs font-semibold text-slate-400 tracking-normal">Пик недели</span>
            <div className="flex items-end justify-between mt-2">
               <span className="text-base font-bold text-slate-950 tracking-normal tabular-nums">{total}</span>
               <div className="size-9 rounded-xl bg-white shadow-md flex items-center justify-center text-emerald-500 border border-emerald-50 group-hover/stat:rotate-12 transition-transform duration-500">
                  <Award className="size-4" />
               </div>
            </div>
         </BentoCard>
         <BentoCard className="p-5 bg-slate-50/50 group/stat relative overflow-hidden">
            <span className="text-xs font-semibold text-slate-400 tracking-normal">Прогноз</span>
            <div className="flex items-end justify-between mt-2">
               <span className="text-base font-bold text-slate-950 tracking-normal tabular-nums">120 400 ₽</span>
               <div className="size-9 rounded-xl bg-white shadow-md flex items-center justify-center text-primary-base border border-slate-50 group-hover/stat:-rotate-12 transition-transform duration-500">
                  <TrendingUp className="size-4" />
               </div>
            </div>
         </BentoCard>
      </div>

      <div className="absolute -right-32 -bottom-32 size-96 bg-primary-base/5 rounded-full blur-[120px] group-hover:bg-primary-base/10 transition-all duration-1000 -z-10" />
    </BentoCard>
  );
}
