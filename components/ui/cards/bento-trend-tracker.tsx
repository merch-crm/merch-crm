"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoTrendTrackerProps {
  label: React.ReactNode;
  value: React.ReactNode;
  trend: "up" | "down";
  trendValue: React.ReactNode;
  className?: string;
}

export function BentoTrendTracker({ label, value, trend, trendValue, className }: BentoTrendTrackerProps) {
  const isUp = trend === "up";

  return (
    <div
      className={cn(
        "relative bg-white text-slate-950 shadow-crm-md border border-slate-100 p-6 rounded-card flex flex-col justify-between group overflow-hidden transition-all hover:border-slate-200",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/5 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:bg-slate-900/10 transition-colors" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="relative z-10">
          <Typo as="p" className="text-xs font-black tracking-tight text-slate-400 mb-1.5 leading-none">{label}</Typo>
          <Typo as="h3" className="text-4xl font-black font-heading tabular-nums leading-none">{value}</Typo>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
          isUp ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
        )}>
          {isUp ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
        </div>
      </div>
      
      <div className="bg-slate-50/80 backdrop-blur-sm p-4 rounded-xl flex items-center gap-3 border border-slate-100/50">
        <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: isUp ? "75%" : "35%" }}
            transition={{ duration: 1, type: "spring", bounce: 0.2 }}
            className={cn("h-full rounded-full", isUp ? "bg-emerald-500" : "bg-rose-500")}
          />
        </div>
        <Typo as="span" className={cn("text-xs font-black tabular-nums tracking-tight", isUp ? "text-emerald-600" : "text-rose-600")}>
          {isUp ? "+" : "-"}{trendValue}
        </Typo>
      </div>
    </div>
  );
}
