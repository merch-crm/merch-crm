"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoStatusTimelineBadgeProps {
  status?: "pending" | "current" | "completed";
  label: string;
  className?: string;
}

export function BentoStatusTimelineBadge({ 
  status = "pending", 
  label, 
  className 
}: BentoStatusTimelineBadgeProps) {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <motion.div
        whileHover={{ scale: 1.2, rotate: isCurrent ? [0, 5, -5, 0] : 0 }}
        className={cn(
          "size-6 rounded-full border-4 transition-colors",
          isCompleted ? "bg-emerald-500 border-emerald-100" :
          isCurrent ? "bg-white border-blue-500" :
          "bg-gray-100 border-gray-200"
        )}
      >
        {isCurrent && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="size-full rounded-full bg-blue-500/20"
          />
        )}
      </motion.div>
      <span className={cn(
        "text-[11px] font-black   text-center",
        isCompleted ? "text-emerald-600" :
        isCurrent ? "text-blue-600" :
        "text-gray-400"
      )}>
        {label}
      </span>
    </div>
  );
}
