"use client";

import React from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoGoalProgressProps {
  goalName: string;
  current: number;
  target: number;
  prefix?: string;
  className?: string;
}

export function BentoGoalProgress({ goalName, current, target, prefix = "", className }: BentoGoalProgressProps) {
  const percentage = Math.min(100, Math.round((current / target) * 100));

  return (
    <div
      className={cn(
        "relative bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px]",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
          <Target className="w-5 h-5" />
        </div>
        <h3 className="font-semibold">{goalName}</h3>
      </div>
      
      <div className="flex items-end gap-2 mb-3">
        <span className="text-4xl font-black font-heading text-primary">{prefix}{current.toLocaleString()}</span>
        <span className="text-muted-foreground font-medium mb-1">/ {prefix}{target.toLocaleString()}</span>
      </div>

      <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", type: "spring", bounce: 0.2 }}
          className="absolute top-0 left-0 bottom-0 bg-primary rounded-full relative overflow-hidden"
        >
          {/* Shimmer effect */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        </motion.div>
      </div>
      <p className="text-right text-xs font-bold text-primary mt-2">{percentage}% Completed</p>
    </div>
  );
}
