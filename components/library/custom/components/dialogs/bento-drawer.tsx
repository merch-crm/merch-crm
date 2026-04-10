"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GripHorizontal } from "lucide-react";
import { cn } from "../../utils/cn";
import { BentoOverlay } from "../../ui/bento-primitives";

interface BentoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: "bottom" | "right" | "left";
}

const sideVariants = {
  bottom: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    container: "bottom-0 inset-x-0 max-h-[85vh] rounded-t-[3rem]",
    drag: "y",
    handle: <GripHorizontal className="size-6 text-slate-300" />
  },
  right: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
    container: "right-0 inset-y-0 w-full max-w-md rounded-l-[3rem]",
    drag: "x",
    handle: <div className="w-1 h-12 bg-slate-200 rounded-full" />
  },
  left: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
    container: "left-0 inset-y-0 w-full max-w-md rounded-r-[3rem]",
    drag: "x",
    handle: <div className="w-1 h-12 bg-slate-200 rounded-full" />
  }
};

export function BentoDrawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className,
  side = "bottom"
}: BentoDrawerProps) {
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
          className="fixed inset-0 z-[110]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
        >
          <BentoOverlay 
            aria-label="Close drawer"
            onClick={onClose}
          />
          
          <motion.div
            drag={variants.drag as "x" | "y"}
            dragConstraints={side === "bottom" ? { top: 0 } : { left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (side === "bottom" && info.offset.y > 100) onClose();
              if (side === "right" && info.offset.x > 100) onClose();
              if (side === "left" && info.offset.x < -100) onClose();
            }}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "absolute bg-white shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)] border-slate-100 flex flex-col overflow-hidden",
              variants.container,
              className
            )}
          >
            {/* Drag Handle */}
            <div className="h-10 flex items-center justify-center cursor-grab active:cursor-grabbing">
              {variants.handle}
            </div>

            {/* Header */}
            <div className="px-8 py-5 flex items-center justify-between border-b border-slate-50">
              {title && (
                <h3 id="drawer-title" className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
                  {title}
                </h3>
              )}
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {children}
            </div>
            
            {/* Bottom Glow */}
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-50/50 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
