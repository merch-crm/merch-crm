"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

const sideVariants = {
  top: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
    classes: "bottom-full mb-3",
    arrow: "bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45 border-b border-r"
  },
  bottom: {
    initial: { opacity: 0, scale: 0.95, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -10 },
    classes: "top-full mt-3",
    arrow: "top-[-4px] left-1/2 -translate-x-1/2 rotate-45 border-t border-l"
  },
  left: {
    initial: { opacity: 0, scale: 0.95, x: 10 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.95, x: 10 },
    classes: "right-full mr-3",
    arrow: "right-[-4px] top-1/2 -translate-y-1/2 rotate-45 border-t border-r"
  },
  right: {
    initial: { opacity: 0, scale: 0.95, x: -10 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.95, x: -10 },
    classes: "left-full ml-3",
    arrow: "left-[-4px] top-1/2 -translate-y-1/2 rotate-45 border-b border-l"
  }
};

export function BentoPopover({ 
  trigger, 
  children, 
  className,
  side = "bottom",
  align: _align = "center"
}: BentoPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isMounted) return <div className="inline-flex">{trigger}</div>;

  const variants = sideVariants[side];

  return (
    <div className="relative inline-flex flex-col items-center" ref={popoverRef}>
      <button 
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)} 
        className="cursor-pointer active:scale-95 transition-transform bg-transparent border-none p-0 appearance-none outline-none focus-visible:ring-2 focus-visible:ring-primary-base rounded-xl"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "absolute z-[120] min-w-[220px] bg-white rounded-card border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-5 overflow-visible",
              variants.classes,
              className
            )}
            role="tooltip"
          >
            <div className="relative z-10 text-[11px] font-black text-slate-900 tracking-tight leading-relaxed">
              {children}
            </div>
            
            {/* Arrow */}
            <div className={cn(
              "absolute size-2 bg-white border-slate-100 -z-10",
              variants.arrow
            )} />
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-50 rounded-card" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
