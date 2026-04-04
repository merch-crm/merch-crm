"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import { LucideIcon } from "lucide-react";

interface BentoPillBadgeProps {
  label: string;
  icon?: LucideIcon;
  count?: number;
  className?: string;
}

export function BentoPillBadge({ 
  label, 
  icon: Icon, 
  count, 
  className 
}: BentoPillBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
        "bg-white border border-gray-100 shadow-sm transition-all cursor-default",
        "hover:shadow-md hover:border-gray-200",
        className
      )}
    >
      {Icon && <Icon className="size-3.5 text-gray-500" />}
      <span className="text-xs font-bold text-gray-900">{label}</span>
      {count !== undefined && (
        <span className="size-5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-black flex items-center justify-center border border-blue-100">
          {count}
        </span>
      )}
    </motion.div>
  );
}
