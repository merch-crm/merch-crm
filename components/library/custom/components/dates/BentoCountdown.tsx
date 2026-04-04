"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Bell, ChevronRight } from "lucide-react";
import { cn } from "@/components/library/custom/utils/cn";
import { addDays } from "date-fns";

/**
 * BentoCountdown - Таймер обратного отсчета для дедлайнов
 */
export function BentoCountdown({ deadline: propDeadline }: { deadline?: Date }) {
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  useEffect(() => {
    setIsMounted(true);
    if (propDeadline) {
      setDeadline(propDeadline);
    } else {
      // audit-ok: hydration (inside useEffect)
      setDeadline(addDays(new Date(), 12.5));
    }
  }, [propDeadline]);

  useEffect(() => {
    if (!isMounted || !deadline) return;

    const calculateTimeLeft = () => {
      // audit-ok: hydration
      const now = new Date().getTime();
      const target = deadline.getTime();
      const diff = target - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [deadline, isMounted]);

  if (!isMounted || !deadline) {
    return (
      <div className="w-full max-w-[320px] h-[320px] bg-white rounded-[2rem] border border-gray-100 shadow-sm animate-pulse" />
    );
  }

  const TimeUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="size-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center relative overflow-hidden group/unit">
         <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
               key={value}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: -20, opacity: 0 }}
               transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 25 }}
               className="text-xl font-black text-gray-900 z-10"
            >
               {value.toString().padStart(2, '0')}
            </motion.span>
         </AnimatePresence>
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover/unit:opacity-100 transition-opacity" />
      </div>
      <span className="text-[11px] font-black text-gray-400  ">{label}</span>
    </div>
  );

  return (
    <div className="w-full max-w-[320px] bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 relative group overflow-hidden">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-2">
            <Timer className="size-4 text-indigo-600" />
            <h4 className="text-xs font-black text-gray-900   leading-none">До релиза</h4>
         </div>
         <div className="size-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Bell className="size-4" />
         </div>
      </div>

      <div className="flex items-center justify-between relative z-10">
         <TimeUnit value={timeLeft.days} label="Дни" />
         <div className="mb-4 text-xl font-black text-gray-200">:</div>
         <TimeUnit value={timeLeft.hours} label="Часы" />
         <div className="mb-4 text-xl font-black text-gray-200">:</div>
         <TimeUnit value={timeLeft.minutes} label="Мин" />
         <div className="mb-4 text-xl font-black text-gray-200">:</div>
         <TimeUnit value={timeLeft.seconds} label="Сек" />
      </div>

      <motion.button 
         type="button"
         className="w-full mt-8 flex items-center justify-between p-4 bg-gray-900 rounded-2xl text-white group/btn overflow-hidden relative"
      >
         <div className="relative z-10 flex items-center gap-2">
            <span className="text-[11px] font-black  ">Открыть детали проекта</span>
         </div>
         <ChevronRight className="size-4 relative z-10 text-white/50 group-hover/btn:text-white transition-colors" />
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-900 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
      </motion.button>
      
      {/* Decorative Blob */}
      <div className="absolute -bottom-10 -right-10 size-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-700" />
    </div>
  );
}
