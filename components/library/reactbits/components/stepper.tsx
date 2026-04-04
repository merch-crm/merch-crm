"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Binary, Fingerprint, Activity } from "lucide-react";
import { cn } from "../utils/cn";

interface StepperProps {
  steps: number;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  className?: string;
  labels?: string[];
}

export const Stepper = ({
  steps,
  initialStep = 1,
  onStepChange,
  className = "",
  labels = ["INIT", "SCAN", "LOAD", "LINK", "FINAL"]
}: StepperProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const goTo = (step: number) => {
    const clamped = Math.max(1, Math.min(step, steps));
    setCurrentStep(clamped);
    onStepChange?.(clamped);
  };

  if (!isMounted) {
    return (
      <div className="w-full h-32 rounded-[2.5rem] bg-slate-50 animate-pulse border border-slate-100" />
    );
  }

  return (
    <div className={cn("flex flex-col items-center gap-8 p-10 bg-white rounded-[3rem] border border-slate-100 shadow-premium group/stepper relative overflow-hidden", className)}>
      <div className="flex items-center gap-4 mb-4">
         <div className="size-8 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-lg shadow-black/20">
            <Binary className="size-4" />
         </div>
         <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">Process Linear Matrix</h3>
      </div>

      <div className="flex items-center gap-3 relative z-10">
        {Array.from({ length: steps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <motion.button
              type="button"
              aria-label={`Jump to process node ${step}`}
              aria-current={step === currentStep ? "step" : undefined}
              onClick={() => goTo(step)}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-[1.25rem] transition-all duration-700 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10 shadow-crm-md group/btn",
                step <= currentStep
                  ? "bg-slate-950 text-white border-transparent"
                  : "bg-slate-50 text-slate-300 border border-slate-100 hover:border-primary-base"
              )}
              animate={{ scale: step === currentStep ? 1.15 : 1 }}
            >
              <div className="flex flex-col items-center gap-0.5">
                 <span className="text-[11px] font-black tabular-nums tracking-widest">{step.toString().padStart(2, '0')}</span>
                 <div className="flex items-center gap-1">
                    <Activity className={cn("size-2 transition-opacity", step === currentStep ? "opacity-100 animate-pulse" : "opacity-0")} />
                 </div>
              </div>
            </motion.button>
            {step < steps && (
              <div className="mx-2 flex flex-col items-center gap-1">
                <div className={cn(
                  "h-1 w-12 rounded-full transition-all duration-1000",
                  step < currentStep ? "bg-slate-950" : "bg-slate-100 shadow-inner"
                )} />
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">{labels[step-1] || '---'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 relative z-10 w-full max-w-sm">
        <button
          type="button"
          onClick={() => goTo(currentStep - 1)}
          disabled={currentStep <= 1}
          aria-label="Revert to previous matrix node"
          className="flex-1 h-16 rounded-[1.5rem] bg-slate-50 text-slate-300 transition-all border border-slate-100 hover:bg-slate-950 hover:text-white disabled:opacity-20 active:scale-95 flex items-center justify-center gap-3 outline-none focus-visible:ring-4 focus-visible:ring-slate-950/10"
        >
          <ChevronLeft className="size-5" />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Matrix Back</span>
        </button>
        <button
          type="button"
          onClick={() => goTo(currentStep + 1)}
          disabled={currentStep >= steps}
          aria-label="Advance to next matrix node"
          className="flex-1 h-16 rounded-[1.5rem] bg-slate-950 text-white transition-all shadow-xl shadow-black/20 hover:bg-primary-base hover:shadow-primary-base/40 disabled:opacity-20 active:scale-95 flex items-center justify-center gap-3 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Matrix Next</span>
          <ChevronRight className="size-5" />
        </button>
      </div>

      <div className="absolute -right-32 -bottom-32 size-96 bg-primary-base/5 rounded-full blur-[120px] -z-10 group-hover/stepper:bg-primary-base/10 transition-all duration-1000" />
    </div>
  );
};
