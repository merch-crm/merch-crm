"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoGlassButtonProps extends Omit<HTMLMotionProps<"button">, "onDrag"> {
  children: React.ReactNode;
}

export function BentoGlassButton({ 
  children, 
  className, 
  ...props 
}: BentoGlassButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "h-14 px-8 rounded-[27px] font-bold text-sm ",
        "bg-white/20 backdrop-blur-2xl border border-white/50",
        "text-gray-900 shadow-xl shadow-gray-200/50",
        "hover:bg-white/30 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
