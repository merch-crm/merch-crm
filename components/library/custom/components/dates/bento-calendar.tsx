'use client';

import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Zap } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

export function BentoCalendar() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // audit-ok: hydration (inside useEffect)
    setCurrentDate(new Date());
  }, []);

  if (!isMounted || !currentDate) {
    return (
      <div className="w-full max-w-[280px] h-[340px] bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse p-6">
        <div className="flex items-center justify-between mb-6">
           <div className="h-4 w-24 bg-gray-50 rounded-full" />
           <div className="flex gap-2">
              <div className="size-6 bg-gray-50 rounded-lg" />
              <div className="size-6 bg-gray-50 rounded-lg" />
           </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-4">
           {Array.from({ length: 35 }).map((_, i) => (
             <div key={i} className="aspect-square bg-gray-50 rounded-xl" />
           ))}
        </div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="w-full max-w-[280px] bg-white rounded-[2rem] border border-gray-100 shadow-crm-md p-5 flex flex-col gap-3 group hover:border-primary-base/30 transition-colors">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary-base" />
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">Дедлайны</h4>
         </div>
         <div className="flex items-center gap-1">
            <button 
              type="button" 
              aria-label="Previous month"
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors focus:ring-1 focus:ring-primary-base outline-none"
            >
               <ChevronLeft className="size-4" />
            </button>
            <button 
              type="button" 
              aria-label="Next month"
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors focus:ring-1 focus:ring-primary-base outline-none"
            >
               <ChevronRight className="size-4" />
            </button>
         </div>
      </div>

      <div className="flex flex-col gap-3">
         <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">
               {format(currentDate, "LLLL yyyy", { locale: ru })}
            </span>
         </div>

         <div className="grid grid-cols-7 gap-1">
            {['П', 'В', 'С', 'Ч', 'П', 'С', 'В'].map((day, i) => (
              <span key={i} className="text-[10px] font-black text-slate-400 text-center py-1 uppercase">{day}</span>
            ))}
            {days?.map((day, i) => (
              <button 
                key={i}
                type="button"
                aria-label={format(day, "d MMMM yyyy", { locale: ru })}
                className={cn(
                  "aspect-square flex items-center justify-center text-[11px] font-black rounded-xl transition-all cursor-pointer border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2 relative",
                  isToday(day) ? "bg-primary-base text-white shadow-primary-base/20 shadow-md scale-105" : "hover:bg-slate-50 hover:border-slate-100 text-slate-900",
                  !isSameMonth(day, currentDate) && "text-slate-300 pointer-events-none opacity-50"
                )}
              >
                <span className="relative z-10">{format(day, "d", { locale: ru })}</span>
                {isSameDay(day, addDays(currentDate, 2)) && (
                   <div className="absolute top-1 right-1 size-1 bg-rose-500 rounded-full" />
                )}
              </button>
            ))}

         </div>
      </div>

      <div className="pt-3 border-t border-slate-50">
         <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 group/task hover:bg-indigo-50 transition-colors">
            <div className="flex items-center gap-2">
               <div className="size-6 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/20">
                  <Zap className="size-3 fill-indigo-600" />
               </div>
               <span className="text-[11px] font-black text-indigo-900 uppercase tracking-tight">Релиз v5.2</span>
            </div>
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-tighter">через 2д</span>
         </div>
      </div>
    </div>
  );
}


function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
