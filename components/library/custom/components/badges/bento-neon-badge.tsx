"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoNeonBadgeProps {
  label: string;
  color?: string;
  className?: string;
}

export function BentoNeonBadge({ 
  label, 
  color = "#8b5cf6", 
  className 
}: BentoNeonBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={cn(
        "relative inline-flex items-center px-4 py-1.5 rounded-full bg-gray-950 text-white overflow-hidden group",
        className
      )}
    >
      <div 
        className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity blur-md"
        style={{ backgroundColor: color }}
      />
      <div 
        className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      <span className="relative z-10 text-[11px] font-black  tracking-[0.2em]">{label}</span>
    </motion.div>
  );
}
