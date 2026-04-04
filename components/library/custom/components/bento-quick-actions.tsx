"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Send, FileUp, UserPlus, CalendarPlus, BarChart3, type LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface BentoQuickActionsProps {
  className?: string;
  onAction?: (id: string) => void;
}

const actions: QuickAction[] = [
  { id: "new-deal", label: "New Deal", icon: Plus, color: "bg-emerald-500 text-white" },
  { id: "send-email", label: "Send Email", icon: Send, color: "bg-blue-500 text-white" },
  { id: "upload", label: "Upload File", icon: FileUp, color: "bg-amber-500 text-white" },
  { id: "add-contact", label: "Add Contact", icon: UserPlus, color: "bg-rose-500 text-white" },
  { id: "schedule", label: "Schedule", icon: CalendarPlus, color: "bg-cyan-500 text-white" },
  { id: "report", label: "New Report", icon: BarChart3, color: "bg-indigo-500 text-white" },

];

export function BentoQuickActions({ className, onAction }: BentoQuickActionsProps) {
  const primary = actions[0];
  const secondary = actions.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground shadow-crm-lg border border-border",
        "rounded-[27px] p-5",
        className
      )}
    >
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Actions</h3>


      {/* Asymmetric layout: one giant + column of small */}
      <div className="grid grid-cols-[1fr_1fr] gap-3 h-[calc(100%-2.5rem)]">
        {/* Giant primary action */}
        {(() => {
          const PrimaryIcon = primary.icon;
          return (
            <motion.button
              type="button"
              whileHover={{ scale: 0.97 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onAction?.(primary.id)}
              className={cn(
                "row-span-3 flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-shadow duration-300 hover:shadow-crm-md outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                primary.color
              )}
            >
              <PrimaryIcon size={32} strokeWidth={1.5} />
              <span className="text-[11px] font-black uppercase tracking-tight">{primary.label}</span>
            </motion.button>

          );
        })()}

        {/* Column of secondary actions */}
        {secondary.map((action, i) => {
          const ActionIcon = action.icon;
          return (
            <motion.button
              key={action.id}
              type="button"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.07, type: "spring", bounce: 0.3 }}
              whileHover={{ scale: 0.95 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAction?.(action.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer border border-border bg-secondary/50 text-card-foreground",
                "transition-colors duration-200 hover:bg-secondary outline-none focus-visible:ring-2 focus-visible:ring-primary-base w-full text-left"
              )}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", action.color)}>
                <ActionIcon size={16} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-tighter truncate leading-none">{action.label}</span>
            </motion.button>

          );
        })}
      </div>
    </motion.div>
  );
}
