"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BentoSidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  className?: string;
  isCollapsed?: boolean;
}

export function BentoSidebarItem({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick, 
  badge, 
  className,
  isCollapsed = false
}: BentoSidebarItemProps) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-between w-full h-12 px-4 rounded-element transition-all group overflow-hidden",
        active ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        className
      )}
    >
      {/* Active Glow Effect */}
      {active && (
        <motion.div
          layoutId="sidebarActive"
          className="absolute inset-0 bg-primary -z-10"
        />
      )}
      
      <div className="flex items-center gap-3">
        <Icon className={cn("size-5", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors")} />
        
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sm font-bold truncate"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {badge && !isCollapsed && (
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-black",
          active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
        )}>
          {badge}
        </span>
      )}
      
      {/* Active indicator dot on collapse */}
      {isCollapsed && active && (
        <div className="absolute top-2 right-2 size-1.5 bg-primary-foreground rounded-full" />
      )}
    </motion.button>
  );
}
