"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Maximize2, 
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

type BackdropVariant = "blur" | "gradient" | "pattern" | "dark";

interface DrawerBackdropProps {
  variant: BackdropVariant;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function DrawerBackdrop({ variant, isOpen, onClose, children }: DrawerBackdropProps) {
  const backdropVariants = {
    blur: "backdrop-blur-xl bg-white/20 dark:bg-black/20",
    gradient: "bg-linear-to-tr from-primary/80 via-purple-500/80 to-pink-500/80",
    pattern: "bg-slate-900/90 [background-image:radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.05)_1px,transparent_0)] [background-size:24px_24px]",
    dark: "bg-black/60",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Закрыть"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn("absolute inset-0 transition-all duration-700 border-none outline-none cursor-default", backdropVariants[variant])}
          >
            {/* Оверлей шума для устранения color banding (ступенчатости градиента) */}
            <div 
              className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" 
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
            />
          </motion.button>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-card shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function DrawerBackdropVariants() {
  const [activeVariant, setActiveVariant] = useState<BackdropVariant | null>(null);

  const variantsColors: Record<BackdropVariant, string> = {
    blur: "bg-primary",
    gradient: "bg-gradient-to-r from-pink-500 to-purple-500",
    pattern: "bg-slate-800",
    dark: "bg-black",
  };

  return (
    <div className="space-y-3 w-full max-w-md">
      <div className="grid grid-cols-2 gap-3">
        {(["blur", "gradient", "pattern", "dark"] as BackdropVariant[]).map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => setActiveVariant(v)}
            className="group relative p-6 rounded-card bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
          >
            <div className={cn("size-10 rounded-element mb-4 group-hover:rotate-12 transition-transform", variantsColors[v])} />
            <div className="text-left">
              <h4 className="text-xs font-black text-slate-900  capitalize">{v} Experience</h4>
              <p className="text-[11px] text-slate-400 font-bold   mt-1 opacity-70">Premium Backdrop</p>
            </div>
            <Maximize2 className="absolute top-6 right-6 size-4 text-slate-200 group-hover:text-primary-base transition-colors" />
          </button>
        ))}
      </div>

      <DrawerBackdrop variant={activeVariant || "blur"} isOpen={!!activeVariant} onClose={() => setActiveVariant(null)}
      >
        <div className="p-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-element bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <Sparkles className="size-6" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black text-slate-900 ">Active Context</h2>
                <div className="flex items-center gap-1.5 mt-1">
                   <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[11px] text-slate-400 font-black  ">{activeVariant} Vision Layer</span>
                </div>
              </div>
            </div>
            <button 
              type="button"
              aria-label="Закрыть"
              onClick={() => setActiveVariant(null)}
              className="size-10 rounded-element bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
            >
              <X className="size-5" strokeWidth={3} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-slate-50 rounded-full" />
            <div className="h-4 w-full bg-slate-50 rounded-full" />
            <div className="h-4 w-1/2 bg-slate-50 rounded-full" />
          </div>

          <div className="pt-4 flex gap-3">
             <Button color="purple" variant="solid" className="flex-1 h-14 rounded-element font-black shadow-xl shadow-primary/20">
                Proceed Securely
             </Button>
          </div>
        </div>
      </DrawerBackdrop>
    </div>
  );
}
