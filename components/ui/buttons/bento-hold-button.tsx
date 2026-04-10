"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoHoldButtonProps {
  onConfirm: () => void;
  children: React.ReactNode;
  duration?: number;
  className?: string;
}

export function BentoHoldButton({ 
  onConfirm, 
  children, 
  duration = 1.5, 
  className 
}: BentoHoldButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startHold = () => {
    setIsHolding(true);
    // audit-ok: hydration (inside event handler)
    const start = Date.now();
    timerRef.current = setInterval(() => {
      // audit-ok: hydration
      const elapsed = (Date.now() - start) / 1000;
      const newProgress = (elapsed / duration) * 100;
      if (newProgress >= 100) {
        setProgress(100);
        if (timerRef.current) clearInterval(timerRef.current);
        onConfirm();
        setIsHolding(false);
      } else {
        setProgress(newProgress);
      }
    }, 10);
  };

  const endHold = () => {
    setIsHolding(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(0);
  };

  if (!isMounted) {
    return (
      <div className={cn("h-14 px-8 rounded-card bg-gray-100 animate-pulse w-40", className)} />
    );
  }

  return (
    <motion.button
      type="button"
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label="Hold to confirm"
      className={cn(
        "relative h-14 px-8 rounded-card font-black text-sm  ",
        "bg-rose-50 text-rose-600 border border-rose-100 shadow-sm overflow-hidden flex items-center justify-center gap-2",
        "transition-colors hover:bg-rose-100",
        className
      )}
    >
      <motion.div
        animate={{ width: `${progress}%` }}
        transition={{ ease: "linear", duration: 0.1 }}
        className="absolute left-0 top-0 bottom-0 bg-rose-200/50"
      />
      <span className="relative z-10 flex items-center gap-2">
        {isHolding ? "Keep holding..." : children}
      </span>
    </motion.button>
  );
}
