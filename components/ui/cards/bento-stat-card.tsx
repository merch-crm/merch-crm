"use client";

import React from 'react';
import { TrendingUp, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { Typo } from "@/components/ui/typo";

interface BentoStatCardProps {
  label?: React.ReactNode;
  value?: React.ReactNode;
  trend?: React.ReactNode;
  previousValue?: React.ReactNode;
  icon?: LucideIcon;
}

export function BentoStatCard({ 
  label = "Выручка за месяц", 
  value = "$142,500", 
  trend = "+12.5%", 
  previousValue = "$121.2k",
  icon: Icon = TrendingUp 
}: BentoStatCardProps) {
  return (
    <div className="group relative w-full max-w-sm rounded-card bg-white border border-slate-100 shadow-crm-md p-8 overflow-hidden transition-colors hover:border-slate-200">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 blur-[40px] rounded-full group-hover:bg-slate-900/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="size-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
               <Icon className="size-6" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black border border-emerald-100 tracking-tight leading-none">
               <ArrowUpRight className="size-3" />
               <Typo as="span">{trend}</Typo>
            </div>
          </div>

          <div className="mt-2">
            <Typo as="p" className="text-xs font-black text-slate-400 tracking-tight mb-1.5 leading-none">{label}</Typo>
            <Typo as="h2" className="text-4xl font-black text-slate-950 tabular-nums leading-none">{value}</Typo>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-black text-slate-400 tracking-tight leading-none">
            <Typo as="span">vs Прошлый месяц</Typo>
            <Typo as="span" className="text-slate-900 tabular-nums">{previousValue}</Typo>
          </div>
      </div>
    </div>
  );
}
