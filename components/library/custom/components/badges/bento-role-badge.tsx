"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoRoleBadgeProps {
  role: string;
  initials: string;
  color?: "blue" | "emerald" | "amber" | "rose" | "purple";
  className?: string;
}

export function BentoRoleBadge({ 
  role, 
  initials, 
  color = "blue", 
  className 
}: BentoRoleBadgeProps) {
  const colorMaps = {
    blue: "from-blue-400 to-indigo-600",
    emerald: "from-emerald-400 to-teal-600",
    amber: "from-amber-400 to-orange-600",
    rose: "from-rose-400 to-red-600",
    purple: "from-purple-400 to-violet-600",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-2.5 p-1 pr-4 rounded-full",
        "bg-white ring-1 ring-gray-100 shadow-sm transition-shadow",
        "hover:shadow-md cursor-pointer",
        className
      )}
    >
      <div className={cn(
        "size-7 rounded-full flex items-center justify-center shadow-inner",
        "bg-gradient-to-br",
        colorMaps[color]
      )}>
        <span className="text-[11px] font-black text-white  ">
          {initials}
        </span>
      </div>
      <span className="text-xs font-bold text-gray-950 whitespace-nowrap">
        {role}
      </span>
    </motion.div>
  );
}
