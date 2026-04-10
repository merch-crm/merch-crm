"use client";
 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BentoIconContainer } from "@/components/ui/bento-primitives";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { pluralize } from '@/lib/pluralize';

export function BentoUserActivityHeatmap() {
   const [hoverDay, setHoverDay] = useState<number | null>(null);
   const [grid, setGrid] = useState<{ intensity: number }[]>([]);
   const [isMounted, setIsMounted] = useState(false);
   const [currentDate, setCurrentDate] = useState(new Date(2025, 4)); // По умолчанию Май 2025

   const MONTHS_RU = [
     'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
     'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
   ];

  useEffect(() => {
    setIsMounted(true);
    // audit-ok: hydration (inside useEffect)
    setGrid(Array.from({ length: 35 }, () => ({
      intensity: Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0
    })));
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-80 rounded-card bg-slate-50 border border-slate-100 animate-pulse" />
    );
  }

  const colorMap = [
    'bg-slate-100',
    'bg-primary-base/20',
    'bg-primary-base/40',
    'bg-primary-base/60',
    'bg-primary-base/80',
    'bg-primary-base shadow-lg shadow-primary-base/20'
  ];

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-slate-100 shadow-premium p-8 flex flex-col gap-6 group relative overflow-hidden transition-all duration-700 hover:shadow-2xl">
      <div className="flex items-center justify-between px-2 relative z-10">
         <div className="flex items-center gap-3">
            <BentoIconContainer>
               <Activity className="size-4" />
            </BentoIconContainer>
            <h3 className="text-[10px] font-black text-slate-900 tracking-[0.25em] leading-tight">Интенсивность действий</h3>
         </div>
         <span className="text-[9px] font-black text-emerald-500 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 tracking-widest flex items-center gap-1.5 shadow-sm">
            <Zap className="size-2.5 fill-emerald-500" /> Пик эффективности
         </span>
      </div>

      <div className="grid grid-cols-7 gap-2 relative z-10" role="grid" aria-label="Матрица тепловой карты активности">
         {grid.map((cell, i) => (
           <motion.button
             key={i}
             type="button"
             aria-label={`Активность за день №${i + 1}: интенсивность ${Math.floor((i * 1.5 + 42) % 100)} ${pluralize(Math.floor((i * 1.5 + 42) % 100), 'процент', 'процента', 'процентов')}`}
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.01 }}
             onMouseEnter={() => setHoverDay(i)}
             onMouseLeave={() => setHoverDay(null)}
             whileHover={{ scale: 1.1, zIndex: 10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
             className={cn(
               "size-full aspect-square rounded-lg border border-transparent transition-all duration-500 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10 shadow-sm", 
               colorMap[cell.intensity] || colorMap[0]
             )}
           />
         ))}
      </div>

      <AnimatePresence>
        {hoverDay !== null && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-slate-950 text-white rounded-element shadow-2xl border border-white/10 pointer-events-none flex flex-col items-center gap-1"
          >
            <span className="text-[9px] font-black text-slate-500 tracking-[0.2em]">ПЛОТНОСТЬ УЗЛА // {hoverDay + 1}</span>
            <span className="text-[10px] font-black tracking-widest flex items-center gap-2">
              ИНДЕКС: <span className="text-primary-base tabular-nums">{Math.floor((hoverDay * 1.5 + 42) % 100)}%</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 tracking-widest pt-6 border-t border-slate-50 relative z-10">
         <div className="flex items-center gap-2.5">
            <span className="opacity-40 text-[9px] font-black tracking-widest">НИЗ.</span>
            <div className="flex gap-1.5">
               {colorMap.slice(0, 5).map((c, i) => <div key={i} className={cn("size-2 rounded-sm border border-black/5 opacity-80", c)} />)}
            </div>
            <span className="opacity-40 text-[9px] font-black tracking-widest">ВЫС.</span>
         </div>
         <Popover>
            <PopoverTrigger asChild>
               <button type="button" className="flex items-center gap-2 text-slate-900 border-b-2 border-primary-base/40 pb-0.5 tracking-widest text-[9px] font-black hover:border-primary-base transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-base/20 rounded-sm">
                  <Calendar className="size-3 text-primary-base" /> {MONTHS_RU[currentDate.getMonth()]} {currentDate.getFullYear()}
               </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 shadow-premium rounded-card border-slate-100 bg-white/95 backdrop-blur-xl" align="end">
               <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between px-1">
                     <button 
                        type="button"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth()))}
                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                     >
                        <ChevronLeft className="size-4 text-slate-400 font-bold" />
                     </button>
                     <span className="text-[11px] font-black text-slate-900 tracking-widest">
                        {currentDate.getFullYear()}
                     </span>
                     <button 
                        type="button"
                        onClick={() => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth()))}
                        className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                     >
                        <ChevronRight className="size-4 text-slate-400 font-bold" />
                     </button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                     {MONTHS_RU.map((month, idx) => (
                        <button
                           key={month}
                           type="button"
                           onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), idx))}
                           className={cn(
                              "text-[9px] font-black tracking-wider py-2.5 px-1 rounded-xl transition-all",
                              currentDate.getMonth() === idx 
                                 ? "bg-primary-base text-white shadow-lg shadow-primary-base/20" 
                                 : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                           )}
                        >
                           {month.substring(0, 3)}
                        </button>
                     ))}
                  </div>
               </div>
            </PopoverContent>
         </Popover>
      </div>

      <div className="absolute -right-20 -bottom-20 size-64 bg-primary-base/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary-base/10 transition-all duration-1000" />
    </div>
  );
}
