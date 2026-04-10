'use client';

import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react";
import { Typo } from "@/components/ui/typo";

export function BentoMonthSlider() {
  const [date, setDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // audit-ok: hydration (inside useEffect)
    setDate(new Date());
  }, []);

  const nextMonth = () => {
    if (!date) return;
    setDirection(1);
    setDate(addMonths(date, 1));
  };

  const prevMonth = () => {
    if (!date) return;
    setDirection(-1);
    setDate(subMonths(date, 1));
  };

  if (!isMounted || !date) {
    return (
      <div className="w-full max-w-sm h-32 bg-white rounded-card border border-gray-100 animate-pulse flex items-center justify-between p-6">
        <div className="size-10 rounded-xl bg-gray-50" />
        <div className="flex-1 h-10 bg-gray-50 rounded-xl mx-4" />
        <div className="size-10 rounded-xl bg-gray-50" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-card border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3 group overflow-hidden relative hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between px-1">
         <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
               <Calendar className="size-4" />
            </div>
            <Typo as="h4" className="text-[13px] font-black text-slate-900 tracking-wide leading-none">Период отчета</Typo>
         </div>
      </div>

      <div className="flex items-center justify-between bg-slate-50/50 rounded-element p-2 border border-slate-50 group/slider">
         <button 
           type="button"
           onClick={prevMonth}
           aria-label="Previous month"
           className="size-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-slate-950 hover:border-slate-950 transition-all text-slate-400 hover:text-white active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
         >
            <ChevronLeft className="size-4" />
         </button>

         <div className="relative h-10 flex-1 flex items-center justify-center overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
               <motion.div
                 key={date.getTime()}
                 custom={direction}
                 initial={{ y: direction > 0 ? 20 : -20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: direction > 0 ? -20 : 20, opacity: 0 }}
                 transition={{ type: "spring", stiffness: 400, damping: 30 }}
                 className="flex flex-col items-center"
               >
                  <Typo as="span" className="text-[15px] font-black text-slate-900 tracking-tight capitalize">
                     {format(date, "LLLL yyyy", { locale: ru })}
                  </Typo>
               </motion.div>
            </AnimatePresence>
         </div>

         <button 
           type="button"
           onClick={nextMonth}
           aria-label="Next month"
           className="size-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-slate-950 hover:border-slate-950 transition-all text-slate-400 hover:text-white active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
         >
            <ChevronRight className="size-4" />
         </button>
      </div>

      <button 
         type="button"
         aria-label={`Go to previous period: ${format(subMonths(date, 1), "LLLL yyyy", { locale: ru })}`}
         className="flex items-center justify-between px-2 text-[11px] font-black group/link hover:text-primary-base transition-colors w-full focus:outline-none focus:text-primary-base"
      >
         <Typo as="span" className="text-slate-400 group-hover/link:text-primary-base transition-colors tracking-wide">Прошлый период: {format(subMonths(date, 1), "LLL yyyy", { locale: ru })}</Typo>
         <ArrowRight className="size-3" />
      </button>

      <div className="absolute -left-10 -bottom-10 size-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
