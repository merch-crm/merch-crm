"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { ChevronRight, Target, Clock, TrendingUp, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pluralizeRU } from "@/lib/pluralize";

interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function AnimatedCounter({ value, duration: _duration = 2, prefix = "", suffix = "", decimals = 1 }: CounterProps) {
  const count = useMotionValue(0);
  const springValue = useSpring(count, {
    stiffness: 40,
    damping: 20,
    restDelta: 0.001
  });
  
  const rounded = useTransform(springValue, (latest) => 
    prefix + latest.toFixed(decimals) + suffix
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      count.set(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value, count]);

  const [displayValue, setDisplayValue] = useState(prefix + "0" + suffix);

  useEffect(() => {
    return rounded.on("change", (v) => setDisplayValue(v));
  }, [rounded, prefix, suffix]);

  return <span className="tabular-nums">{displayValue}</span>;
}

export function BentoRevenueGauge() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'revenue' | 'percent'>('revenue');
  const [hoveredCard, setHoveredCard] = useState<'quota' | 'term' | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const percentage = 75.4;
  const radius = 70;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffsetValue = circumference - (percentage / 100) * circumference;

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-[420px] rounded-card bg-white border border-slate-100 animate-pulse flex items-center justify-center p-8 shadow-premium" />
    );
  }

  return (
    <div 
      className="w-full max-w-sm rounded-card bg-white border border-slate-100 shadow-premium p-8 flex flex-col items-center gap-6 group overflow-hidden transition-all duration-700 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredCard(null);
      }}
    >
      <div className="flex justify-between items-center w-full relative z-10">
        <div className="bg-slate-50/50 px-4 py-2 rounded-full flex items-center gap-3 border border-slate-100/50 shadow-inner">
          <TrendingUp className="size-3 text-slate-900" />
          <span className="text-[11px] font-black text-slate-400 tracking-widest">Глобальная цель</span>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border border-emerald-100 flex items-center gap-1.5 shadow-sm">
          <Zap className="size-2.5 fill-emerald-500" /> В графике
        </div>
      </div>

      <button 
        type="button"
        aria-label={`Переключить вид (выручка/проценты). Текущий вид: ${activeTab === 'revenue' ? 'Выручка' : 'Проценты'}`}
        className="relative flex flex-col items-center justify-center cursor-pointer select-none outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10 rounded-card group/gauge active:scale-[0.98] transition-all duration-500 bg-transparent border-none p-0 appearance-none text-center w-full"
        onClick={() => setActiveTab(activeTab === 'revenue' ? 'percent' : 'revenue')}
      >
        {/* 1. TOP LABEL (Outside circle) */}
        <div className="mb-6 h-6 flex items-center justify-center overflow-hidden w-full">
           <AnimatePresence mode="wait">
             {activeTab === 'revenue' ? (
               <motion.div
                 key="label-rev"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="flex items-center gap-2"
               >
                  <Activity className="size-3 text-primary-base animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] whitespace-nowrap uppercase">Отслеживание выручки</span>
               </motion.div>
             ) : (
               <motion.div
                 key="label-pct"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="flex items-center gap-2"
               >
                  <Activity className="size-3 text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-400 tracking-[0.2em] whitespace-nowrap uppercase">Исполнение плана</span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* 2. CENTER GAUGE & VALUE */}
        <div className="relative size-60 flex items-center justify-center">
           <motion.div 
             animate={{ 
               opacity: isHovered ? 0.15 : 0.05,
               scale: isHovered ? 1.2 : 1
             }}
             className="absolute inset-0 bg-slate-900 blur-[50px] rounded-full transition-opacity duration-700" 
           />
           
           <svg className="size-full -rotate-90 transform overflow-visible" viewBox="0 0 200 200">
             <circle
               className="text-slate-50"
               strokeWidth={strokeWidth}
               stroke="currentColor"
               fill="transparent"
               r={radius}
               cx="100"
               cy="100"
             />
             <motion.circle
               className="text-slate-950"
               strokeWidth={strokeWidth}
               strokeDasharray={circumference}
               initial={{ strokeDashoffset: circumference }}
               animate={{ 
                 strokeDashoffset: strokeDashoffsetValue,
                 strokeWidth: hoveredCard === 'quota' ? strokeWidth + 6 : strokeWidth
               }}
               transition={{ 
                 strokeDashoffset: { duration: 1.5, ease: "circOut", delay: 0.2 },
                 strokeWidth: { type: "spring", stiffness: 300, damping: 20 }
               }}
               strokeLinecap="round"
               stroke="currentColor"
               fill="transparent"
               r={radius}
               cx="100"
               cy="100"
             />
           </svg>

           <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
             <AnimatePresence mode="wait">
               {activeTab === 'revenue' ? (
                 <motion.div
                   key="val-rev"
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="text-4xl font-black text-slate-950 flex items-baseline tracking-tighter justify-center tabular-nums"
                 >
                   <span className="text-2xl mr-1 text-slate-400">$</span>
                   <AnimatedCounter value={2.4} decimals={1} suffix="M" duration={2} />
                 </motion.div>
               ) : (
                 <motion.div
                   key="val-pct"
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.8 }}
                   className="text-5xl font-black text-slate-950 tracking-tighter justify-center tabular-nums"
                 >
                   <AnimatedCounter value={75.4} decimals={1} suffix="%" duration={2} />
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
        </div>

        {/* 3. BOTTOM HINT (Outside circle) */}
        <div className="mt-6 flex items-center justify-center h-8">
           <motion.div 
             animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
             className="text-[9px] font-black text-primary-base tracking-[0.15em] flex items-center gap-2 bg-primary-base/8 px-5 py-2 rounded-full border border-primary-base/15 backdrop-blur-sm shadow-sm"
           >
             <span>Нажмите для смены данных</span>
             <ChevronRight className="size-2.5" />
           </motion.div>
        </div>
      </button>

      <div className="flex gap-4 w-full relative z-10">
        <button 
          type="button"
          aria-label="Просмотр деталей плана"
          className={cn(
            "flex-1 p-7 rounded-card bg-slate-50 border border-slate-100 transition-all duration-500 cursor-pointer overflow-hidden relative text-left outline-none focus-visible:ring-4 focus-visible:ring-slate-950/10",
            hoveredCard === 'quota' ? "bg-white border-slate-950 shadow-2xl -translate-y-2 scale-[1.05]" : "hover:border-slate-300 shadow-sm"
          )}
          onMouseEnter={() => setHoveredCard('quota')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className={cn("size-4 transition-colors", hoveredCard === 'quota' ? "text-slate-950" : "text-slate-400")} />
            <span className="text-[10px] font-black text-slate-400 tracking-[0.15em]">Цель</span>
          </div>
          <div className="text-2xl font-black text-slate-950 tracking-tighter tabular-nums">$3.0M</div>
          <div className="mt-3 h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner border border-black/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '80%' }}
              className="h-full bg-slate-950 rounded-full shadow-premium"
            />
          </div>
        </button>

        <button 
          type="button"
          aria-label="Просмотр оставшегося времени"
          className={cn(
            "flex-1 p-7 rounded-card bg-slate-950 border border-transparent transition-all duration-500 cursor-pointer overflow-hidden relative text-left shadow-2xl outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20",
            hoveredCard === 'term' ? "bg-primary-base text-white shadow-primary-base/40 -translate-y-2 scale-[1.05]" : "hover:bg-slate-900"
          )}
          onMouseEnter={() => setHoveredCard('term')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className={cn("size-4 transition-colors", hoveredCard === 'term' ? "text-white" : "text-primary-base")} />
            <span className={cn("text-[10px] font-black tracking-[0.15em]", hoveredCard === 'term' ? "text-white/70" : "text-primary-base/60")}>Срок</span>
          </div>
          <div className={cn("text-2xl font-black tracking-tighter tabular-nums", hoveredCard === 'term' ? "text-white" : "text-white")}>
            12 {pluralizeRU(12, "день", "дня", "дней")}
          </div>
          <div className={cn("mt-4 text-[9px] font-black tracking-[0.1em]", hoveredCard === 'term' ? "text-white/60" : "text-slate-500")}>Осталось до конца</div>
        </button>
      </div>

      <div className="absolute top-0 right-0 size-64 bg-primary-base/5 blur-[100px] rounded-full -z-10 group-hover:bg-primary-base/10 transition-colors duration-1000" />
    </div>
  );
}
