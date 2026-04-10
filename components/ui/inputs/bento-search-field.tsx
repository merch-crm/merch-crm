"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoSearchFieldProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export function BentoSearchField({ 
  placeholder = "Search everything...", 
  onSearch, 
  className 
}: BentoSearchFieldProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    setValue("");
    onSearch?.("");
  };

  return (
    <div className={cn("relative w-full group", className)}>
      <motion.div
        animate={{
          scale: isFocused ? 1.01 : 1,
          y: isFocused ? -2 : 0,
        }}
        className={cn(
          "relative flex items-center gap-3 p-1 rounded-element transition-all duration-500 border",
          isFocused 
            ? "bg-white border-primary-base shadow-xl shadow-slate-200 ring-0" 
            : "bg-[#F1F5F9] border-slate-200 hover:bg-white hover:border-slate-300"
        )}
      >
        <div className={cn(
          "pl-4 transition-colors duration-300",
          isFocused ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
        )}>
          <Search className="size-5" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onSearch?.(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-4 text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-medium"
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="p-2 mr-1 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all active:scale-95"
            >
              <X className="size-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {!value && (
          <div className="pr-4 flex items-center gap-1.5 opacity-40 group-hover:opacity-60 transition-opacity">
            <kbd className="h-6 px-1.5 rounded-md bg-gray-100 border border-gray-200 text-[11px] font-black text-gray-500 shadow-sm flex items-center">
              <Command className="size-2.5 mr-0.5" />
            </kbd>
            <kbd className="h-6 px-2 rounded-md bg-gray-100 border border-gray-200 text-[11px] font-black text-gray-500 shadow-sm">K</kbd>
          </div>
        )}
      </motion.div>
    </div>
  );
}
