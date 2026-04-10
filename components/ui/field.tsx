"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export type FieldStatus = "default" | "success" | "danger" | "warning";

interface FieldProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  status?: FieldStatus;
  isLoading?: boolean;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  showStatusIcon?: boolean;
}

const Field = ({
  label,
  description,
  error,
  status: _status = "default",
  isLoading,
  required,
  children,
  className,
  showStatusIcon: _showStatusIcon = false,
}: FieldProps) => {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      <AnimatePresence mode="wait">
        {label && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <Label className="text-sm font-bold text-slate-700 ml-1 block select-none flex items-center gap-1.5 focus:text-slate-900 transition-colors">
              {label}
              {required && <span className="text-rose-500">*</span>}
              {isLoading && <Loader2 className="size-3 animate-spin text-slate-300" />}
            </Label>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group/field">
        {children}
        
      </div>

      <AnimatePresence mode="wait">
        {(error || description) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-1 overflow-hidden"
          >
            {error ? (
              <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-0.5">
                <AlertCircle className="size-3" />
                {error}
              </p>
            ) : description ? (
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                {description}
              </p>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Compound Components (Variant B) ---

const FieldLabel = ({ children, className, ...props }: React.ComponentProps<typeof Label>) => (
  <Label className={cn("text-sm font-bold text-slate-700 ml-1 block", className)} {...props}>
    {children}
  </Label>
);

const FieldError = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-[11px] font-bold text-rose-500 flex items-center gap-1 mt-1 ml-1 animate-in fade-in slide-in-from-top-1", className)}>
    <AlertCircle className="size-3" />
    {children}
  </p>
);

Field.Label = FieldLabel;
Field.Error = FieldError;

export { Field };
