"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pipette, Check, ChevronDown, Palette, Save } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoColorPickerProps {
  label?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  className?: string;
}

const DEFAULT_COLORS = [
  "#f43f5e", "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6",
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
  "#0ea5e9", "#6366f1", "#8b5cf6", "#a855f7"
];

export function BentoColorPicker({ 
  label = "Select Theme Matrix", 
  defaultValue = "#3b82f6", 
  onChange, 
  className 
}: BentoColorPickerProps) {
  const [selected, setSelected] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSelect = (color: string) => {
    setSelected(color);
    onChange?.(color);
    setIsOpen(false);
  };

  if (!isMounted) {
    return (
      <div className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 animate-pulse" />
    );
  }

  return (
    <div className={cn("w-full flex flex-col gap-4", className)}>
      {label && (
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
          <Palette className="size-3" /> {label}
        </label>
      )}

      <div className="relative">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label={`Current selection is ${selected}. Click to open color selection matrix.`}
          className={cn(
            "w-full h-16 px-6 bg-white rounded-[2rem] border flex items-center justify-between transition-all duration-500 shadow-premium group/box",
            isOpen ? "border-primary-base ring-4 ring-primary-base/10 shadow-2xl" : "border-slate-100 hover:border-primary-base/30"
          )}
        >
          <div className="flex items-center gap-4">
            <div 
              className="size-10 rounded-2xl shadow-inner border border-black/5 transition-transform duration-500 group-hover/box:rotate-12 group-hover/box:scale-110" 
              style={{ backgroundColor: selected }} 
            />
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest tabular-nums">{selected}</span>
          </div>
          <div className="flex items-center gap-3">
            <Pipette className="size-4 text-slate-300 group-hover/box:text-primary-base transition-colors" />
            <ChevronDown className={cn("size-4 text-slate-200 transition-all duration-500", isOpen && "rotate-180 text-primary-base")} />
          </div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="absolute top-full left-0 right-0 mt-6 p-6 bg-white rounded-[3rem] border border-slate-100 shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
            >
              <div className="grid grid-cols-5 gap-3">
                {DEFAULT_COLORS.map((color, i) => (
                  <motion.button
                    key={`${color}-${i}`}
                    type="button"
                    aria-label={`Switch to chromophore ${color}`}
                    whileHover={{ scale: 1.2, rotate: 10, zIndex: 10 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSelect(color)}
                    className={cn(
                      "size-12 rounded-2xl relative overflow-hidden shadow-sm border border-black/5 transition-all duration-300",
                      selected === color && "ring-4 ring-primary-base/20 scale-110 border-white"
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {selected === color && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/10 text-white"
                      >
                        <Check className="size-6 stroke-[4]" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-8 flex gap-3 p-2 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                <input 
                  type="text" 
                  value={selected} 
                  autoComplete="off"
                  onChange={(e) => setSelected(e.target.value)}
                  aria-label="Hexadecimal color code entry"
                  className="flex-1 h-14 bg-transparent rounded-2xl border-none outline-none px-6 text-[11px] font-black text-slate-900 uppercase tracking-widest placeholder:text-slate-200" 
                  placeholder="#FFFFFF"
                />
                <button 
                  type="button"
                  aria-label="Commit color selection"
                  onClick={() => handleSelect(selected)}
                  className="size-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-black/20 transition-all hover:bg-primary-base hover:shadow-primary-base/40 active:scale-95 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
                >
                  <Save className="size-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
