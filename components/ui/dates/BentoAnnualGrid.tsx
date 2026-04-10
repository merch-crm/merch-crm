"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { pkPlural as pluralize, pkFormatNumber } from "@/lib/utils/pluralization";
import { Typo } from "@/components/ui/typo";

/**
 * BentoAnnualGrid - GitHub-style сетка активности за год
 */
export function BentoAnnualGrid() {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // audit-ok: hydration (inside useEffect)
    setLevels(Array.from({ length: 24 * 7 }, () => Math.floor(Math.random() * 4)));
  }, []);

  if (!isMounted || levels.length === 0) return <div className="w-full max-w-sm h-64 bg-white rounded-card border border-slate-100 shadow-sm animate-pulse" />;
  
  const totalUpdates = 2412;

  return (
    <div className="w-full max-w-[400px] bg-white rounded-card border border-gray-100 shadow-sm p-6 flex flex-col group transition-colors hover:border-slate-200">
      <div className="flex items-center justify-between mb-4 px-1">
         <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner">
               <Activity className="size-4" />
            </div>
            <Typo as="h4" className="text-[13px] font-black text-slate-900 leading-none tracking-wide">Активность за год</Typo>
         </div>
         <Typo as="span" className="text-[10px] font-black text-slate-400">
            {pkFormatNumber(totalUpdates)} {pluralize(totalUpdates, 'обновление', 'обновления', 'обновлений')}
         </Typo>
      </div>

      <div className="h-8 mb-2 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {hoveredDay !== null && levels[hoveredDay] !== undefined && (
            <motion.div 
              key="tooltip"
              initial={{ opacity: 0, y: 5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              className="px-4 py-1.5 bg-slate-950 text-white text-[11px] font-black tracking-wide rounded-xl shadow-xl border border-white/10 pointer-events-none whitespace-nowrap min-w-[140px] text-center"
            >
              <Typo as="span">
                День {hoveredDay + 1}: Активность {["низкая", "средняя", "высокая", "максимальная"][levels[hoveredDay]]}
              </Typo>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-24 gap-1 p-1 bg-slate-50/50 rounded-element border border-slate-100/50">
         {levels.map((level, i) => (
            <motion.button
              key={i}
              type="button"
              aria-label={`${pluralize(i + 1, 'День', 'дня', 'дней')} ${i + 1}: Активность ${["низкая", "средняя", "высокая", "максимальная"][level]}`}
              onMouseEnter={() => setHoveredDay(i)}
              onMouseLeave={() => setHoveredDay(null)}
              whileHover={{ scale: 1.2, zIndex: 10 }}
              className={cn(
                "aspect-square rounded-sm transition-colors duration-500 outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
                level === 0 ? "bg-slate-100" :
                level === 1 ? "bg-emerald-200" :
                level === 2 ? "bg-emerald-400" :
                "bg-emerald-600"
              )}
            />
         ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
         <div className="flex items-center gap-1.5">
            <Typo as="span" className="text-[11px] font-black text-slate-400 tracking-wide">Меньше</Typo>
            <div className="flex gap-0.5">
               <div className="size-2 rounded-sm bg-slate-100" />
               <div className="size-2 rounded-sm bg-emerald-200" />
               <div className="size-2 rounded-sm bg-emerald-400" />
               <div className="size-2 rounded-sm bg-emerald-600" />
            </div>
            <Typo as="span" className="text-[11px] font-black text-slate-400 tracking-wide">Больше</Typo>
         </div>

         <Typo as="p" className="text-[11px] font-black text-emerald-600 tracking-wide flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> +12% Рост
         </Typo>
      </div>
    </div>
  );
}
