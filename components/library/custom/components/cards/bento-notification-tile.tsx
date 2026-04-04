"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Info, Bell, CheckCircle2 } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoNotificationTile() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-sm h-64 rounded-[40px] bg-white border border-slate-100 shadow-crm-md animate-pulse" />;
  }

  return (
    <div className="w-full max-w-sm rounded-[40px] bg-white border border-slate-100 shadow-premium p-8 flex flex-col gap-6 group/card hover:border-primary-base/30 transition-all duration-500">
      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-3">
            <Bell className="size-4 text-slate-400" />
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">Alert Matrix</h3>
         </div>
         <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full border border-rose-100">
            <div className="size-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest leading-none">2 New</span>
         </div>
      </div>

      <div className="space-y-3" role="log" aria-label="Recent system notifications">
         {[
           { icon: UserPlus, text: "TEAM NODE JOINED", time: "2M", color: "text-primary-base", bg: "bg-primary-base/5", border: "border-primary-base/10" },
           { icon: Info, text: "MATRIX UPDATE SCHED", time: "1H", color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" }
         ].map((n, i) => (
            <motion.button 
               key={i}
               type="button"
               aria-label={`Notification: ${n.text} received ${n.time} ago`}
               initial={{ x: -10, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: i * 0.1, duration: 0.5 }}
               className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-xl hover:border-primary-base/20 transition-all cursor-pointer w-full text-left outline-none focus-visible:ring-4 focus-visible:ring-primary-base/5 group/item"
            >
               <div className="flex items-center gap-4">
                  <div className={cn("size-10 rounded-xl flex items-center justify-center transition-all group-hover/item:scale-110 group-hover/item:rotate-6 border shadow-sm", n.bg, n.color, n.border)}>
                     <n.icon className="size-5" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">{n.text}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight leading-none tabular-nums opacity-60">{n.time} AGO</span>
                  </div>
               </div>
               <CheckCircle2 className="size-4 text-slate-200 group-hover/item:text-primary-base transition-colors" />
            </motion.button>
         ))}
      </div>

      <button 
        type="button"
        aria-label="Flush all active alerts"
        className="w-full py-4 text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-slate-900 transition-colors focus:outline-none focus:text-slate-900 active:scale-95 border-t border-slate-50 mt-2"
      >
         Flush Alert Buffer
      </button>

    </div>
  );
}
