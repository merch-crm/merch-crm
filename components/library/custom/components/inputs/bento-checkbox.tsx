"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Fingerprint } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoCheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
  description?: string;
}

export function BentoCheckbox({ 
  label, 
  checked = false, 
  onChange, 
  className,
  description 
}: BentoCheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggle = () => {
    const isNextChecked = !isChecked;
    setIsChecked(isNextChecked);
    onChange?.(isNextChecked);
  };

  if (!isMounted) {
    return (
      <div className="w-full h-20 rounded-3xl bg-slate-50 animate-pulse border border-slate-100" />
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isChecked}
      aria-label={`${isChecked ? 'Disable' : 'Enable'} ${label} parameter`}
      className={cn(
        "flex items-start gap-4 p-5 rounded-[2rem] transition-all text-left outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10 border group/checkbox",
        isChecked 
          ? "bg-white border-primary-base/20 shadow-xl shadow-primary-base/5" 
          : "bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-100 hover:shadow-sm",
        className
      )}
    >
      <div className={cn(
        "relative size-7 rounded-xl flex items-center justify-center transition-all duration-500 shrink-0 border-2",
        isChecked 
          ? "bg-slate-950 border-slate-950 shadow-2xl shadow-black/20 rotate-0 scale-100" 
          : "bg-white border-slate-200 group-hover/checkbox:border-primary-base rotate-[-10deg] scale-90"
      )}>
        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
              className="text-white"
            >
              <Check className="size-4 stroke-[4]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <span className={cn(
          "text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500",
          isChecked ? "text-slate-950" : "text-slate-400 group-hover/checkbox:text-slate-600"
        )}>
          {label}
        </span>
        {description && (
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none line-clamp-1">
            {description}
          </span>
        )}
      </div>
    </button>
  );
}
