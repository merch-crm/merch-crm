"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoMiniSparklineProps {
  title: React.ReactNode;
  value: React.ReactNode;
  trend: "up" | "down" | "neutral";
  percentage: React.ReactNode;
  className?: string;
}

export function BentoMiniSparkline({ title, value, trend, percentage, className }: BentoMiniSparklineProps) {
  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-md border border-border p-5 rounded-card flex items-center justify-between",
        className
      )}
    >
      <div>
        <Typo as="p" className="text-xs font-semibold text-muted-foreground mb-1 uppercase">{title}</Typo>
        <Typo as="h4" className="text-3xl font-black font-heading tabular-nums">{value}</Typo>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className={cn(
          "px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-0.5",
          isUp ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : 
          isDown ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : 
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
        )}>
          {isUp ? "+" : isDown ? "-" : ""}
          <Typo as="span" className="tabular-nums">{percentage}</Typo>
        </div>
        {/* Fake sparkline using a simple SVG curve */}
        <div className="w-16 h-8 opacity-60">
          <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d={isUp ? "M0,40 Q25,10 50,30 T100,5" : isDown ? "M0,10 Q25,40 50,20 T100,45" : "M0,25 Q50,25 100,25"}
              fill="none"
              stroke={isUp ? "#10b981" : isDown ? "#ef4444" : "#9ca3af"}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
