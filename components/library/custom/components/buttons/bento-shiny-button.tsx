"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoShinyButtonProps extends Omit<HTMLMotionProps<"button">, "onDrag"> {
  children: React.ReactNode;
  shimmerColor?: string;
  duration?: number;
}

export function BentoShinyButton({ 
  children, 
  className, 
  shimmerColor = "rgba(255, 255, 255, 0.15)", 
  duration = 2.5,
  ...props 
}: BentoShinyButtonProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden bg-gray-950 text-white font-black ",
        "h-14 px-8 rounded-[27px] border border-white/10 shadow-crm-md",
        "group cursor-pointer",
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
      
      {/* Shimmer Effect */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "200%" }}
        transition={{
          repeat: Infinity,
          duration: duration,
          ease: "linear",
          repeatDelay: 0.5,
        }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
        }}
      />
      
      {/* Hover background glow */}
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.button>
  );
}
