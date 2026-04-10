"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoSliderProps {
  min?: number;
  max?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  className?: string;
  label?: string;
  unit?: string;
}

export function BentoSlider({ 
  min = 0, 
  max = 100, 
  defaultValue = 50, 
  onChange, 
  className,
  label,
  unit = "%"
}: BentoSliderProps) {
  const [value, setValue] = useState(defaultValue);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    onChange?.(newValue);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full flex flex-col gap-3", className)}>
      <div className="flex justify-between items-end">
        {label && (
          <label className="text-[11px] font-black text-muted-foreground   pl-1 leading-none">
            {label}
          </label>
        )}
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-black text-foreground  transition-all duration-300">
            {value}
          </span>
          <span className="text-[11px] font-black text-muted-foreground ">{unit}</span>
        </div>
      </div>

      <div className="relative h-14 bg-white rounded-element border border-border shadow-sm flex items-center px-4 group">
        <div className="relative w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden shadow-inner">
          <motion.div
            animate={{ width: `${percentage}%` }}
            className="absolute left-0 top-0 h-full bg-primary-base shadow-sm transition-colors"
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-x-4 h-8 opacity-0 cursor-pointer z-20"
        />

        <motion.div
          animate={{
            left: `calc(${percentage}% + ${4 - (percentage * 0.08)}px)`,
            scale: isDragging ? 1.2 : 1,
          }}
          className={cn(
            "absolute size-8 bg-white border-4 border-primary-base rounded-full shadow-xl pointer-events-none z-10 transition-transform duration-300",
            isDragging ? "shadow-slate-200" : "shadow-slate-100"
          )}
        >
          {isDragging && (
            <motion.div
              layoutId="sliderTooltip"
              initial={{ opacity: 0, y: -40, scale: 0.5 }}
              animate={{ opacity: 1, y: -50, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.5 }}
              className="absolute left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 rounded-lg text-[11px] font-black text-white whitespace-nowrap shadow-xl"
            >
              {value}{unit}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-2 bg-gray-900 rotate-45" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
