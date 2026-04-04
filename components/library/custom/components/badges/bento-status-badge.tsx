"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoStatusBadgeProps {
  status?: "active" | "away" | "busy" | "offline";
  label: string;
  className?: string;
}

export function BentoStatusBadge({ 
  status = "active", 
  label, 
  className 
}: BentoStatusBadgeProps) {
  const colors = {
    active: "bg-emerald-500",
    away: "bg-amber-500",
    busy: "bg-rose-500",
    offline: "bg-gray-400",
  };

  const bgColors = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-500/20",
    away: "bg-amber-50 text-amber-700 ring-amber-500/20",
    busy: "bg-rose-50 text-rose-700 ring-rose-500/20",
    offline: "bg-gray-50 text-gray-600 ring-gray-400/20",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 shadow-sm transition-all cursor-default",
        bgColors[status],
        className
      )}
    >
      <span className="relative flex size-2">
        <motion.span
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", colors[status])}
        />
        <span className={cn("relative inline-flex rounded-full size-2", colors[status])} />
      </span>
      <span className="text-[11px] font-black  ">{label}</span>
    </motion.div>
  );
}
