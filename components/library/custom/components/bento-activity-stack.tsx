"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MessageSquare, Edit3, CheckCircle2, type LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

interface Activity {
  id: string;
  type: "email" | "call" | "message" | "edit" | "complete";
  title: string;
  time: string;
  contact: string;
}

interface BentoActivityStackProps {
  className?: string;
  activities?: Activity[];
}

const iconMap: Record<Activity["type"], LucideIcon> = {
  email: Mail,
  call: Phone,
  message: MessageSquare,
  edit: Edit3,
  complete: CheckCircle2,
};

const colorMap: Record<Activity["type"], string> = {
  email: "bg-blue-500/10 text-blue-500",
  call: "bg-emerald-500/10 text-emerald-500",
  message: "bg-amber-500/10 text-amber-500",
  edit: "bg-cyan-500/10 text-cyan-500",
  complete: "bg-green-500/10 text-green-500",
};

const defaultActivities: Activity[] = [
  { id: "1", type: "email", title: "Sent proposal v3.2", time: "2 min", contact: "Olga K." },
  { id: "2", type: "call", title: "Discovery call", time: "18 min", contact: "Max P." },
  { id: "3", type: "complete", title: "Deal closed — $42k", time: "1 hr", contact: "Anna R." },
  { id: "4", type: "message", title: "Follow-up message", time: "3 hr", contact: "Dmitry S." },
  { id: "5", type: "edit", title: "Updated contract terms", time: "5 hr", contact: "Ivan T." },
];

export function BentoActivityStack({ className, activities = defaultActivities }: BentoActivityStackProps) {
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
      <div className="flex items-center justify-between mb-5 px-1">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity</h3>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Today</span>
      </div>


      {/* Stacked card pile with rotation */}
      <div className="relative perspective-[800px]" style={{ minHeight: activities.length * 56 + 20 }}>
        {activities.map((activity, i) => {
          const Icon = iconMap[activity.type];
          const rotations = [-1.5, 0.8, -0.5, 1.2, -0.3];
          return (
            <motion.button
              key={activity.id}
              type="button"
              aria-label={`Activity: ${activity.title} with ${activity.contact}, ${activity.time} ago`}
              initial={{ opacity: 0, y: 30, rotate: rotations[i % rotations.length] * 2 }}
              animate={{
                opacity: 1,
                y: i * 56,
                rotate: rotations[i % rotations.length],
              }}
              whileHover={{
                scale: 1.03,
                rotate: 0,
                zIndex: 50,
                boxShadow: "0 12px 32px -8px rgba(0,0,0,0.12)",
              }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", bounce: 0.3 }}
              className={cn(
                "absolute left-0 right-0 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl cursor-pointer text-left w-full outline-none focus-visible:ring-2 focus-visible:ring-primary-base transition-colors hover:bg-secondary/50"
              )}
              style={{ zIndex: activities.length - i }}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", colorMap[activity.type])}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">{activity.title}</p>
                <p className="text-[11px] font-bold text-slate-400 truncate tracking-tighter">{activity.contact}</p>
              </div>
              <span className="text-[11px] font-black text-slate-400 shrink-0 tabular-nums lowercase">{activity.time}</span>
            </motion.button>

          );
        })}
      </div>
    </motion.div>
  );
}
