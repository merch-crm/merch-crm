"use client";

import React, { useState, useRef, useEffect } from "react";
import { Pipette, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./color-picker";
import { Field, type FieldStatus } from "./field";

export interface CompactColorPickerProps {
  value?: string | null;
  onChange?: (color: string | null) => void;
  label?: React.ReactNode;
  placeholder?: string;
  description?: React.ReactNode;
  error?: React.ReactNode;
  status?: FieldStatus;
  className?: string;
  required?: boolean;
}

export const CompactColorPicker = ({
  value: controlledValue,
  onChange: controlledOnChange,
  label,
  placeholder = "Выберите цвет",
  description,
  error,
  status = "default",
  className,
  required,
}: CompactColorPickerProps) => {
  const [internalValue, setInternalValue] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const onChange = controlledOnChange || setInternalValue;

  // Handle outside clicks to close picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) onChange(null);
  };

  const handleSelect = (color: string) => {
    if (onChange) onChange(color);
    // We don't close on select to allow finer adjustment
  };

  return (
    <Field label={label} description={description} error={error} status={status} required={required} className={cn("w-fit", className)}>
      <div ref={containerRef} className="relative">
        <div 
          className={cn(
            "flex items-center justify-between bg-white p-[10px] rounded-[20px] border border-slate-100 shadow-crm-md overflow-visible z-20 relative w-[260px] group/picker hover:border-slate-200 hover:shadow-lg transition-all"
          )}
        >
          {/* Color indicator + Text container */}
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "size-10 flex-shrink-0 rounded-[10px] shadow-sm outline-none transition-all active:scale-95 overflow-hidden",
                value ? "border border-black/5" : "border-none"
              )}
              style={{ 
                backgroundColor: value || 'transparent',
                backgroundImage: value 
                  ? 'none' 
                  : 'radial-gradient(circle at center, white 0%, transparent 60%), conic-gradient(from 0deg, #ff5050, #ffff50, #50ff50, #50ffff, #5050ff, #ff50ff, #ff5050)',
                backgroundSize: value ? 'auto' : '110% 110%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              } as React.CSSProperties}
            />
            <div className="flex flex-col min-w-[70px]">
              <span className="text-[11px] font-black text-slate-400 tracking-widest leading-none mb-0.5">Цвет</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-[15px] font-black tracking-tighter leading-none tabular-nums transition-colors",
                  value ? "text-slate-900" : "text-slate-300"
                )}>
                  {value || placeholder}
                </span>
                {value && (
                  <button 
                    type="button"
                    onClick={handleClear}
                    className="p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Separator + Pipette icon */}
          <div className="flex items-center gap-3">
            <div className="w-[1px] h-8 bg-black/[0.03]" />
            <button 
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "size-10 rounded-[10px] flex items-center justify-center transition-all",
                isOpen ? "text-primary-base" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Pipette size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Picker Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 z-[100] shadow-2xl origin-top rounded-[24px]"
            >
              <ColorPicker color={value || "#3B82F6"} onChange={handleSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Field>
  );
};
