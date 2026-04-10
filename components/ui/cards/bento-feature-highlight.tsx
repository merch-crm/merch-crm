"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Layout } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Typo } from "@/components/ui/typo";

interface BentoFeatureHighlightProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  ctaText?: React.ReactNode;
  className?: string;
}

export function BentoFeatureHighlight({ 
  title = "Мгновенная синхронизация",
  description = "Каждое обновление распространяется по всем узлам CRM менее чем за 45 мс. Нулевая задержка, полная сохранность данных.",
  ctaText = "Техническая спецификация",
  className 
}: BentoFeatureHighlightProps) {
  return (
    <div className={cn(
      "w-full max-w-sm rounded-card bg-slate-950 p-8 flex flex-col justify-between min-h-[320px] group relative overflow-hidden border border-slate-800 shadow-crm-xl",
      className
    )}>
      <div className="absolute -top-12 -right-12 size-48 bg-emerald-500/10 blur-[60px] rounded-full group-hover:scale-125 group-hover:bg-emerald-500/20 transition-all duration-700" />
      
      <div className="flex flex-col gap-8 relative z-10">
         <div className="size-16 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-emerald-500 shadow-xl">
            <Layout className="size-8" />
         </div>
         <div className="flex flex-col gap-3">
            <Typo as="h3" className="text-3xl font-black text-white leading-tight tracking-tight">{title}</Typo>
            <Typo as="p" className="text-xs font-black text-slate-400 tracking-tight leading-relaxed">
               {description}
            </Typo>
         </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 group-hover:gap-3 transition-all duration-300 cursor-pointer pt-6 border-t border-white/5">
         <Typo as="span" className="text-xs font-black text-emerald-500 tracking-tight border-b border-emerald-500/30 pb-1">{ctaText}</Typo>
         <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Zap className="size-4 text-emerald-500" />
         </motion.div>
      </div>
    </div>
  );
}
