"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Clock, Timer } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoTimeTrackerProps {
  taskName: string;
  project: string;
  initialSeconds?: number;
  className?: string;
}

export function BentoTimeTracker({ taskName, project, initialSeconds = 0, className }: BentoTimeTrackerProps) {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isMounted) {
    return (
      <div className={cn("w-full max-w-sm h-52 bg-white rounded-[40px] border border-slate-100 animate-pulse p-8", className)} />
    );
  }

  return (
    <div
      role="region"
      aria-label={`Time tracker for task: ${taskName}`}
      className={cn(
        "relative bg-white border p-8 rounded-[40px] flex flex-col justify-between transition-all duration-700 shadow-premium group/card overflow-hidden",
        isActive ? "border-primary-base/40 shadow-primary-base/5" : "border-slate-100 hover:border-primary-base/20",
        className
      )}
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full w-fit">
             <Clock className="size-3 text-slate-400" aria-hidden="true" />
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{project}</p>
          </div>
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-tight line-clamp-2 max-w-[200px] h-9">{taskName}</h3>
        </div>
        <div 
          className={cn(
            "size-3 rounded-full mt-2 transition-all duration-700 border-2 border-white shadow-sm", 
            isActive ? "bg-primary-base animate-pulse shadow-[0_0_12px_rgba(var(--primary-base),0.6)]" : "bg-slate-200"
          )} 
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between relative z-10 pt-6 border-t border-slate-50">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Elapsed Nodes</span>
          <div className="text-3xl font-black text-slate-950 tabular-nums tracking-tighter drop-shadow-sm font-mono">
            {formatTime(seconds)}
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          aria-label={isActive ? "Stop active node tracking" : "Start node time propagation"}
          className={cn(
            "size-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20",
            isActive 
              ? "bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white shadow-rose-500/10" 
              : "bg-slate-950 border border-slate-900 text-white hover:bg-primary-base hover:border-primary-base/20 shadow-black/20"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isActive ? (
              <motion.div
                key="stop"
                initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
              >
                <Square className="size-6 fill-current" />
              </motion.div>
            ) : (
              <motion.div
                key="play"
                initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: -90 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
              >
                <Play className="size-6 fill-current" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Decorative pulse background */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-primary-base/[0.03] to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>
      <div className="absolute -bottom-10 -right-10 size-40 bg-primary-base/[0.01] blur-[50px] rounded-full group-hover/card:scale-150 transition-transform duration-1000" />
    </div>
  );
}
