"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, Lock } from "lucide-react";
import { cn } from "../utils/cn";

interface Phase {
  id: string;
  name: string;
  status: "completed" | "active" | "pending" | "locked";
}

interface BentoProjectPhasesProps {
  className?: string;
  phases?: Phase[];
  title?: string;
}

const defaultPhases: Phase[] = [
  { id: "1", name: "Discovery", status: "completed" },
  { id: "2", name: "Design", status: "completed" },
  { id: "3", name: "Development", status: "active" },
  { id: "4", name: "QA Testing", status: "pending" },
  { id: "5", name: "Launch", status: "locked" },
];

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-emerald-500", dot: "bg-emerald-500", line: "bg-emerald-500" },
  active: { icon: Loader2, color: "text-primary", dot: "bg-primary", line: "bg-gradient-to-b from-primary to-border" },
  pending: { icon: Circle, color: "text-muted-foreground", dot: "bg-muted-foreground/30", line: "bg-border" },
  locked: { icon: Lock, color: "text-muted-foreground/40", dot: "bg-muted-foreground/15", line: "bg-transparent" },
};

export function BentoProjectPhases({
  className,
  phases = defaultPhases,
  title = "Project Roadmap",
}: BentoProjectPhasesProps) {
  const completedCount = phases.filter((p) => p.status === "completed").length;
  const progress = (completedCount / phases.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-lg border border-border",
        "rounded-[27px] p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{completedCount}/{phases.length} phases done</p>
        </div>

        <div className="text-lg font-black text-primary tracking-tighter">{progress.toFixed(0)}%</div>

      </div>

      {/* Continuous Stream — flowing thread with glowing nodes */}
      <div className="relative">
        {phases.map((phase, i) => {
          const config = statusConfig[phase.status];
          const Icon = config.icon;
          const isLast = i === phases.length - 1;

          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.1, type: "spring", bounce: 0.3 }}
              className="flex items-start gap-3 relative"
            >
              {/* Thread line + node */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring", bounce: 0.5 }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10",
                    phase.status === "active" && "ring-4 ring-primary/20",
                    phase.status === "completed" ? "bg-emerald-500/10" : "bg-secondary"
                  )}
                >
                  <Icon
                    size={16}
                    className={cn(
                      config.color,
                      phase.status === "active" && "animate-spin"
                    )}
                    style={phase.status === "active" ? { animationDuration: "3s" } : undefined}
                  />
                </motion.div>
                {/* Connecting line */}
                {!isLast && (
                  <div className={cn("w-0.5 h-8", config.line)} />
                )}
              </div>

              {/* Phase info */}
              <div className={cn("pb-8", isLast && "pb-0")}>
                <p className={cn(
                  "text-[11px] font-black uppercase tracking-tight leading-none mt-2 text-slate-900",
                  phase.status === "locked" && "text-slate-300"
                )}>
                  {phase.name}
                </p>

                {phase.status === "active" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-[11px] text-primary mt-1 font-bold italic"
                  >
                    In progress…
                  </motion.p>

                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
