"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoNumberStepperProps {
  label?: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  step?: number;
  unit?: string;
  onChange?: (value: number) => void;
  className?: string;
}

export function BentoNumberStepper({ 
  label = "Quantity", 
  min = 1, 
  max = 99, 
  defaultValue = 1, 
  step = 1, 
  unit = "Items", 
  onChange, 
  className 
}: BentoNumberStepperProps) {
  const [value, setValue] = useState(defaultValue);
  const [direction, setDirection] = useState(0); // 1 for up, -1 for down

  const updateValue = (delta: number) => {
    const newValue = Math.min(Math.max(value + delta, min), max);
    if (newValue !== value) {
      setDirection(delta > 0 ? 1 : -1);
      setValue(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <div className={cn("inline-flex flex-col gap-3 p-6 bg-white rounded-card border border-slate-200 shadow-sm", className)}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex flex-col">
          <label className="text-[11px] font-black text-slate-400 pl-1 leading-none mb-1">
            {label}
          </label>
          <div className="flex items-baseline gap-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={value}
                initial={{ y: direction === 1 ? 10 : -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: direction === 1 ? -10 : 10, opacity: 0 }}
                className="text-3xl font-black text-slate-900"
              >
                {value}
              </motion.span>
            </AnimatePresence>
            <span className="text-[11px] font-black text-slate-400 leading-none">
              {unit}
            </span>
          </div>
        </div>
        <div className="size-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors border border-slate-100">
          <Settings className="size-5" />
        </div>
      </div>

      <div className="flex items-center p-1 bg-[#F1F5F9] rounded-element border border-slate-200 shadow-inner">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, x: -5 }}
          onClick={() => updateValue(-step)}
          disabled={value <= min}
          className="size-12 rounded-xl flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <Minus className="size-5" />
        </motion.button>
        
        <div className="flex-1 px-4 flex justify-center">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: i === 2 ? 8 : 4,
                  opacity: i === 2 ? 1 : 0.3,
                  scale: i === 2 ? 1.2 : 1,
                }}
                className="w-1.5 rounded-full bg-primary-base"
              />
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, x: 5 }}
          onClick={() => updateValue(step)}
          disabled={value >= max}
          className="size-12 rounded-xl flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          <Plus className="size-5" />
        </motion.button>
      </div>
    </div>
  );
}
