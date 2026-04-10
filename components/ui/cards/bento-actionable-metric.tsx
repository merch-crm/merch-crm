"use client";

import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoActionableMetricProps {
  title: React.ReactNode;
  value: React.ReactNode;
  message: React.ReactNode;
  type: "warning" | "error" | "info";
  actionText?: React.ReactNode;
  onAction?: () => void;
  className?: string;
}

export function BentoActionableMetric({ 
  title, 
  value, 
  message, 
  type, 
  actionText: _actionText = "Подробнее", 
  onAction, 
  className 
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
        "bg-card text-card-foreground shadow-crm-md border border-border p-6 rounded-card flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <Typo as="p" className="text-sm font-semibold text-muted-foreground uppercase">{title}</Typo>
          <AlertCircle className={cn("w-5 h-5", textColors[type])} />
        </div>
        <Typo as="h3" className="text-4xl font-black font-heading mb-4 tabular-nums">{value}</Typo>
      </div>

      <button
        type="button"
        onClick={onAction}
        className={cn(
          "w-full text-left px-4 py-3 rounded-element flex items-center justify-between border transition-all group",
          colors[type]
        )}
      >
        <div className="flex-1 pr-4">
          <Typo as="span" className="block text-[9px] font-black uppercase mb-0.5 opacity-60 tracking-widest leading-none">Требуется действие</Typo>
          <Typo as="span" className="block text-sm font-medium leading-tight">{message}</Typo>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
          <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
}
