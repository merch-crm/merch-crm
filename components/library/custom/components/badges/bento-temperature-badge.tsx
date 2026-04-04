"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Thermometer, Snowflake } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoTemperatureBadgeProps {
  temperature: "hot" | "warm" | "cold";
  score: number;
  className?: string;
}

export function BentoTemperatureBadge({ 
  temperature, 
  score, 
  className 
}: BentoTemperatureBadgeProps) {
  const configs = {
    hot: { 
      icon: Flame, 
      color: "text-rose-600", 
      bg: "bg-rose-50", 
      border: "border-rose-100", 
      glow: "shadow-rose-100",
      label: "Hot"
    },
    warm: { 
      icon: Thermometer, 
      color: "text-amber-600", 
      bg: "bg-amber-50", 
      border: "border-amber-100", 
      glow: "shadow-amber-100",
      label: "Warm"
    },
    cold: { 
      icon: Snowflake, 
      color: "text-blue-600", 
      bg: "bg-blue-50", 
      border: "border-blue-100", 
      glow: "shadow-blue-100",
      label: "Cold"
    },
  };

  const config = configs[temperature];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={cn(
        "flex flex-col items-center gap-2 p-3 rounded-[27px] border transition-all cursor-default shadow-lg",
        config.bg,
        config.border,
        config.glow,
        className
      )}
    >
      <div className={cn("size-10 rounded-2xl flex items-center justify-center shadow-inner", config.bg, "brightness-95")}>
        <Icon className={cn("size-5", config.color)} />
      </div>
      <div className="text-center">
        <p className={cn("text-[11px] font-black   opacity-80", config.color)}>
          {config.label}
        </p>
        <p className="text-lg font-black text-gray-950 mt-0.5">{score}%</p>
      </div>
    </motion.div>
  );
}
