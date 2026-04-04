"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Command, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";

interface QuickActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: string;
}

interface QuickActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: QuickActionItem[];
}

function QuickActions({ actions, className, ...rest }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className={cn("relative flex flex-col items-end gap-4", className)} {...rest}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="flex flex-col gap-3 pointer-events-auto"
          >
            {actions.map((action, idx) => (
              <motion.button
                key={action.id}
                type="button"
                aria-label={`Execute: ${action.label}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  "group flex items-center gap-4 rounded-[1.5rem] bg-white px-6 py-3.5 shadow-2xl ring-1 ring-slate-100 transition-all duration-500 hover:ring-primary-base hover:-translate-x-2 active:scale-95 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10",
                  action.color || "text-slate-900"
                )}
              >
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 group-hover:text-primary-base">
                    {action.label}
                  </span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter tabular-nums">Action Matrix // {idx.toString().padStart(2, '0')}</span>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all duration-500 group-hover:bg-primary-base/10 group-hover:text-primary-base group-hover:rotate-6">
                  <action.icon className="size-5" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={isOpen ? "Close Quick Actions Menu" : "Open Quick Actions Menu"}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex size-16 items-center justify-center rounded-[2rem] transition-all duration-700 shadow-2xl outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20 z-50",
          isOpen 
            ? "rotate-90 bg-slate-950 text-white shadow-black/20" 
            : "bg-primary-base text-white shadow-primary-base/40 hover:bg-slate-900"
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="size-7 stroke-[3px]" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Plus className="size-7 stroke-[3px]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm -z-10 cursor-pointer"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export { QuickActions };
export type { QuickActionsProps, QuickActionItem };
