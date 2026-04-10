"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  label: string;
  description?: string;
  value: string;
}

interface BentoRadioGroupProps {
  label?: string;
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function BentoRadioGroup({ 
  label = "Select Option", 
  options, 
  defaultValue, 
  onChange, 
  className 
}: BentoRadioGroupProps) {
  const [selected, setSelected] = useState(defaultValue || options[0]?.id);

  const handleSelect = (id: string) => {
    setSelected(id);
    onChange?.(id);
  };

  return (
    <div className={cn("w-full flex flex-col gap-3", className)}>
      {label && (
        <label className="text-[11px] font-black text-muted-foreground   pl-1 leading-none">
          {label}
        </label>
      )}

      <div className="grid grid-cols-1 gap-2 bg-[#F8FAFC] p-2 rounded-card border border-slate-200 shadow-inner">
        {options.map((option) => {
          const isSelected = selected === option.id;
          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: isSelected ? 1 : 1.01, x: isSelected ? 0 : 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option.id)}
              className={cn(
                "relative flex items-center justify-between p-4 rounded-element transition-all text-left",
                isSelected 
                  ? "bg-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-primary-base/50" 
                  : "hover:bg-white hover:shadow-sm"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div className={cn(
                  "size-5 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isSelected ? "bg-primary-base border-primary-base scale-110" : "bg-white border-slate-200"
                )}>
                  {isSelected && (
                    <motion.div
                      layoutId="radioInner"
                      className="size-1.5 rounded-full bg-white shadow-sm"
                    />
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className={cn(
                    "text-sm font-bold transition-all",
                    isSelected ? "text-primary-base " : "text-slate-900"
                  )}>
                    {option.label}
                  </span>
                  {option.description && (
                    <span className="text-[11px] font-medium text-slate-400 mt-0.5 line-clamp-1">
                      {option.description}
                    </span>
                  )}
                </div>
              </div>

              {isSelected && (
                <motion.div
                  layoutId="activeIndicator"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="size-8 rounded-xl bg-slate-50 flex items-center justify-center text-primary-base border border-slate-100"
                >
                  <Check className="size-4" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
