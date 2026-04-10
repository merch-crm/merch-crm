"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { id: "1", name: "Исследование", status: "completed" },
  { id: "2", name: "Дизайн", status: "completed" },
  { id: "3", name: "Разработка", status: "active" },
  { id: "4", name: "Тестирование QA", status: "pending" },
  { id: "5", name: "Запуск", status: "locked" },
];

const statusConfig = {
  completed: { icon: CheckCircle2, color: "text-emerald-500", dot: "bg-emerald-500", line: "bg-emerald-500" },
  active: { icon: Loader2, color: "text-primary-base", dot: "bg-primary-base", line: "bg-gradient-to-b from-primary-base to-slate-200" },
  pending: { icon: Circle, color: "text-slate-400/80", dot: "bg-slate-400/30", line: "bg-slate-200" },
  locked: { icon: Lock, color: "text-slate-400/40", dot: "bg-slate-400/15", line: "bg-transparent" },
};

export function BentoProjectPhases({
  className,
  phases = defaultPhases,
  title = "Дорожная карта проекта",
}: BentoProjectPhasesProps) {
  const completedCount = phases.filter((p) => p.status === "completed").length;
  const progress = (completedCount / phases.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      className={cn(
        "relative overflow-hidden bg-white text-slate-900 shadow-crm-lg border border-slate-200",
        "rounded-card p-6",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[11px] font-black text-slate-400 tracking-[0.2em]">{title}</h3>
          <p className="text-[11px] font-bold text-slate-400 tracking-tighter mt-1">{completedCount}/{phases.length} этапов завершено</p>
        </div>

        <div className="text-lg font-black text-primary-base tracking-tighter">{progress.toFixed(0)}%</div>

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
                    phase.status === "active" && "ring-4 ring-primary-base/20",
                    phase.status === "completed" ? "bg-emerald-500/10" : "bg-slate-50"
                  )}
                >
                  <Icon size={16} className={cn( config.color, phase.status === "active" && "animate-spin" )} style={phase.status === "active" ? { animationDuration: "3s" } : undefined} />
                </motion.div>
                {/* Connecting line */}
                {!isLast && (
                  <div className={cn("w-0.5 h-8", config.line)} />
                )}
              </div>

              {/* Phase info */}
              <div className={cn("pb-8", isLast && "pb-0")}>
                <p className={cn(
                  "text-[11px] font-black tracking-tight leading-none mt-2 text-slate-900",
                  phase.status === "locked" && "text-slate-300"
                )}>
                  {phase.name}
                </p>

                {phase.status === "active" && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-[11px] text-primary-base mt-1 font-bold italic"
                  >
                    В процессе…
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
