"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoTargetTrackerProps {
  className?: string;
  target?: number;
  current?: number;
  title?: string;
}

export function BentoTargetTracker({ 
  className,
  target = 500000,
  current = 428500,
  title = "Цель по выручке за Q3"
}: BentoTargetTrackerProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const remaining = target - current;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      className={cn(
        "relative overflow-hidden bg-primary-base text-white shadow-crm-lg flex flex-col justify-between group",
        "rounded-card", // Matching extreme radius
        className
      )}
    >
      {/* Massive cropped typography (The radical element) */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 0.15 }}
        transition={{ delay: 0.2, type: "spring", duration: 1.5 }}
        className="absolute -top-10 -right-10 pointer-events-none select-none"
      >
        <span className="text-[180px] font-black leading-none ">
          {percentage.toFixed(0)}<span className="text-[100px]">%</span>
        </span>
      </motion.div>

      {/* Asymmetric 90/10 Layout Header */}
      <div className="relative z-10 p-6 flex justify-between items-start w-full">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/20 backdrop-blur-md rounded-full mb-4">
            <Target size={14} className="text-white" />
            <span className="text-[11px] font-black tracking-tight text-white/90">{title}</span>

          </div>
          
          <div className="flex items-end gap-x-3 gap-y-1 flex-wrap">
            <h2 className="text-4xl md:text-5xl font-extrabold tabular-nums">
              ${(current / 1000).toFixed(1)}k
            </h2>
            <span className="text-white/60 text-lg font-medium mb-1 tabular-nums">
              / ${(target / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
        
        {/* The 10% extreme right utility block */}
        <div className="shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center bg-white/10 backdrop-blur-sm">
          <TrendingUp size={20} className="text-white" />
        </div>
      </div>

      {/* 90/10 Footer with Progress line */}
      <div className="relative z-10 p-6 mt-auto">
        <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col items-start text-left">
            <span className="text-[11px] font-bold text-white/70 tracking-tighter">Текущий темп</span>
            <span className="text-lg font-black tracking-tighter text-white">+12.4% vs прошлый Q</span>

          </div>
          
          <div className="text-right flex flex-col items-end">
            <span className="text-[11px] font-bold text-white/50 tracking-tighter">Осталось</span>
            <div className="text-sm font-black tracking-tighter text-white tabular-nums">${(remaining / 1000).toFixed(1)}k</div>

          </div>
        </div>

        {/* Minimal Progress Bar without rounded corners to contrast the outer card */}
        <div className="h-1.5 w-full bg-black/20 overflow-hidden mt-2 relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="absolute top-0 left-0 bottom-0 bg-white"
          />
        </div>
      </div>
      
      {/* Decorative inner glow */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}
