"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoTimeTrackerProps {
  taskName: React.ReactNode;
  project: React.ReactNode;
  initialSeconds?: number;
  className?: string;
}

export function BentoTimeTracker({ taskName, project, initialSeconds = 0, className }: BentoTimeTrackerProps) {
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "running") {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setStatus("running");
  const handlePause = () => setStatus("paused");
  const handleResume = () => setStatus("running");
  const handleStop = () => {
    setStatus("idle");
    setSeconds(0);
  };

  if (!isMounted) {
    return (
      <div className={cn("w-full max-w-sm h-52 bg-white rounded-card border border-slate-100 animate-pulse p-8 shadow-premium", className)} />
    );
  }

  return (
    <div
      role="region"
      aria-label={`Таймер времени`}
      className={cn(
        "relative bg-white border p-8 rounded-card flex flex-col justify-between transition-all duration-700 shadow-premium group/card overflow-hidden text-left",
        status === "running" ? "border-primary-base/40 shadow-primary-base/5" : 
        status === "paused" ? "border-amber-500/30 shadow-amber-500/5" :
        "border-slate-100 hover:border-primary-base/20",
        className
      )}
    >
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex flex-col gap-3 items-start text-left">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full w-fit">
             <Clock className="size-3 text-slate-400" aria-hidden="true" />
             <Typo as="p" className="text-[9px] font-black text-slate-500 tracking-widest leading-none uppercase">{project}</Typo>
          </div>
          <Typo as="h3" className="text-[11px] font-black text-slate-900 tracking-[0.2em] leading-tight line-clamp-2 max-w-[200px] h-9 uppercase">
            {taskName}
          </Typo>
        </div>
        <div 
          className={cn(
            "size-3 rounded-full mt-2 transition-all duration-700 border-2 border-white shadow-sm", 
            status === "running" ? "bg-primary-base animate-pulse shadow-[0_0_12px_rgba(var(--primary-base),0.6)]" : 
            status === "paused" ? "bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6)]" :
            "bg-slate-200"
          )} 
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between relative z-10 pt-6 border-t border-slate-50">
        <div className="flex flex-col gap-1 items-start">
          <Typo as="span" className="text-[9px] font-black text-slate-300 tracking-widest leading-none uppercase">Прошедшее время</Typo>
          <div className={cn(
             "text-3xl font-black tabular-nums tracking-tighter drop-shadow-sm font-mono transition-colors duration-500",
             status === "paused" ? "text-amber-600" : "text-slate-950"
          )}>
            <Typo as="span">{formatTime(seconds)}</Typo>
          </div>
        </div>
        
        <div className="flex gap-2">
           <AnimatePresence mode="wait" initial={false}>
              {status === "idle" ? (
                 <motion.button
                    key="start"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={handleStart}
                    className="size-14 rounded-element bg-slate-950 border border-slate-900 text-white flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 hover:bg-primary-base hover:border-primary-base/20 shadow-black/20"
                 >
                    <Play className="size-6 fill-current" />
                 </motion.button>
              ) : status === "running" ? (
                 <motion.button
                    key="pause"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    onClick={handlePause}
                    className="size-14 rounded-element bg-indigo-50 border border-indigo-100 text-primary-base flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 hover:bg-primary-base hover:text-white shadow-primary-base/20"
                 >
                    <motion.div
                       animate={{ scale: [1, 0.9, 1] }}
                       transition={{ repeat: Infinity, duration: 2 }}
                    >
                       <div className="flex gap-1.5">
                          <div className="w-1.5 h-6 bg-current rounded-full" />
                          <div className="w-1.5 h-6 bg-current rounded-full" />
                       </div>
                    </motion.div>
                 </motion.button>
              ) : (
                 <div key="paused-controls" className="flex gap-2">
                    <motion.button
                       initial={{ x: 20, opacity: 0 }}
                       animate={{ x: 0, opacity: 1 }}
                       exit={{ x: 20, opacity: 0 }}
                       onClick={handleResume}
                       className="size-14 rounded-element bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 hover:bg-amber-500 hover:text-white shadow-amber-500/20"
                       title="Продолжить"
                    >
                       <Play className="size-6 fill-current" />
                    </motion.button>
                    <motion.button
                       initial={{ x: 40, opacity: 0 }}
                       animate={{ x: 0, opacity: 1 }}
                       exit={{ x: 40, opacity: 0 }}
                       onClick={handleStop}
                       className="size-14 rounded-element bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-95 hover:bg-rose-500 hover:text-white shadow-rose-500/20"
                       title="Завершить"
                    >
                       <Square className="size-6 fill-current" />
                    </motion.button>
                 </div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* Decorative pulse background */}
      <AnimatePresence>
        {status === "running" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-primary-base/[0.03] to-transparent pointer-events-none"
          />
        )}
        {status === "paused" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent pointer-events-none"
          />
        )}
      </AnimatePresence>
      <div className={cn(
         "absolute -bottom-10 -right-10 size-40 blur-[50px] rounded-full group-hover/card:scale-150 transition-all duration-1000",
         status === "paused" ? "bg-amber-500/[0.05]" : "bg-primary-base/[0.01]"
      )} />
    </div>
  );
}
