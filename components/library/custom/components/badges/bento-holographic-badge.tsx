"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoHolographicBadgeProps {
  label: string;
  className?: string;
}

export function BentoHolographicBadge({ 
  label, 
  className 
}: BentoHolographicBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: [-1, 1, -1] }}
      className={cn(
        "relative inline-flex items-center px-4 py-1.5 rounded-full",
        "bg-white cursor-pointer overflow-hidden group shadow-lg",
        className
      )}
    >
      {/* Holographic Glow Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer Line */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
      />
      
      <span className="relative z-10 text-xs font-black bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 bg-clip-text text-transparent  ">
        {label}
      </span>
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-full border border-white/50 pointer-events-none group-hover:border-transparent transition-colors" />
    </motion.div>
  );
}
