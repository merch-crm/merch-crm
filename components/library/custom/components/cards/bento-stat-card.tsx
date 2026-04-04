"use client";

import React from 'react';
import { TrendingUp, ArrowUpRight, type LucideIcon } from 'lucide-react';

export function BentoStatCard({ 
  label = "Monthly Revenue", 
  value = "$142,500", 
  trend = "+12.5%", 
  icon: Icon = TrendingUp 
}: { 
  label?: string; 
  value?: string; 
  trend?: string; 
  icon?: LucideIcon 
}) {
  return (
    <div className="group relative w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-base/5 blur-[40px] rounded-full group-hover:bg-primary-base/10 transition-colors" />
      
      <div className="relative z-10 flex flex-col gap-3">
         <div className="flex items-center justify-between">
            <div className="size-12 rounded-2xl bg-primary-base/10 flex items-center justify-center text-primary-base">
               <Icon className="size-6" />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black border border-emerald-100">
               <ArrowUpRight className="size-3" />
               {trend}
            </div>
         </div>

         <div className="mt-2 text-center">
            <p className="text-xs font-black text-gray-400 tracking-[0.2em] mb-1">{label}</p>
            <h2 className="text-4xl font-black text-gray-950  tabular-nums">{value}</h2>
         </div>

         <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-black text-gray-400">
            <span>vs Last Month</span>
            <span className="text-gray-900">$121.2k</span>
         </div>
      </div>
    </div>
  );
}
