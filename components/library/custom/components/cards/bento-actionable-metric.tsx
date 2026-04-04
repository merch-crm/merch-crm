"use client";

import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoActionableMetricProps {
  title: string;
  value: string;
  message: string;
  type: "warning" | "error" | "info";
  actionText: string;
  onAction?: () => void;
  className?: string;
}

export function BentoActionableMetric({ 
  title, value, message, type, actionText, onAction, className 
}: BentoActionableMetricProps) {
  
  const colors = {
    warning: "bg-amber-50 border-amber-200 text-amber-900 group-hover:bg-amber-100",
    error: "bg-red-50 border-red-200 text-red-900 group-hover:bg-red-100",
    info: "bg-blue-50 border-blue-200 text-blue-900 group-hover:bg-blue-100",
  };

  const textColors = {
    warning: "text-amber-700",
    error: "text-red-700",
    info: "text-blue-700",
  };

  return (
    <div
      className={cn(
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-[27px] flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <AlertCircle className={cn("w-5 h-5", textColors[type])} />
        </div>
        <h3 className="text-4xl font-black font-heading mb-4">{value}</h3>
      </div>

      <button
        type="button"
        onClick={onAction}

        className={cn(
          "w-full text-left px-4 py-3 rounded-2xl flex items-center justify-between border transition-all group",
          colors[type]
        )}
      >
        <div className="flex-1 pr-4">
          <span className="block text-xs font-bold   mb-0.5 opacity-60">Requires Action</span>
          <span className="block text-sm font-medium leading-tight">{message}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}
