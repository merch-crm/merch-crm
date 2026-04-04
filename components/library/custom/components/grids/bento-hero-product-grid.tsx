"use client";

import React, { useState, useEffect } from 'react';
import { Star, ArrowUpRight, Zap } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoHeroProductGrid() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch animate-pulse">
        <div className="md:col-span-7 h-[500px] bg-slate-50 rounded-[48px]" />
        <div className="md:col-span-5 h-[500px] flex flex-col gap-4">
          <div className="bg-slate-900 h-1/2 rounded-[48px]" />
          <div className="bg-emerald-500 h-1/2 rounded-[48px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch p-2 bg-slate-100 rounded-[60px] border border-slate-200 shadow-premium">
      {/* Main Focus Feature */}
      <div className="md:col-span-7 bg-white rounded-[52px] border border-slate-50 p-12 sm:p-14 flex flex-col justify-between shadow-crm-md group/main relative overflow-hidden">
         <div className="absolute top-0 right-0 p-10">
            <div className="size-20 rounded-[32px] bg-primary-base/5 text-primary-base flex items-center justify-center font-black uppercase tracking-widest text-[11px] border border-primary-base/10 shadow-sm transition-transform group-hover/main:rotate-6">V.II</div>
         </div>
         <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-950 w-fit shadow-lg shadow-black/10">
               <Star className="size-3 text-amber-400 fill-amber-400" />
               <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-none">Industry Standard</span>
            </div>
            <h1 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] leading-[1.5] max-w-sm pt-4">Matrix Node Alpha Infrastructure</h1>
            <div className="h-0.5 w-12 bg-primary-base/30 rounded-full" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight leading-[1.8] max-w-xs mt-2">
               The core processing lattice for your mission critical business intelligence infrastructure. Distributed redundancy at scale.
            </p>
         </div>
         <div className="flex items-center gap-6 mt-12 relative z-10 pt-8 border-t border-slate-50">
            <button 
              type="button"
              className="px-10 py-5 bg-primary-base text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:shadow-primary-base/30 transition-all hover:bg-slate-900 active:scale-95 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
            >
              Explore Model
            </button>
            <div className="flex flex-col gap-2">
               <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none">Node Costing</span>
               <span className="text-[11px] font-black text-slate-950 uppercase tracking-[0.1em] px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">$4,250 / Node</span>
            </div>
         </div>
      </div>

      {/* Side Action Stack */}
      <div className="md:col-span-5 flex flex-col gap-5">
         <div className="bg-slate-950 rounded-[52px] p-10 h-full flex flex-col justify-between text-white relative overflow-hidden group/sync shadow-2xl border border-slate-900 transition-all hover:border-primary-base/30">
            <div className="absolute -bottom-20 -right-20 size-64 bg-primary-base opacity-10 blur-[100px] transition-transform duration-700 group-hover/sync:scale-150" />
            <div className="flex justify-between items-start relative z-10">
               <div className="size-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-primary-base transition-all group-hover/sync:rotate-6 group-hover/sync:scale-110">
                  <Zap className="size-7 fill-primary-base" />
               </div>
               <button type="button" aria-label="Open sync details" className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-base">
                  <ArrowUpRight className="size-5" />
               </button>
            </div>
            <div className="flex flex-col gap-2 relative z-10">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] leading-none text-white/90">Neural Sync</h3>
               <p className="text-white/30 text-[11px] font-black uppercase tracking-tight leading-none">45ms Edge Propagation Layer</p>
            </div>
         </div>
         
         <div className="bg-emerald-600 rounded-[52px] p-10 h-full flex flex-col justify-between text-white group/elite overflow-hidden shadow-2xl shadow-emerald-500/10 border border-emerald-500 hover:border-white transition-all">
            <div className="flex items-center gap-3 pt-1">
               <div className="size-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_white]" />
               <span className="text-[11px] font-black uppercase tracking-widest leading-none">Global Status: Active</span>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] leading-none pt-8">Elite Reach Reach</h3>
            <p className="text-white/80 text-[11px] font-black uppercase tracking-tight leading-[1.8] mt-4 border-t border-emerald-500 pt-4">
               Your data, synchronized in 24 regions under persistent machine audit. Zero latency worldwide.
            </p>
         </div>
      </div>
    </div>
  );
}
