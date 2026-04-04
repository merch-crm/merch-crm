"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoModalOverlayGrid() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="relative w-full max-w-4xl min-h-[500px] flex items-center justify-center p-8 bg-slate-900 rounded-[60px] overflow-hidden animate-pulse">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4">
           <div className="md:col-span-8 h-[400px] bg-white rounded-[48px]" />
           <div className="md:col-span-4 h-[400px] bg-white/5 rounded-[48px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-4xl min-h-[550px] flex items-center justify-center p-10 bg-slate-950 rounded-[64px] border border-slate-900 overflow-hidden group shadow-premium">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary-base/[0.03] blur-[150px] rounded-full" />
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary-base/[0.05] blur-[100px] rounded-full" />
      </div>

      {/* The "Modal" Grid */}
      <motion.div 
         initial={{ opacity: 0, scale: 0.98, y: 30 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         transition={{ type: "spring", damping: 30, stiffness: 200 }}
         className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-5"
      >
         {/* Main Card */}
         <div className="md:col-span-8 bg-white rounded-[52px] p-12 sm:p-14 flex flex-col justify-between min-h-[420px] shadow-2xl relative overflow-hidden group/card border border-slate-100">
            <button 
              type="button" 
              aria-label="Close modal"
              className="absolute top-10 right-10 size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-950 hover:bg-white hover:shadow-xl transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10"
            >
              <X className="size-5" />
            </button>
            <div className="flex flex-col gap-5">
               <div className="size-16 rounded-[28px] bg-slate-950 text-white flex items-center justify-center shadow-2xl border border-slate-800">
                  <Layers className="size-8" />
               </div>
               <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] leading-none pt-4">Matrix Core Configuration Consensus</h2>
               <div className="h-0.5 w-12 bg-primary-base/30 rounded-full" />
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight max-w-sm leading-[1.8] mt-2"> Adjusting the structural parameters of your crm intelligence core. These changes propagate through all neural nodes instantly.</p>
            </div>
            <div className="flex gap-4 pt-10 border-t border-slate-50">
               <button 
                 type="button"
                 aria-label="Commit changes to matrix"
                 className="px-10 py-5 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary-base transition-all active:scale-95 shadow-2xl shadow-black/20 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
               >
                 Apply Changes
               </button>
               <button 
                 type="button"
                 aria-label="Cancel and dismiss"
                 className="px-10 py-5 bg-slate-50 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 hover:border-slate-200 border border-transparent transition-all outline-none focus-visible:ring-4 focus-visible:ring-slate-100"
               >
                 Dismiss
               </button>
            </div>
         </div>

         {/* Stats Stack */}
         <div className="md:col-span-4 flex flex-col gap-5">
            <div className="bg-emerald-600 rounded-[52px] p-10 text-white flex flex-col gap-4 group/mini transition-transform border border-emerald-500 shadow-2xl shadow-emerald-500/10 cursor-default">
               <ShieldCheck className="size-10" />
               <div className="flex flex-col gap-2 pt-4">
                  <span className="text-3xl font-black uppercase tracking-tight leading-none">99.8%</span>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/50">Data Integrity</span>
               </div>
            </div>
            <div className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[52px] p-10 flex flex-col justify-between min-h-[180px] group/mini relative overflow-hidden transition-all hover:bg-white/10">
               <div className="absolute inset-0 bg-primary-base/5 opacity-0 group-hover/mini:opacity-100 transition-opacity duration-500" />
               <div className="flex flex-col gap-2 relative z-10 pt-2">
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-none">Neural Link</span>
                  <span className="text-[11px] font-black text-primary-base uppercase tracking-tight leading-none">Active System Status</span>
               </div>
               <button 
                 type="button"
                 className="flex items-center gap-3 text-[11px] font-black text-white/30 uppercase tracking-[0.15em] relative z-10 group-hover/mini:text-white transition-all outline-none focus-visible:underline"
               >
                  Check Console <ArrowRight className="size-3" />
               </button>
            </div>
         </div>
      </motion.div>
    </div>
  );
}
