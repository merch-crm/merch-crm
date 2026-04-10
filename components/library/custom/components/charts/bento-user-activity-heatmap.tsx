"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Calendar } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';
import { BentoIconContainer, BentoCard, BentoGlow } from "@/components/library/custom/ui/bento-primitives";

export function BentoUserActivityHeatmap({ className }: { className?: string }) {
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const [grid, setGrid] = useState<{ intensity: number }[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // audit-ok: hydration (inside useEffect)
    setGrid(Array.from({ length: 35 }, () => ({
      intensity: Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0
    })));
  }, []);

  if (!isMounted) {
    return (
      <BentoCard className={cn("h-96 animate-pulse bg-slate-50 border-slate-100", className)}>
        <div className="size-full" />
      </BentoCard>
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
    <BentoCard className={cn("p-8 sm:p-10", className)}>
      <div className="flex items-center justify-between px-2 relative z-10">
         <div className="flex items-center gap-3">
            <BentoIconContainer>
               <Activity className="size-4" />
            </BentoIconContainer>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">Activity Velocity</h3>
         </div>
         <span className="text-[9px] font-black text-emerald-500 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="size-2.5 fill-emerald-500" /> Peak Performance
         </span>
      </div>

      <div className="grid grid-cols-7 gap-2 relative z-10 mt-8" role="grid" aria-label="User activity heatmap Matrix">
         {grid.map((cell, i) => (
           <motion.button
             key={i}
             type="button"
             aria-label={`Activity node ${i + 1}: ${Math.floor((i * 1.5 + 42) % 100)}% density`}
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
            className="absolute z-50 bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-slate-950 text-white rounded-2xl shadow-2xl border border-white/10 pointer-events-none flex flex-col items-center gap-1"
          >
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">NODE DENSITY // {hoverDay + 1}</span>
            <span className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
              Velocity Index: <span className="text-primary-base tabular-nums">{Math.floor((hoverDay * 1.5 + 42) % 100)}%</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-50 relative z-10">
         <div className="flex items-center gap-3">
            <span className="opacity-50">Low</span>
            <div className="flex gap-1">
               {colorMap.slice(0, 5).map((c, i) => <div key={i} className={cn("size-2 rounded-[2px] border border-black/5", c)} />)}
            </div>
            <span className="opacity-50">High</span>
         </div>
         <div className="flex items-center gap-2 text-slate-900 border-b-2 border-primary-base pb-0.5">
            <Calendar className="size-3" /> MAY 2025
         </div>
      </div>

      <BentoGlow />
    </BentoCard>
  );
}
