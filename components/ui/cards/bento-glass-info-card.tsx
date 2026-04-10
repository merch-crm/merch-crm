"use client";

import React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoGlassInfoCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footerLabel?: React.ReactNode;
  className?: string;
}

export function BentoGlassInfoCard({
  title = "Система Аналитики",
  description = "Продвинутый движок аналитики, предоставляющий информацию в реальном времени для принятия бизнес-решений.",
  footerLabel = "Активный интеллект",
  className
}: BentoGlassInfoCardProps) {
  return (
    <div className={cn(
      "w-full max-w-sm h-52 rounded-card bg-gradient-to-br from-indigo-500/80 to-primary-base/80 p-1 flex items-center justify-center group overflow-hidden shadow-2xl",
      className
    )}>
      <div className="w-full h-full bg-white/10 backdrop-blur-3xl rounded-card p-8 flex flex-col justify-between border border-white/20 relative text-left">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[60px] rounded-full z-0" />
         
         <div className="relative z-10 flex justify-between items-start">
            <div className="size-12 rounded-element bg-white/10 flex items-center justify-center text-white">
               <Info className="size-6" />
            </div>
            <HelpCircle className="size-4 text-white/30 hover:text-white transition-colors cursor-pointer" aria-hidden="true" />
         </div>

         <div className="relative z-10 flex flex-col gap-3">
            <Typo as="h3" className="text-3xl font-black text-white leading-tight uppercase tracking-tight">
               {title}
            </Typo>
            <Typo as="p" className="text-[11px] font-black text-white/80 uppercase tracking-widest leading-relaxed">
               {description}
            </Typo>
         </div>

         <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2">
            <div className="size-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
            <Typo as="span" className="text-[11px] font-black text-white uppercase tracking-widest">
               {footerLabel}
            </Typo>
         </div>
      </div>
    </div>
  );
}
