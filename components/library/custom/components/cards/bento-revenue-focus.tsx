"use client";

import React from "react";
import { Banknote } from "lucide-react";
import { cn } from "../../utils/cn";

interface BentoRevenueFocusProps {
  amount: string;
  subtitle: string;
  statusText?: string;
  className?: string;
}

export function BentoRevenueFocus({ amount, subtitle, statusText, className }: BentoRevenueFocusProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-primary/5 text-card-foreground border border-primary/20 p-8 rounded-[27px] group",
        className
      )}
    >
      {/* Glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-colors duration-500" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
          <Banknote className="w-6 h-6" />
        </div>
        
        <h4 className="text-xl font-medium text-muted-foreground  mb-2">{subtitle}</h4>
        <h2 className="text-5xl font-black font-heading text-primary drop-shadow-sm mb-4">
          {amount}
        </h2>
        
        {statusText && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/50 dark:bg-black/50 border border-primary/10 rounded-full text-xs font-semibold text-primary backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {statusText}
          </div>
        )}
      </div>
    </div>
  );
}
