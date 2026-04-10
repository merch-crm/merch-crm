"use client";

import React, { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Zap, Activity, Calendar } from 'lucide-react';
import { cn } from "@/components/library/custom/utils/cn";
import { BentoCard, BentoIconContainer } from "@/components/library/custom/ui/bento-primitives";

const DEFAULT_DATA = [
  { name: 'JAN', revenue: 4000, profit: 2400 },
  { name: 'FEB', revenue: 3000, profit: 1398 },
  { name: 'MAR', revenue: 2000, profit: 9800 },
  { name: 'APR', revenue: 2780, profit: 3908 },
  { name: 'MAY', revenue: 1890, profit: 4800 },
  { name: 'JUN', revenue: 2390, profit: 3800 },
  { name: 'JUL', revenue: 3490, profit: 4300 },
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
    <BentoCard className={cn("p-8 flex flex-col gap-8 group hover:shadow-2xl transition-all duration-700 overflow-hidden relative", className)}>
      <div className="flex items-start justify-between px-2 relative z-10">
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
               <BentoIconContainer className="size-8 bg-slate-50 text-slate-900 border border-slate-100 shadow-sm">
                  <Activity className="size-4" />
               </BentoIconContainer>
               <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">Net Revenue Matrix</h3>
            </div>
            <div className="flex items-center gap-3 mt-1">
               <span className={cn(
                 "text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2 uppercase tracking-widest",
                 trend.direction === 'up' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
               )}>
                  <Zap className={cn("size-3", trend.direction === 'up' ? "fill-emerald-500" : "fill-rose-500")} /> 
                  {trend.direction === 'up' ? '+' : '-'}{trend.value}% REL / PRV
               </span>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Performance Index // Alpha-7</span>
            </div>
         </div>
         <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
               <Calendar className="size-3" /> Q3 ARCHIVE
            </span>
            <div className="text-xl font-black text-slate-950 tracking-tighter tabular-nums">{total}</div>
         </div>
      </div>

      <div className="h-56 w-full relative group/chart -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevPremium" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f8fafc" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }} />
            <Tooltip cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-2xl backdrop-blur-xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">DATA // {payload[0].payload.name}</p>
                        <div className="flex flex-col gap-3">
                           <div className="flex items-center justify-between gap-8 focus:outline-none">
                              <div className="flex items-center gap-3">
                                 <div className="size-2 rounded-full bg-primary-base animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                                 <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Revenue</span>
                              </div>
                              <span className="text-[11px] font-black text-primary-base tabular-nums">${payload[0].value}</span>
                           </div>
                           <div className="flex items-center justify-between gap-8 focus:outline-none">
                              <div className="flex items-center gap-3">
                                 <div className="size-2 rounded-full bg-emerald-400" />
                                 <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Profit</span>
                              </div>
                              <span className="text-[11px] font-black text-emerald-400 tabular-nums">${payload[1].value}</span>
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

      <div className="grid grid-cols-2 gap-4 relative z-10">
         <BentoCard className="p-6 bg-slate-50/50 shadow-inner group/stat relative overflow-hidden">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Peak Week Arc</span>
            <div className="flex items-end justify-between mt-3">
               <span className="text-sm font-black text-slate-950 uppercase tracking-tighter tabular-nums">{total}</span>
               <div className="size-10 rounded-2xl bg-white shadow-xl flex items-center justify-center text-emerald-500 border border-emerald-50 group-hover:rotate-12 transition-transform duration-700">
                  <Award className="size-5" />
               </div>
            </div>
            <div className="absolute top-0 right-0 size-24 bg-emerald-400/5 blur-3xl rounded-full" />
         </BentoCard>
         <BentoCard className="p-6 bg-slate-50/50 shadow-inner group/stat relative overflow-hidden">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Projection</span>
            <div className="flex items-end justify-between mt-3">
               <span className="text-sm font-black text-slate-950 uppercase tracking-tighter tabular-nums">$120,400.00</span>
               <div className="size-10 rounded-2xl bg-white shadow-xl flex items-center justify-center text-primary-base border border-slate-50 group-hover:-rotate-12 transition-transform duration-700">
                  <TrendingUp className="size-5" />
               </div>
            </div>
            <div className="absolute top-0 right-0 size-24 bg-primary-base/5 blur-3xl rounded-full" />
         </BentoCard>
      </div>

      <div className="absolute -right-32 -bottom-32 size-96 bg-primary-base/5 rounded-full blur-[120px] group-hover:bg-primary-base/10 transition-all duration-1000 -z-10" />
    </BentoCard>
  );
}
