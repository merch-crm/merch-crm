"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoSpringButtonProps extends Omit<HTMLMotionProps<"button">, "onDrag"> {
  children: React.ReactNode;
  variant?: "primary" | "solid" | "accent";
}

export function BentoSpringButton({ 
  children, 
  variant = "primary",
  className, 
  ...props 
}: BentoSpringButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary": return "bg-primary text-primary-foreground";
      case "accent": return "bg-emerald-500 text-white";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <motion.button
      type="button"
      whileHover={{ 
        scale: 1.05, 
        y: -4,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
      }}
      whileTap={{ scale: 0.95, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }}
      className={cn(
        "h-14 px-8 rounded-[27px] font-bold text-sm ",
        "flex items-center justify-center gap-2",
        "shadow-crm-md transition-shadow",
        getVariantStyles(),
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
