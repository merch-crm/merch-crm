"use client";

import React from "react";
import { cn } from "../utils/cn";

interface StatusIndicatorProps {
  type?: "primary" | "success" | "warning" | "error" | "neutral" | "info";
  label: string;
  pulse?: boolean;
  className?: string;
}

/**
 * Modern Status Indicator (Dot + Label)
 * Part of the "Modern Industrial Craft" design system.
 */
export function StatusIndicator({
  type = "neutral",
  label,
  pulse = false,
  className
}: StatusIndicatorProps) {
  const colors = {
    primary: "bg-primary-base",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    neutral: "bg-slate-400",
    info: "bg-blue-500",
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative flex size-2">
        {pulse && (
          <span className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
            colors[type]
          )} />
        )}
        <span className={cn("relative inline-flex rounded-full size-2", colors[type])} />
      </div>
      <span className="text-xs font-bold text-slate-600 normal-case tracking-normal">{label}</span>
    </div>
  );
}
