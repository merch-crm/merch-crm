"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: "right" | "left" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl";
}

const sideVariants = {
  right: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    container: "right-0 inset-y-0 h-full",
    sizes: { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" }
  },
  left: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    container: "left-0 inset-y-0 h-full",
    sizes: { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" }
  },
  top: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
    container: "top-0 inset-x-0 w-full",
    sizes: { sm: "h-48", md: "h-64", lg: "h-96", xl: "h-[50vh]" }
  },
  bottom: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    container: "bottom-0 inset-x-0 w-full",
    sizes: { sm: "h-48", md: "h-64", lg: "h-96", xl: "h-[50vh]" }
  }
};

export function BentoSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  side = "right",
  size = "md"
}: BentoSheetProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isMounted) return null;

  const variants = sideVariants[side];

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[115]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-title"
        >
          <motion.button
            type="button"
            aria-label="Close sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-md transition-all duration-700 cursor-default outline-none"
          />
          
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "absolute bg-white shadow-2xl border-slate-100 flex flex-col overflow-hidden",
              variants.container,
              (variants.sizes as Record<string, string>)[size],
              side === "right" && "rounded-l-[40px] border-l",
              side === "left" && "rounded-r-[40px] border-r",
              side === "top" && "rounded-b-[40px] border-b",
              side === "bottom" && "rounded-t-[40px] border-t",
              className
            )}
          >
            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50">
              <div className="flex flex-col gap-1">
                {title && (
                  <h3 id="sheet-title" className="text-[11px] font-black text-slate-900 tracking-[0.2em] leading-none">
                    {title}
                  </h3>
                )}
                <span className="text-[11px] font-black text-slate-400 tracking-tight leading-none">
                  Детальный просмотр
                </span>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="size-10 rounded-element bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90 flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {children}
            </div>

            {/* Side handle visual hint */}
            <div className={cn(
              "absolute pointer-events-none opacity-20 flex items-center justify-center text-slate-300",
              side === "right" && "left-0 inset-y-0 w-8",
              side === "left" && "right-0 inset-y-0 w-8",
              side === "top" && "bottom-0 inset-x-0 h-8",
              side === "bottom" && "top-0 inset-x-0 h-8"
            )}>
              {side === "right" && <ChevronLeft className="size-6" />}
              {side === "left" && <ChevronRight className="size-6" />}
              {side === "top" && <div className="w-12 h-1 bg-slate-200 rounded-full" />}
              {side === "bottom" && <div className="w-12 h-1 bg-slate-200 rounded-full" />}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
