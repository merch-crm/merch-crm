"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoToggleProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function BentoToggle({ 
  label, 
  checked = false, 
  onChange, 
  className 
}: BentoToggleProps) {
  const [isOn, setIsOn] = useState(checked);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggle = () => {
    const isNextOn = !isOn;
    setIsOn(isNextOn);
    onChange?.(isNextOn);
  };

  if (!isMounted) {
    return (
      <div className="w-24 h-10 rounded-full bg-slate-50 animate-pulse border border-slate-100" />
    );
  }

  return (
    <div className={cn("flex items-center justify-between gap-4 py-3 px-4 rounded-card bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md", className)}>
      {label && (
        <span className="text-[11px] font-black text-slate-400 tracking-[0.2em] pl-1 leading-none">
          {label}
        </span>
      )}
      
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={isOn}
        aria-label={label ? `Toggle ${label}` : "System Toggle"}
        className={cn(
          "relative w-16 h-9 rounded-full p-1.5 transition-all duration-700 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10",
          isOn 
            ? "bg-slate-950 shadow-xl shadow-black/10" 
            : "bg-slate-50 border border-slate-100"
        )}
      >
        <motion.div
          animate={{
            x: isOn ? 28 : 0,
            scale: isOn ? 1.05 : 1,
            backgroundColor: isOn ? "#ffffff" : "#cbd5e1"
          }}
          className={cn(
            "size-6 rounded-full shadow-premium transition-all duration-500",
            isOn ? "bg-white" : "bg-slate-300"
          )}
        >
          {isOn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="size-1.5 rounded-full bg-slate-950" />
            </motion.div>
          )}
        </motion.div>
        
        <AnimatePresence>
          {isOn && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-0 bg-slate-400/10 rounded-full blur-xl -z-10"
            />
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
