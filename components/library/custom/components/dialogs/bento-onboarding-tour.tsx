"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "../../utils/cn";

interface Step {
  id: string;
  title: string;
  description: string;
  targetId: string;
}

interface BentoOnboardingTourProps {
  steps: Step[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function BentoOnboardingTour({ 
  steps, 
  isOpen, 
  onClose, 
  className 
}: BentoOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const target = document.getElementById(steps[currentStep].targetId);
      if (target) {
        setTargetRect(target.getBoundingClientRect());
      }
    }
  }, [isOpen, currentStep, steps]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[400] pointer-events-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-title"
        >
          {/* Spotlight Overlay */}
          <motion.button
            type="button"
            aria-label="Close tour"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/25 backdrop-blur-[2px] transition-all duration-700 pointer-events-auto cursor-default outline-none"
            onClick={onClose}
          />
          
          <div className="relative w-full h-full">
            {/* Spotlight Hole (Visual) */}
            <AnimatePresence mode="wait">
              {targetRect && (
                <motion.div
                  key={steps[currentStep].id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    top: targetRect.top - 12,
                    left: targetRect.left - 12,
                    width: targetRect.width + 24,
                    height: targetRect.height + 24
                  }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute rounded-[2rem] bg-white/5 ring-[200vw] ring-slate-950/25 shadow-[0_0_0_8px_rgba(255,255,255,0.3)] z-0 transition-all duration-500"
                />
              )}
            </AnimatePresence>

            {/* Tour Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={steps[currentStep].id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  top: targetRect ? targetRect.bottom + 32 : "50%",
                  left: targetRect ? targetRect.left : "50%",
                  x: targetRect ? 0 : "-50%",
                  translateY: targetRect ? 0 : "-50%"
                }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                  "absolute z-[410] w-[340px] bg-white rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-100 p-8 pointer-events-auto overflow-hidden",
                  className
                )}
              >
                <div className="flex flex-col gap-5 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-2xl bg-primary-base/10 flex items-center justify-center text-primary-base shadow-sm">
                      <Sparkles className="size-5" />
                    </div>
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={onClose}
                      className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  <div>
                    <h4 id="tour-title" className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none mb-2">
                      {steps[currentStep].title}
                    </h4>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight leading-relaxed">
                      {steps[currentStep].description}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    {/* Progress Dots */}
                    <div className="flex gap-1.5 px-0.5">
                      {steps.map((_, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            i === currentStep ? "w-8 bg-slate-900" : "w-1.5 bg-slate-100"
                          )} 
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {currentStep > 0 && (
                        <button
                          type="button"
                          aria-label="Previous step"
                          onClick={prev}
                          className="flex-1 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
                        >
                          <ArrowLeft className="size-3" /> Back
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={currentStep === steps.length - 1 ? "Finish tour" : "Next step"}
                        onClick={next}
                        className="flex-[2] h-12 rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
                      >
                        {currentStep === steps.length - 1 ? (
                          <><CheckCircle2 className="size-3" /> Done</>
                        ) : (
                          <>Next Step <ArrowRight className="size-3" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 size-24 bg-primary-base/5 rounded-full blur-3xl -z-0" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
