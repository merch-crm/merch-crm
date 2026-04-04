"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Apple } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";
import { pkPlural as pluralize, pkFormatNumber } from "@/lib/utils/pluralization";

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

  if (!isMounted || levels.length === 0) return <div className="w-full max-w-sm h-64 bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse" />;
  
  const totalUpdates = 2412;

  return (
    <div className="w-full max-w-sm bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 relative group overflow-hidden">
      <div className="flex items-center justify-between mb-4">
         <h4 className="text-xs font-black text-gray-900   leading-none">Активность за год</h4>
         <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
            {pkFormatNumber(totalUpdates)} {pluralize(totalUpdates, 'обновление', 'обновления', 'обновлений')}
         </span>
      </div>

      <div className="grid grid-cols-24 gap-1 p-1 bg-gray-50/50 rounded-2xl border border-gray-100/50">
         {levels.map((level, i) => {
            return (
               <motion.button
                 key={i}
                 type="button"
                 aria-label={`${pluralize(i + 1, 'День', 'дня', 'дней')} ${i + 1}: Активность ${["низкая", "средняя", "высокая", "максимальная"][level]}`}
                 onMouseEnter={() => setHoveredDay(i)}
                 onMouseLeave={() => setHoveredDay(null)}
                 whileHover={{ scale: 1.2, zIndex: 10 }}
                 className={cn(
                   "aspect-square rounded-[2px] transition-colors duration-500 outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
                   level === 0 ? "bg-gray-100" :
                   level === 1 ? "bg-emerald-200" :
                   level === 2 ? "bg-emerald-400" :
                   "bg-emerald-600"
                 )}
               />

            );
         })}
      </div>

      <AnimatePresence>
        {hoveredDay !== null && levels[hoveredDay] !== undefined && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute z-50 bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-950 text-white text-[11px] font-black  rounded-xl shadow-2xl border border-white/10 pointer-events-none whitespace-nowrap min-w-[140px] text-center"
          >
            День {hoveredDay + 1}: Активность {["низкая", "средняя", "высокая", "максимальная"][levels[hoveredDay]]}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between">
         <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-gray-400 ">Меньше</span>
            <div className="flex gap-0.5">
               <div className="size-2 rounded-[1px] bg-gray-100" />
               <div className="size-2 rounded-[1px] bg-emerald-200" />
               <div className="size-2 rounded-[1px] bg-emerald-400" />
               <div className="size-2 rounded-[1px] bg-emerald-600" />
            </div>
            <span className="text-[11px] font-black text-gray-400 ">Больше</span>
         </div>

         <p className="text-[11px] font-black text-emerald-600   flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> +12% Рост
         </p>
      </div>

      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
         <Apple className="size-24 text-gray-900 rotate-12" />
      </div>
    </div>
  );
}
