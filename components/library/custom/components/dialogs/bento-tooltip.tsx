"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

const sideVariants = {
  top: {
    initial: { opacity: 0, scale: 0.8, y: 5 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: 5 },
    classes: "bottom-full mb-2 items-center flex-col-reverse",
    arrow: "bottom-[-3px] left-1/2 -translate-x-1/2 rotate-45"
  },
  bottom: {
    initial: { opacity: 0, scale: 0.8, y: -5 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -5 },
    classes: "top-full mt-2 items-center flex-col",
    arrow: "top-[-3px] left-1/2 -translate-x-1/2 rotate-45"
  },
  left: {
    initial: { opacity: 0, scale: 0.8, x: 5 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.8, x: 5 },
    classes: "right-full mr-2 items-center flex-row-reverse",
    arrow: "right-[-3px] top-1/2 -translate-y-1/2 rotate-45"
  },
  right: {
    initial: { opacity: 0, scale: 0.8, x: -5 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 0.8, x: -5 },
    classes: "left-full ml-2 items-center flex-row",
    arrow: "left-[-3px] top-1/2 -translate-y-1/2 rotate-45"
  }
};

export function BentoTooltip({ 
  content, 
  children, 
  className,
  side = "top"
}: BentoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const variants = sideVariants[side];

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: "spring", damping: 15, stiffness: 400 }}
            className={cn(
              "absolute z-[150] flex pointer-events-none",
              variants.classes
            )}
          >
            <div className={cn(
              "bg-gray-900 text-white px-3 py-1.5 rounded-xl text-[11px] font-black   whitespace-nowrap shadow-xl border border-white/10 backdrop-blur-md",
              className
            )}>
              {content}
            </div>
            {/* Arrow */}
            <div className={cn(
              "size-1.5 bg-gray-900 border-inherit",
              variants.arrow
            )} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
