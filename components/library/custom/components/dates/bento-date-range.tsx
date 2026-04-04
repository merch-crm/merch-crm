'use client';

import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

export function BentoDateRange() {
  const [range, setRange] = useState<{ from: Date; to: Date } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // audit-ok: hydration (inside useEffect)
    const from = new Date();
    const to = addDays(from, 14);
    setRange({ from, to });
  }, []);

  if (!isMounted || !range) {
    return (
      <div className="w-full max-w-[340px] h-48 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse p-6">
        <div className="flex items-center justify-between mb-6">
           <div className="h-4 w-32 bg-gray-50 rounded-full" />
           <div className="h-4 w-16 bg-gray-50 rounded-full" />
        </div>
        <div className="h-12 bg-gray-50 rounded-2xl w-full mb-4" />
        <div className="h-4 w-24 bg-gray-50 rounded-full" />
      </div>
    );
  }

  return (
    <div 
      role="region" 
      aria-label="Active period overview"
      className="w-full max-w-[340px] bg-white rounded-[2rem] border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3 group overflow-hidden relative hover:border-emerald-500/30 transition-colors"
    >
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
               <Calendar className="size-4" />
            </div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">Активный период</h4>
         </div>
         <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 uppercase tracking-widest shadow-sm shadow-emerald-500/5">
            Активно
         </div>
      </div>

      <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3 py-2 border-y border-slate-50">
         <div className="flex flex-col gap-1 items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Начало</span>
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{format(range.from, "dd MMM yyyy", { locale: ru })}</span>
         </div>
         <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-all shadow-inner group-hover:scale-110">
            <ArrowRight className="size-4" />
         </div>
         <div className="flex flex-col gap-1 items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Завершение</span>
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">{format(range.to, "dd MMM yyyy", { locale: ru })}</span>
         </div>
      </div>

      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
         <div className="flex items-center gap-1.5 text-slate-900">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            <span>14 Дней</span>
         </div>
         <div className="flex items-center gap-1.5 text-slate-400">
            <Zap className="size-3.5 fill-slate-100" />
            <span className="opacity-70">2 Релиза</span>
         </div>
      </div>

      <div className="absolute -right-10 -bottom-10 size-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
    </div>
  );
}
