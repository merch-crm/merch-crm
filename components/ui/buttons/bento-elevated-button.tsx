"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoElevatedButtonProps extends Omit<HTMLMotionProps<"button">, "onDrag"> {
  children: React.ReactNode;
}

export function BentoElevatedButton({ 
  children, 
  className, 
  ...props 
}: BentoElevatedButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ 
        y: -4,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 20px rgba(0,0,0,0.05)"
      }}
      whileTap={{ y: 0, scale: 0.98 }}
      className={cn(
        "h-14 px-8 rounded-card font-bold text-sm ",
        "bg-white border border-gray-100 text-gray-900 shadow-crm-md",
        "transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
