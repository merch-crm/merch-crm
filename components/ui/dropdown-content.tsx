"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DropdownContentProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  align?: "left" | "right" | "center";
  width?: string;
}

/**
 * Shared visual container for all dropdowns (Select, DatePicker, etc.)
 * Provides consistent:
 * - Glassmorphism (blur)
 * - Shadows (crm-xl)
 * - Rounding (12px)
 * - Spring animations
 */
const DropdownContent = ({
  children,
  className,
  isOpen,
  align = "left",
  width = "w-full",
}: DropdownContentProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 4, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={cn(
            "absolute z-50 min-w-[8rem] overflow-hidden rounded-[12px] border border-slate-200/50 bg-white/90 backdrop-blur-md p-1 text-slate-900 shadow-crm-xl ring-1 ring-black/[0.05]",
            width,
            align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { DropdownContent };
