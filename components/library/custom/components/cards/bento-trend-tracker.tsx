"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoTrendTrackerProps {
  label: string;
  value: string;
  trend: "up" | "down";
  trendValue: string;
  className?: string;
}

export function BentoTrendTracker({ label, value, trend, trendValue, className }: BentoTrendTrackerProps) {
  const isUp = trend === "up";

  return (
    <div
      className={cn(
        "relative bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px] flex flex-col justify-between group",
        className
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">{label}</p>
          <h3 className="text-4xl font-black font-heading">{value}</h3>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
          isUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        )}>
          {isUp ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
        </div>
      </div>
      
      <div className="bg-secondary/40 p-3 rounded-xl flex items-center gap-3">
        <div className="flex-1 bg-background h-2 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: isUp ? "75%" : "35%" }}
            transition={{ duration: 1, type: "spring" }}
            className={cn("h-full rounded-full", isUp ? "bg-green-500" : "bg-red-500")}
          />
        </div>
        <span className={cn("text-sm font-bold", isUp ? "text-green-600" : "text-red-600")}>
          {isUp ? "+" : "-"}{trendValue}
        </span>
      </div>
    </div>
  );
}
