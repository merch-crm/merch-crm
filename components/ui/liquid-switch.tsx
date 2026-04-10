"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LiquidSwitchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onToggle'> {
  defaultChecked?: boolean;
  onToggle?: (isOn: boolean) => void;
  labelOn?: string;
  labelOff?: string;
  title?: string;
  subtitle?: string;
}

const LiquidSwitch = React.forwardRef<HTMLDivElement, LiquidSwitchProps>(
  ({ className, defaultChecked = false, onToggle, labelOn = "Вкл", labelOff = "Выкл", title, subtitle, ...props }, ref) => {
    const [isOn, setIsOn] = useState(defaultChecked);

    const handleToggle = () => {
      const isNextOn = !isOn;
      setIsOn(isNextOn);
      onToggle?.(isNextOn);
    };

    return (
      <div ref={ref} className={cn("flex flex-col items-center gap-3", className)} {...props}>
        {(title || subtitle) && (
          <div className="text-center">
            {title && <h3 className="text-sm font-black text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs font-bold text-gray-400 mt-1">{subtitle}</p>}
          </div>
        )}

        <button 
          type="button"
          role="switch"
          aria-checked={isOn}
          aria-label="Toggle switch"
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}
          className={cn(
            "relative w-24 h-12 rounded-full cursor-pointer transition-colors duration-500 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            isOn ? "bg-emerald-500 focus-visible:ring-emerald-500" : "bg-rose-500 focus-visible:ring-rose-500"
          )}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "absolute top-1 left-1 size-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500",
              isOn ? "translate-x-12 bg-white" : "translate-x-0 bg-white"
            )}
          >
            <motion.div 
              animate={{ scale: isOn ? [1, 1.2, 1] : 1 }}
              className={cn("absolute inset-0 rounded-full bg-white opacity-40 blur-sm -z-10", isOn ? "block" : "hidden")}
            />
          </motion.div>
        </button>

        <div className="flex gap-3 mt-2">
          <div className="flex flex-col items-center">
            <span className={cn("text-xs font-black", !isOn ? "text-rose-600" : "text-gray-300")}>{labelOff}</span>
            <div className={cn("size-1 rounded-full mt-1", !isOn ? "bg-rose-500" : "bg-transparent")} />
          </div>
          <div className="flex flex-col items-center">
            <span className={cn("text-xs font-black", isOn ? "text-emerald-600" : "text-gray-300")}>{labelOn}</span>
            <div className={cn("size-1 rounded-full mt-1", isOn ? "bg-emerald-500" : "bg-transparent")} />
          </div>
        </div>
      </div>
    );
  }
);
LiquidSwitch.displayName = "LiquidSwitch";

export { LiquidSwitch };
