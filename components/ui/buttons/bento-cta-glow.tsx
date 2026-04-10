"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCtaGlowProps extends Omit<HTMLMotionProps<"button">, "onDrag"> {
  children: React.ReactNode;
  glowColor?: string;
}

export function BentoCtaGlow({ 
  children, 
  glowColor = "rgba(16, 185, 129, 0.4)", 
  className, 
  ...props 
}: BentoCtaGlowProps) {
  return (
    <div className="relative group">
      {/* Pulse Glow Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
        className="absolute inset-0 blur-2xl rounded-full pointer-events-none group-hover:blur-3xl transition-all duration-500"
        style={{ backgroundColor: glowColor }}
      />
      
      <motion.button
        type="button"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative h-14 px-8 rounded-card font-black text-sm  ",
          "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20",
          "hover:bg-emerald-400 transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    </div>
  );
}
