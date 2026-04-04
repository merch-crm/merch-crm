"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoKbdBadgeProps {
  label: string;
  className?: string;
  subLabel?: string;
}

export function BentoKbdBadge({ 
  label, 
  className, 
  subLabel 
}: BentoKbdBadgeProps) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {subLabel && (
        <span className="text-[11px] font-black   text-muted-foreground">
          {subLabel}
        </span>
      )}
      <motion.kbd
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95, y: 1 }}
        className={cn(
          "h-10 min-w-10 px-3 rounded-xl",
          "bg-white border-2 border-gray-100 shadow-[0_4px_0_rgb(229,231,235)]",
          "flex items-center justify-center font-sans font-black text-gray-950",
          "transition-all cursor-default"
        )}
      >
        {label}
      </motion.kbd>
    </div>
  );
}
