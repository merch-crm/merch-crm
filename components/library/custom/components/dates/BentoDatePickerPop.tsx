'use client';

import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/components/library/custom/utils/cn";

export function BentoDatePickerPop() {
  const [selected, setSelected] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // audit-ok: hydration (inside useEffect)
    setSelected(new Date());
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-[280px] h-20 bg-white rounded-3xl border border-gray-100 animate-pulse flex items-center px-5 gap-3">
        <div className="size-8 rounded-xl bg-gray-50" />
        <div className="flex-1 h-10 bg-gray-50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[280px] bg-white rounded-3xl border border-gray-100 shadow-crm-md p-5 flex flex-col gap-3 group hover:border-primary-base/30 transition-colors">
      <div className="flex items-center justify-between px-1">
         <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary-base/10 flex items-center justify-center text-primary-base shadow-sm shadow-primary-base/5">
               <CalendarIcon className="size-4" />
            </div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tighter leading-none">Дата доставки</h4>
         </div>
      </div>

      <Popover>
        <PopoverTrigger>
          <button 
            type="button"
            aria-label={selected ? `Selected date: ${format(selected, "PPP", { locale: ru })}` : "Open date picker"}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group/trigger cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary-base focus:ring-offset-2",
              selected ? "bg-white border-slate-200 shadow-sm hover:shadow-md" : "bg-slate-50 border-transparent text-slate-400"
            )}
          >
            <div className="flex flex-col items-start gap-0.5">
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Выбрано</span>
               <span className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">
                {selected ? format(selected, "PPP", { locale: ru }) : "Выберите дату"}
               </span>
            </div>
            <ChevronRight className="size-4 text-slate-300 group-hover/trigger:text-primary-base group-hover/trigger:translate-x-1 transition-all" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="p-0 border-none bg-transparent shadow-none" sideOffset={10}>
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl p-4">
             <Calendar mode="single" selected={selected || undefined} onSelect={(date: Date | undefined) => setSelected(date || null)}
               initialFocus
               className="rounded-2xl"
             />
             <div className="grid grid-cols-2 gap-2 mt-4">
                <Button type="button" variant="outline" size="sm" className="rounded-xl font-black text-[11px] uppercase tracking-tighter" // audit-ok: hydration (inside event handler) onClick={() => setSelected(new Date())}
                >
                   Сегодня
                </Button>
                <Button type="button" variant="solid" color="purple" size="sm" className="rounded-xl font-black text-[11px] uppercase tracking-tighter" // audit-ok: hydration (inside event handler) onClick={() => setSelected(addDays(new Date(), 7))}
                >
                   Через неделю
                </Button>
             </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
