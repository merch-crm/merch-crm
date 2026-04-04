"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, Bell } from "lucide-react";
import { cn } from "../../utils/cn";

interface Toast {
  id: string;
  title: string;
  message?: string;
  type: "success" | "error" | "info" | "warning";
}

const icons = {
  success: <CheckCircle2 className="size-5 text-emerald-500" />,
  error: <AlertCircle className="size-5 text-rose-500" />,
  info: <Info className="size-5 text-blue-500" />,
  warning: <Bell className="size-5 text-amber-500" />
};

const colors = {
  success: "border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 shadow-emerald-500/10",
  error: "border-rose-100 bg-rose-50/50 hover:bg-rose-50 shadow-rose-500/10",
  info: "border-blue-100 bg-blue-50/50 hover:bg-blue-50 shadow-blue-500/10",
  warning: "border-amber-100 bg-amber-50/50 hover:bg-amber-50 shadow-amber-500/10"
};

export function BentoToast({ 
  toasts, 
  removeToast, 
  className 
}: { 
  toasts: Toast[]; 
  removeToast: (id: string) => void;
  className?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div 
      className={cn("fixed bottom-8 right-8 z-[300] flex flex-col gap-3 w-full max-w-sm", className)}
      role="log"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            role="status"
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "p-4 rounded-[28px] border backdrop-blur-xl shadow-2xl flex items-start gap-4 group/toast relative overflow-hidden",
              colors[toast.type]
            )}
          >
            <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover/toast:scale-110 transition-transform duration-300">
              {icons[toast.type]}
            </div>
            
            <div className="flex-1 pr-6 flex flex-col gap-1">
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight leading-tight line-clamp-2">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-300 hover:text-slate-900 hover:bg-white transition-all opacity-0 group-hover/toast:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-primary-base"
            >
              <X className="size-3.5" />
            </button>
            
            {/* Auto-dismiss progress hint */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              className={cn(
                "absolute bottom-0 left-0 h-1",
                toast.type === "success" ? "bg-emerald-500/20" : 
                toast.type === "error" ? "bg-rose-500/20" : 
                toast.type === "info" ? "bg-blue-500/20" : "bg-amber-500/20"
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
