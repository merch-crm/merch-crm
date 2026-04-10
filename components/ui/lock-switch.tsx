"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LockSwitchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onToggle'> {
  defaultLocked?: boolean;
  onToggle?: (isLocked: boolean) => void;
  lockedText?: string;
  unlockedText?: string;
  title?: string;
}

const LockSwitch = React.forwardRef<HTMLDivElement, LockSwitchProps>(
  ({ className, defaultLocked = true, onToggle, lockedText = "Защищенный режим", unlockedText = "Доступ открыт", title = "Главный замок", ...props }, ref) => {
    const [isLocked, setIsLocked] = useState(defaultLocked);

    const handleToggle = () => {
      const isNextLocked = !isLocked;
      setIsLocked(isNextLocked);
      onToggle?.(isNextLocked);
    };

    return (
      <div ref={ref} className={cn("flex flex-col items-center gap-3", className)} {...props}>
        <div className="w-full flex justify-between items-center px-2">
          <h3 className="text-gray-900 text-xs font-black">{title}</h3>
          <ShieldCheck className={cn("size-4 transition-colors", isLocked ? "text-gray-300" : "text-emerald-500")} />
        </div>

        <button 
          type="button"
          role="switch"
          aria-checked={!isLocked}
          aria-label="Toggle lock"
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle();
            }
          }}
          className={cn(
            "relative w-20 h-32 rounded-3xl cursor-pointer transition-all duration-500 flex flex-col items-center justify-between py-3 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            isLocked ? "bg-gray-50 border-2 border-gray-100 shadow-inner focus-visible:ring-gray-200" : "bg-emerald-50 border-2 border-emerald-100 focus-visible:ring-emerald-500"
          )}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "size-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 relative ring-4",
              isLocked 
                ? "translate-y-12 bg-white text-gray-900 ring-gray-100" 
                : "translate-y-0 bg-emerald-500 text-white ring-emerald-100"
            )}
          >
            <AnimatePresence mode="wait">
              {isLocked ? (
                <motion.div key="lock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Lock className="size-6" />
                </motion.div>
              ) : (
                <motion.div key="unlock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Unlock className="size-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="flex flex-col gap-1 items-center pb-2">
            <div className={cn("size-1 rounded-full transition-colors", !isLocked ? "bg-emerald-500" : "bg-gray-200")} />
            <div className={cn("size-1 rounded-full transition-colors", !isLocked ? "bg-emerald-100" : "bg-gray-200")} />
          </div>
        </button>

        <div className="text-center bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 w-full">
          <p className="text-xs font-bold text-gray-400">{isLocked ? lockedText : unlockedText}</p>
        </div>
      </div>
    );
  }
);
LockSwitch.displayName = "LockSwitch";

export { LockSwitch };
