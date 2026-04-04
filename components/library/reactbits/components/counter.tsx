"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, Hash, Activity } from "lucide-react";
import { cn } from "../utils/cn";

interface CounterProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  className?: string;
  label?: string;
}

export const Counter = ({
  initialValue = 0,
  min = -Infinity,
  max = Infinity,
  onChange,
  className = "",
  label = "Metric Multiplier",
}: CounterProps) => {
  const [count, setCount] = useState(initialValue);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const update = (delta: number) => {
    const nextValue = count + delta;
    if (nextValue < min || nextValue > max) return;
    
    setDirection(delta > 0 ? 1 : -1);
    setCount(nextValue);
    onChange?.(nextValue);
  };

  if (!isMounted) {
    return (
      <div className="w-48 h-16 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-3 px-2">
         <Hash className="size-3 text-slate-300" />
         <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      </div>
      
      <div className="flex items-center bg-white rounded-[2rem] border border-slate-100 shadow-premium p-2 h-20 group/counter focus-within:ring-4 focus-within:ring-primary-base/5 transition-all">
        <button
          type="button"
          onClick={() => update(-1)}
          disabled={count <= min}
          aria-label="Decrement value"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-950 hover:text-white disabled:opacity-20 active:scale-90"
        >
          <Minus className="size-6 stroke-[3px]" />
        </button>
        
        <div className="relative flex-1 h-full overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={count}
              initial={{ y: direction * 40, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: direction * -40, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="flex flex-col items-center">
                 <span className="text-xl font-black text-slate-950 tabular-nums tracking-tighter">
                   {count.toString().padStart(2, '0')}
                 </span>
                 <div className="flex items-center gap-1.5">
                    <Activity className="size-2 text-primary-base animate-pulse" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Scale</span>
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => update(1)}
          disabled={count >= max}
          aria-label="Increment value"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-950 hover:text-white disabled:opacity-20 active:scale-90"
        >
          <Plus className="size-6 stroke-[3px]" />
        </button>
      </div>
    </div>
  );
};
