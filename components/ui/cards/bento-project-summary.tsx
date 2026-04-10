"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Clock } from 'lucide-react';
import { Typo } from "@/components/ui/typo";
import { cn } from "@/lib/utils";

interface BentoProjectSummaryProps {
  title?: React.ReactNode;
  status?: React.ReactNode;
  description?: React.ReactNode;
  progress?: number;
  remainingDays?: React.ReactNode;
  className?: string;
}

export function BentoProjectSummary({
  title = "MerchCRM UI Kit",
  status = "В процессе",
  description = "Расширение 42 категорий премиальными Bento-системами.",
  progress = 85,
  remainingDays = "4 дня осталось",
  className
}: BentoProjectSummaryProps) {
  return (
    <div className={cn(
      "w-full max-w-sm rounded-card bg-slate-950 p-8 flex flex-col gap-3 relative overflow-hidden group border border-slate-800 shadow-crm-xl",
      className
    )}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-slate-400/10 blur-[60px] rounded-full group-hover:bg-slate-400/20 transition-colors" />
      
      <div className="flex justify-between items-start relative z-10">
         <div className="size-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
            <Layout className="size-6" />
         </div>
         <div className="flex flex-col items-end">
            <Typo as="span" className="text-xs font-black text-slate-500 tracking-tight mb-1.5 leading-none">
              Статус
            </Typo>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
               <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <Typo as="span" className="text-xs font-black text-emerald-500 tracking-tight leading-none">
                 {status}
               </Typo>
            </div>
         </div>
      </div>

      <div className="flex flex-col gap-1 mt-4 relative z-10">
         <Typo as="h3" className="text-xl font-black text-white tracking-tight leading-none">
           {title}
         </Typo>
         <Typo as="p" className="text-xs font-black text-slate-400 tracking-tight leading-relaxed mt-2">
           {description}
         </Typo>
      </div>

      <div className="space-y-3 pt-4 relative z-10">
         <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]" 
            />
         </div>
         <div className="flex justify-between text-xs font-black text-slate-500 tracking-tight leading-none">
            <Typo as="span">Общий прогресс</Typo>
            <Typo as="span" className="text-white">
              {progress}% Завершено
            </Typo>
         </div>
      </div>

      <div className="flex items-center justify-between pt-6 mt-2 border-t border-white/5 relative z-10">
         <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
               <div key={i} className="size-8 rounded-xl border-4 border-slate-950 bg-slate-800 flex items-center justify-center text-xs font-black text-white shadow-lg">
                  {i}
               </div>
            ))}
            <div className="size-8 rounded-xl border-4 border-slate-950 bg-slate-900 flex items-center justify-center text-xs font-black text-slate-500">
               +12
            </div>
         </div>
         <div className="flex items-center gap-2 text-xs font-black text-slate-500 tracking-tight leading-none">
            <Clock className="size-3" />
            <Typo as="span">{remainingDays}</Typo>
         </div>
      </div>
    </div>
  );
}
