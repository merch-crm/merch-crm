"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoInteractiveTagProps {
  label: string;
  onDismiss?: () => void;
  className?: string;
}

export function BentoInteractiveTag({ 
  label, 
  onDismiss, 
  className 
}: BentoInteractiveTagProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl transition-all cursor-default group",
        "bg-blue-50 text-blue-700 ring-1 ring-blue-100 hover:ring-blue-200 hover:bg-blue-100/50",
        className
      )}
    >
      <span className="text-xs font-bold leading-none">{label}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className={cn(
            "size-5 rounded-lg flex items-center justify-center transition-all",
            "bg-blue-100/50 text-blue-400 hover:bg-blue-200 hover:text-blue-700 hover:scale-110 active:scale-90"
          )}
        >
          <X className="size-3 stroke-[3]" />
        </button>
      )}

    </motion.div>
  );
}
