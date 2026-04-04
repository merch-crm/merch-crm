"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";

/**
 * BentoTimePicker - Компонент выбора времени
 */
export function BentoTimePicker() {
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(40);
  const [period, setPeriod] = useState<"AM" | "PM">("PM");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full max-w-[240px] h-[240px] bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse" />;

  const incrementHours = () => setHours(h => (h % 12) + 1);
  const decrementHours = () => setHours(h => (h - 2 + 12) % 12 + 1);
  const incrementMinutes = () => setMinutes(m => (m + 5) % 60);
  const decrementMinutes = () => setMinutes(m => (m - 5 + 60) % 60);

  const NumberCol = ({ value, label, onInc, onDec }: { value: number; label: string; onInc: () => void; onDec: () => void }) => (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[11px] font-black text-gray-400   mb-1">{label}</span>
      <button type="button" onClick={onInc} className="p-1 hover:bg-gray-100 rounded-lg transition-colors active:scale-90"><ChevronUp className="size-4 text-gray-400" /></button>
      <div className="size-16 bg-gray-950 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-gray-950/20 relative overflow-hidden group">
         <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
               key={value}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: -20, opacity: 0 }}
               transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
               className="inline-block"
            >
               {value.toString().padStart(2, '0')}
            </motion.span>
         </AnimatePresence>
         <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <button type="button" onClick={onDec} className="p-1 hover:bg-gray-100 rounded-lg transition-colors active:scale-90"><ChevronDown className="size-4 text-gray-400" /></button>
    </div>
  );

  return (
    <div className="w-full max-w-[240px] bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 relative group overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
         <Clock className="size-4 text-primary-base" />
         <h4 className="text-xs font-black text-gray-900   leading-none">Выбрать время</h4>
      </div>

      <div className="flex items-center justify-center gap-3 relative z-10">
         <NumberCol value={hours} label="Часы" onInc={incrementHours} onDec={decrementHours} />
         <div className="pt-8 text-2xl font-black text-gray-300">:</div>
         <NumberCol value={minutes} label="Минуты" onInc={incrementMinutes} onDec={decrementMinutes} />
      </div>

      <div className="mt-8 flex justify-center pt-6 border-t border-gray-50">
         <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
            <button 
               type="button"
               onClick={() => setPeriod("AM")}
               className={cn(
                  "px-4 py-2 text-xs font-black rounded-lg transition-all",
                  period === "AM" ? "bg-white text-gray-950 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
            >
               AM
            </button>
            <button 
               type="button"
               onClick={() => setPeriod("PM")}
               className={cn(
                  "px-4 py-2 text-xs font-black rounded-lg transition-all",
                  period === "PM" ? "bg-white text-gray-950 shadow-sm" : "text-gray-400 hover:text-gray-600"
               )}
            >
               PM
            </button>
         </div>
      </div>
      
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 size-32 bg-primary-base/5 rounded-full blur-2xl group-hover:bg-primary-base/10 transition-colors duration-700" />
    </div>
  );
}
