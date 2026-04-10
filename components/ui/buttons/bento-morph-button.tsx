"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function BentoMorphButton({ className: _className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleClick = () => {
    if (status !== "idle") return;
    setStatus("loading");
    setTimeout(() => setStatus("success"), 1500);
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      layout
      initial={false}
      className={cn(
        "relative h-14 min-w-[56px] rounded-full flex items-center justify-center transition-all duration-500 shadow-xl overflow-hidden",
        status === "idle" ? "bg-primary w-48 px-6 text-primary-foreground" : 
        status === "loading" ? "bg-primary/20 w-14 border-2 border-primary" : 
        "bg-emerald-500 w-14 text-white"
      )}
    >
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 font-bold whitespace-nowrap"
          >
            <span>Send Request</span>
            <Send className="w-4 h-4" />
          </motion.div>
        )}
        
        {status === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center justify-center"
          >
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
        
        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center justify-center"
          >
            <Check className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
