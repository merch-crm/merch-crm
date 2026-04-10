"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoGoalProgressProps {
  goalName: React.ReactNode;
  current: number;
  target: number;
  prefix?: React.ReactNode;
  className?: string;
}

export function BentoGoalProgress({ 
  goalName = "Цель по продажам", 
  current = 1250000, 
  target = 2000000, 
  prefix = "₽", 
  className 
}: BentoGoalProgressProps) {
  const percentage = Math.min(100, Math.round((current / target) * 100));

  return (
    <div
      className={cn(
        "relative bg-white text-slate-950 shadow-crm-md border border-slate-100 p-6 rounded-card group overflow-hidden transition-all hover:border-slate-200",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0FDF4] blur-[40px] rounded-full -mr-16 -mt-16 transition-colors" />
      
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg">
          <Target className="w-5 h-5" />
        </div>
        <Typo as="h3" className="font-black text-xs tracking-tight text-slate-400 leading-none">
          {goalName}
        </Typo>
      </div>
      
      <div className="flex items-end gap-2 mb-4 relative z-10">
        <Typo as="span" className="text-4xl font-black font-heading text-slate-950 tabular-nums leading-none">
          {prefix}{current.toLocaleString()}
        </Typo>
        <Typo as="span" className="text-slate-400 font-black text-xs mb-1.5 tracking-tight leading-none">
          / {prefix}{target.toLocaleString()}
        </Typo>
      </div>

      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", type: "spring", bounce: 0.2 }}
          className="absolute top-0 left-0 bottom-0 bg-emerald-500 rounded-full overflow-hidden"
        >
          {/* Shimmer effect */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          />
        </motion.div>
      </div>
      <Typo as="p" className="text-right text-xs font-black text-emerald-600 mt-2 tracking-tight leading-none">
        Выполнено на {percentage}%
      </Typo>
    </div>
  );
}
