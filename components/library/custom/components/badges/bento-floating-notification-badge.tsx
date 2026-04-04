"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoFloatingNotificationBadgeProps {
  children: React.ReactNode;
  count: number;
  color?: string;
  className?: string;
}

export function BentoFloatingNotificationBadge({ 
  children, 
  count, 
  color = "bg-rose-500", 
  className 
}: BentoFloatingNotificationBadgeProps) {
  return (
    <div className={cn("relative inline-flex group cursor-pointer", className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="size-14 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center p-2 group-hover:bg-secondary transition-colors"
      >
        {children}
      </motion.div>
      
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.2 }}
            className={cn(
              "absolute -top-2.5 -right-2.5 min-w-[24px] h-6 px-1.5 rounded-full",
              "flex items-center justify-center border-4 border-white shadow-md",
              "text-white text-[11px] font-black pointer-events-auto",
              color
            )}
          >
            {count > 99 ? "99+" : count}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
