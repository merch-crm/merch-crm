"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoMetricHeroProps {
  title: React.ReactNode;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
}

export function BentoMetricHero({ 
  title = "Общая выручка", 
  value = "₽24.8M", 
  subtitle = "За текущий квартал", 
  className 
}: BentoMetricHeroProps) {
  return (
    <motion.div
      whileHover={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden bg-slate-950 text-white shadow-crm-xl border border-slate-800 p-6 md:p-8 rounded-card flex flex-col justify-end min-h-[240px] group",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 blur-[80px] rounded-full -mr-20 -mt-20 group-hover:bg-slate-800/30 transition-colors" />
      
      <div className="relative z-10">
        <Typo as="h4" className="text-xs font-black tracking-tight text-slate-400 mb-2 leading-none">
          {title}
        </Typo>
        <Typo as="h2" className="text-6xl font-black mb-4 tabular-nums tracking-tighter leading-none italic">
          {value}
        </Typo>
        {subtitle && (
          <Typo as="span" className="text-xs font-black tracking-tight text-slate-300 bg-white/5 backdrop-blur-md inline-block px-4 py-1.5 rounded-full border border-white/10 leading-none">
            {subtitle}
          </Typo>
        )}
      </div>
    </motion.div>
  );
}
