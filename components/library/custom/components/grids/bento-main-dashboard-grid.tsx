"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/components/library/custom/utils/cn';
import { TrendingUp, Users, Zap, Download, Database, Layers, ArrowUpRight } from 'lucide-react';

export function BentoMainDashboardGrid() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 p-10 bg-slate-50/50 rounded-[56px] border border-slate-100 animate-pulse">
        <div className="md:col-span-2 md:row-span-2 rounded-[48px] bg-white border border-slate-100 shadow-sm" />
        <div className="md:col-span-1 rounded-[48px] bg-white border border-slate-100 shadow-sm" />
        <div className="md:col-span-1 rounded-[48px] bg-white border border-slate-100 shadow-sm" />
        <div className="md:col-span-2 rounded-[48px] bg-white border border-slate-100 shadow-sm" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 p-10 bg-slate-50/30 rounded-[56px] border border-slate-100 shadow-inner overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-base/[0.03] rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/[0.03] rounded-full blur-[100px] -ml-48 -mb-48 pointer-events-none" />

      {/* Primary Analytics Core (Tall Card) */}
      <div className="md:col-span-2 md:row-span-2 rounded-[48px] bg-slate-950 p-12 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden group/tall border border-white/5">
         <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-base/20 blur-[100px] rounded-full transition-all duration-1000 group-hover/tall:scale-125 group-hover/tall:bg-primary-base/30" />
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50" />
         
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <TrendingUp className="size-5 text-primary-base" />
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-white leading-none">Neural Insights</h3>
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/40 leading-relaxed max-w-[260px]">
              Advanced heuristic scaling active across all revenue propagation channels.
            </p>
         </div>

         <div className="relative z-10 flex flex-col gap-6">
            <div className="flex justify-between items-end mb-2">
              <div className="flex flex-col gap-1">
                 <span className="text-[28px] font-black text-white tabular-nums leading-none">65.2%</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Target Vector Completion</span>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <div className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                 Synchronized
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner p-[1px]">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: '65.2%' }} 
                 transition={{ duration: 2, ease: "circOut", delay: 0.2 }}
                 className="h-full bg-gradient-to-r from-primary-base to-indigo-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] relative" 
               >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer bg-[length:200%_100%]" />
               </motion.div>
            </div>
         </div>
      </div>

      {/* Metric Node 01 */}
      <div className="md:col-span-1 rounded-[48px] bg-white border border-slate-100 p-10 flex flex-col justify-between items-start shadow-premium hover:shadow-2xl hover:border-primary-base/20 transition-all duration-500 group/s1 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover/s1:text-primary-base transition-colors duration-500">
           <Users className="size-10 group-hover/s1:scale-110 transition-transform duration-700" />
         </div>
         <span className="text-4xl font-black text-slate-950 tabular-nums relative z-10">42</span>
         <div className="relative z-10 flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Active Nodes</span>
            <div className="flex items-center gap-1.5">
               <ArrowUpRight className="size-3 text-emerald-500" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">+4.2%</span>
            </div>
         </div>
      </div>

      {/* Metric Node 02 */}
      <div className="md:col-span-1 rounded-[48px] bg-white border border-slate-100 p-10 flex flex-col justify-between items-start shadow-premium hover:shadow-2xl hover:border-emerald-500/20 transition-all duration-500 group/s2 overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 text-slate-50 group-hover/s2:text-emerald-500 transition-colors duration-500">
           <Zap className="size-10 group-hover/s2:scale-110 transition-transform duration-700" />
         </div>
         <span className="text-4xl font-black text-slate-950 tabular-nums relative z-10">12%</span>
         <div className="relative z-10 flex flex-col gap-2">
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Flux Conversion</span>
            <div className="flex items-center gap-1.5">
               <ArrowUpRight className="size-3 text-emerald-500" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Peak Stable</span>
            </div>
         </div>
      </div>

      {/* Operation Control (Wide Card) */}
      <div className="md:col-span-2 rounded-[48px] bg-indigo-600 p-10 flex items-center justify-between shadow-2xl relative overflow-hidden group/wide border border-indigo-500">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-indigo-700 pointer-events-none" />
         <div className="absolute -bottom-10 -right-10 size-40 bg-white/10 blur-[40px] rounded-full group-hover/wide:scale-125 transition-transform duration-1000" />
         
         <div className="flex items-center gap-6 relative z-10">
            <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
               <Database className="size-6 text-white" />
            </div>
            <div className="flex flex-col gap-2">
               <h4 className="text-white font-black text-[12px] uppercase tracking-[0.3em] leading-none">Matrix Export</h4>
               <p className="text-white/50 text-[10px] font-black uppercase tracking-widest leading-none">3.2GB Payload Ready</p>
            </div>
         </div>
         
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           type="button"
           aria-label="Secure transmit export batch"
           className="h-14 px-10 bg-white text-indigo-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] relative z-10 transition-all hover:bg-slate-950 hover:text-white hover:shadow-2xl active:scale-95 outline-none focus-visible:ring-4 focus-visible:ring-white/30 shadow-xl border border-transparent hover:border-white/10"
         >
           Deploy
         </motion.button>
      </div>
    </div>
  );
}
