"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, User, Edit3, Shield, ArrowRight, Activity, Zap, HardDrive, Cpu } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoAuditLogMini() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const logs = [
    { id: 1, user: 'admin.root', action: 'NODE_PROPAGATION_ACTIVE', date: '2M AGO', type: 'system', icon: Cpu },
    { id: 2, user: 'l.molchanov', action: 'ENCRYPTED_DATA_PURGE', date: '14M AGO', type: 'delete', icon: HardDrive },
    { id: 3, user: 'neural_net', action: 'SECURITY_PROTOCOL_ROTATED', date: '1H AGO', type: 'security', icon: Shield },
    { id: 4, user: 'j.smith.alpha', action: 'QUANTUM_REPORT_EXPORT', date: '3H AGO', type: 'export', icon: Zap },
  ];

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-[400px] rounded-[48px] bg-white border border-slate-100 shadow-premium animate-pulse p-10" />
    );
  }

  return (
    <div className="w-full max-w-sm rounded-[48px] bg-white border border-slate-100 shadow-premium p-10 flex flex-col gap-8 group/card hover:border-primary-base/30 transition-all duration-700 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-base/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover/card:bg-primary-base/10 transition-colors duration-700" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary-base/10 text-primary-base">
            <Activity className="size-4 animate-pulse" />
          </div>
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">Log Stream</h3>
        </div>
        <div className="flex items-center gap-2">
           <div className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] leading-none">Live</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 relative z-10" role="log" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {logs.map((log, i) => (
            <motion.button
              key={log.id}
              type="button"
              aria-label={`Audit log generated: ${log.action} executed by ${log.user} precisely ${log.date}.`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, type: "spring", damping: 15 }}
              whileHover={{ x: 8 }}
              className="group/item flex items-center gap-5 p-4 rounded-3xl transition-all border border-transparent hover:border-slate-100 hover:bg-slate-50/50 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10 text-left"
            >
              <div className={cn(
                "size-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-6",
                log.type === 'delete' ? "bg-rose-50 text-rose-500 border border-rose-500/10" : 
                log.type === 'security' ? "bg-slate-950 text-white shadow-xl shadow-black/20" :
                "bg-slate-50 text-slate-900 border border-slate-100"
              )}>
                <log.icon className="size-5" />
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                 <div className="flex justify-between items-center gap-2">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em] truncate leading-none">{log.action}</span>
                 </div>
                 <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="size-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{log.user}</span>
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter tabular-nums leading-none">{log.date}</span>
                 </div>
              </div>

              <div className="opacity-0 group-hover/item:opacity-100 transition-all duration-500 -translate-x-2 group-hover/item:translate-x-0">
                <ArrowRight className="size-4 text-primary-base" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        aria-label="Access comprehensive full-spectrum system audit log"
        className="mt-4 w-full h-14 rounded-2xl border-2 border-slate-50 bg-slate-50 text-slate-400 hover:text-slate-950 hover:bg-white hover:border-slate-100 text-[11px] font-black uppercase tracking-[0.3em] transition-all outline-none focus-visible:ring-4 focus-visible:ring-slate-100 shadow-inner hover:shadow-premium"
      >
        Access Archive
      </motion.button>
    </div>
  );
}
