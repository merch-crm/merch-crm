"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Activity, Zap, HardDrive, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Typo } from "@/components/ui/typo";

export function BentoAuditLogMini() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logs = [
    { id: 1, user: "admin.root", action: "Распространение узлов", date: "2 мин", type: 'system', icon: Cpu },
    { id: 2, user: "l.molchanov", action: "Очистка данных", date: "14 мин", type: 'delete', icon: HardDrive },
    { id: 3, user: "neural_net", action: "Ротация протокола", date: "1 ч", type: 'security', icon: Shield },
    { id: 4, user: "j.smith.alpha", action: "Экспорт отчёта", date: "3 ч", type: 'export', icon: Zap },
  ];

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-[400px] rounded-card bg-white border border-slate-100 shadow-premium animate-pulse p-10" />
    );
  }

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-slate-100 shadow-premium p-10 flex flex-col gap-8 group/card hover:border-slate-200 transition-all duration-700 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover/card:bg-blue-600/10 transition-colors duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-element bg-blue-600/10 text-blue-600">
            <Activity className="size-4 animate-pulse" />
          </div>
          <Typo as="h3" className="text-[12px] font-black text-slate-900 tracking-normal leading-none uppercase">Журнал событий</Typo>
        </div>
        <div className="flex items-center gap-2">
           <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <Typo className="text-[10px] font-black text-emerald-500 tracking-normal leading-none uppercase">Live</Typo>
        </div>
      </div>

      <div className="flex flex-col gap-1 relative z-10" role="log" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {logs.map((log, i) => (
            <motion.button
              key={log.id}
              type="button"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring", damping: 15 }}
              whileHover={{ x: 8 }}
              className="group/item flex items-center gap-5 py-2 px-4 rounded-card transition-all border border-transparent hover:border-slate-100 hover:bg-slate-50/50 outline-none focus-visible:ring-4 focus-visible:ring-blue-600/10 text-left"
            >
              <div className={cn(
                "size-12 rounded-element flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-6",
                log.type === 'delete' ? "bg-rose-50 text-rose-500 border border-rose-500/10" : 
                log.type === 'security' ? "bg-slate-900 text-white shadow-lg shadow-black/10" :
                "bg-slate-50 text-slate-900 border border-slate-100"
              )}>
                <log.icon className="size-5" />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                 <div className="flex justify-between items-center gap-2">
                     <Typo className="text-[11px] font-black text-slate-900 tracking-normal truncate leading-none uppercase">{log.action}</Typo>
                 </div>
                 <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="size-1 rounded-full bg-slate-300" />
                       <Typo className="text-[10px] font-black text-slate-400 tracking-normal leading-none">{log.user}</Typo>
                    </div>
                    <Typo className="text-[9px] font-black text-slate-300 tracking-normal tabular-nums leading-none whitespace-nowrap">{log.date}</Typo>
                 </div>
              </div>

              <div className="opacity-0 group-hover/item:opacity-100 transition-all duration-500 -translate-x-2 group-hover/item:translate-x-0">
                <ArrowRight className="size-4 text-blue-600" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        aria-label="Открыть полный журнал аудита"
        className="mt-6 w-full h-11 rounded-full bg-blue-600/5 text-blue-600 border border-blue-600/10 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-[11px] font-black tracking-normal uppercase transition-all duration-300 outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
      >
        <Typo>Открыть архив</Typo>
      </motion.button>
    </div>
  );
}
