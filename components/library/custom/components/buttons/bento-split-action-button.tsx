"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

interface BentoSplitActionButtonProps {
  label: string;
  onClick?: () => void;
  options?: { label: string; onClick: () => void }[];
  className?: string;
}

export function BentoSplitActionButton({ 
  label, 
  onClick, 
  options = [], 
  className 
}: BentoSplitActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className={cn("inline-flex h-14 rounded-[27px] bg-gray-100 animate-pulse w-40", className)} />
    );
  }

  return (
    <div className={cn("inline-flex h-14 rounded-[27px] bg-primary shadow-crm-md relative", className)}>
      <motion.button
        type="button"
        whileHover={{ backgroundColor: "rgb(var(--primary-hover) / 1)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="flex-1 px-6 text-primary-foreground font-bold text-sm  border-r border-primary-foreground/10"
      >
        {label}
      </motion.button>
      
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Toggle extra options"
        className="w-14 h-full flex items-center justify-center text-primary-foreground rounded-r-[27px] hover:bg-primary-foreground/10 transition-colors"
      >
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 shadow-2xl rounded-2xl z-50 overflow-hidden"
          >
            {options.map((opt, i) => (
              <button
                type="button"
                key={i}
                onClick={() => { opt.onClick(); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left text-sm font-semibold hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-xl transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
