"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BentoAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

const variants = {
  danger: {
    icon: <AlertTriangle className="size-8 text-rose-500" />,
    bg: "bg-rose-50",
    border: "border-rose-100",
    button: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20",
    glow: "bg-rose-500/10"
  },
  warning: {
    icon: <AlertTriangle className="size-8 text-amber-500" />,
    bg: "bg-amber-50",
    border: "border-amber-100",
    button: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
    glow: "bg-amber-500/10"
  },
  info: {
    icon: <AlertTriangle className="size-8 text-blue-500" />,
    bg: "bg-blue-50",
    border: "border-blue-100",
    button: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
    glow: "bg-blue-500/10"
  }
};

export function BentoAlertDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmLabel = "Подтвердить", 
  cancelLabel = "Отмена",
  variant = "danger"
}: BentoAlertDialogProps) {
  const v = variants[variant];
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-all duration-500 cursor-default outline-none"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: -15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300, mass: 1.2 }}
            className="relative w-full max-w-md bg-white rounded-card shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] border border-slate-100 overflow-hidden text-center"
          >
            <div className="p-10 flex flex-col items-center">
              <motion.div 
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 }}
                className={cn("size-20 rounded-card flex items-center justify-center mb-6 relative z-10 shadow-inner", v.bg)}
              >
                {v.icon}
                <div className={cn("absolute inset-0 rounded-card blur-2xl animate-pulse -z-10", v.glow)} />
              </motion.div>
              
              <h3 id="alert-dialog-title" className="text-[11px] font-black text-slate-900 tracking-[0.2em] leading-none mb-4">
                {title}
              </h3>
              <p id="alert-dialog-description" className="text-[11px] font-black text-slate-400 tracking-tight leading-relaxed">
                {description}
              </p>
            </div>

            <div className="grid grid-cols-2 p-2 gap-2 bg-slate-50/50">
              <button
                type="button"
                onClick={onClose}
                className="py-4 rounded-element bg-white border border-slate-100 text-[11px] font-black tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "py-4 rounded-element text-white text-[11px] font-black tracking-widest shadow-xl transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  v.button,
                  variant === "danger" ? "focus-visible:ring-rose-500" : variant === "warning" ? "focus-visible:ring-amber-500" : "focus-visible:ring-blue-500"
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
