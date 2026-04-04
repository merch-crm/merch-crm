"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Database, Cloud, Activity, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';
import { BentoCard, BentoIconContainer } from '../../ui/bento-primitives';

export function BentoSyncNode({
  source = "CRM DB",
  target = "Cloud Storage",
  status = "synced"
}: {
  source?: string;
  target?: string;
  status?: 'synced' | 'syncing' | 'error';
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
       <div className="w-full max-w-sm h-72 rounded-[3rem] bg-slate-50 border border-slate-100 animate-pulse" />
    );
  }

  const statusMeta = {
    synced: { label: "ACTIVE LINK", color: "text-emerald-500 bg-emerald-50 border-emerald-100", icon: <ShieldCheck className="size-3 fill-emerald-100" /> },
    syncing: { label: "UPDATING ARC", color: "text-amber-500 bg-amber-50 border-amber-100", icon: <RefreshCw className="size-3 animate-spin" /> },
    error: { label: "LINK FAILURE", color: "text-rose-500 bg-rose-50 border-rose-100", icon: <Zap className="size-3 fill-rose-100" /> },
  };

  return (
    <BentoCard className="w-full max-w-sm p-8 flex flex-col gap-8 group/card transition-all duration-700 hover:shadow-2xl overflow-hidden relative">
      <div className="flex items-center justify-between relative z-10">
         <div className="flex items-center gap-3">
            <BentoIconContainer className="size-8 bg-slate-950 text-white shadow-lg shadow-black/20">
               <Activity className="size-4" />
            </BentoIconContainer>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">Sync Node Matrix</h3>
         </div>
         <div 
           role="status"
           aria-live="polite"
           className={cn(
             "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-2",
             statusMeta[status].color
           )}
         >
           {statusMeta[status].icon} {statusMeta[status].label}
         </div>
      </div>

      <div className="flex items-center justify-around relative py-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-1 bg-slate-50 overflow-hidden rounded-full shadow-inner border border-black/5">
           <motion.div 
             animate={{ x: [-200, 300] }}
             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
             className="w-1/2 h-full bg-primary-base shadow-[0_0_20px_rgba(59,130,246,1)]"
           />
        </div>

        <div className="relative group/db">
           <div className="size-20 rounded-[1.75rem] bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover/db:text-primary-base group-hover/db:scale-110 group-hover/db:shadow-2xl transition-all duration-500 relative z-10 outline-none focus-within:ring-4 focus-within:ring-primary-base/10">
              <Database className="size-10 stroke-[1.5]" />
           </div>
           <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-950 uppercase tracking-widest tabular-nums transition-all duration-500">{source}</span>
        </div>

        <div className="z-20 relative group-hover/card:rotate-180 transition-transform duration-700">
           <div className="size-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-2xl shadow-black/40 border border-slate-800">
              <RefreshCw className={cn("size-6", status === 'syncing' && "animate-spin")} />
           </div>
        </div>

        <div className="relative group/cloud">
           <div className="size-20 rounded-[1.75rem] bg-white shadow-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover/cloud:text-sky-500 group-hover/cloud:scale-110 group-hover/cloud:shadow-2xl transition-all duration-500 relative z-10 outline-none focus-within:ring-4 focus-within:ring-sky-500/10">
              <Cloud className="size-10 stroke-[1.5]" />
           </div>
           <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-950 uppercase tracking-widest tabular-nums transition-all duration-500">{target}</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-end relative z-10">
         <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Last Archive Point</span>
            <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest leading-none">TODAY // 14:48 ARC</span>
         </div>
         <button 
           type="button"
           aria-label="Reconfigure node linkage"
           className="text-[10px] font-black text-primary-base uppercase tracking-widest bg-primary-base/5 px-4 py-2 rounded-full border border-primary-base/10 hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all duration-500 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
         >
           Settings
         </button>
      </div>

      <div className="absolute -right-24 -bottom-24 size-64 bg-primary-base/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary-base/10 transition-colors duration-1000" />
    </BentoCard>
  );
}
