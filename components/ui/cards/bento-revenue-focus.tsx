"use client";

import React from "react";
import { Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoRevenueFocusProps {
  amount: React.ReactNode;
  subtitle: React.ReactNode;
  statusText?: React.ReactNode;
  className?: string;
}

export function BentoRevenueFocus({ 
  amount = "₽1,250,000", 
  subtitle = "Операционная прибыль", 
  statusText = "На 12% выше плана", 
  className 
}: BentoRevenueFocusProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-950 text-white shadow-crm-xl border border-slate-800 p-8 rounded-card group min-h-[220px] flex flex-col justify-center",
        className
      )}
    >
      {/* Premium Glow effect */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-800/30 blur-[80px] rounded-full group-hover:bg-slate-800/40 transition-colors duration-500" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-900/40 blur-[60px] rounded-full" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 bg-slate-900 text-white border border-slate-800 rounded-xl flex items-center justify-center mb-6 shadow-xl">
          <Banknote className="w-6 h-6" />
        </div>
        
        <Typo as="h4" className="text-xs font-black tracking-tight text-slate-400 mb-2 leading-none">{subtitle}</Typo>
        <Typo as="h2" className="text-5xl font-black font-heading text-white tracking-tighter mb-4 leading-none">
          {amount}
        </Typo>
        
        {statusText && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-black tracking-tight text-slate-300 leading-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
            <Typo as="span">{statusText}</Typo>
          </div>
        )}
      </div>
    </div>
  );
}
