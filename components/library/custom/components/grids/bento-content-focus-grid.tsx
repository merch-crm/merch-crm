"use client";

import React, { useState, useEffect } from 'react';
import { Maximize2, Share2, Bookmark } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoContentFocusGrid() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-4 p-8 bg-white rounded-[48px] border border-slate-100 shadow-crm-md animate-pulse">
        <div className="md:col-span-4 h-[400px] rounded-[40px] bg-slate-50" />
        <div className="md:col-span-8 h-[400px] rounded-[40px] bg-slate-50" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-5 p-8 bg-white rounded-[48px] border border-slate-100 shadow-crm-md group/main">
      {/* Sidebar Focus */}
      <div className="md:col-span-4 flex flex-col gap-4">
         <div className="p-10 bg-slate-950 rounded-[40px] text-white flex flex-col gap-4 relative overflow-hidden group/sidebar shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-base/20 blur-[60px] rounded-full" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] leading-none text-white/90">Meta Index</h3>
            <p className="text-[11px] text-white/30 font-black uppercase tracking-tight">Classification: Level 4 Secure</p>
            <div className="space-y-3 mt-6">
               {[1,2,3].map(i => (
                  <div key={i} className="h-1.5 bg-white/5 rounded-full w-full" />
               ))}
               <div className="h-1.5 bg-white/5 rounded-full w-[60%]" />
            </div>
         </div>
         <button 
           type="button"
           aria-label="Download full report"
           className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center justify-between group/dl hover:bg-white hover:border-primary-base/30 hover:shadow-xl transition-all duration-500 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10"
         >
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover/dl:text-primary-base transition-colors leading-none">Download Report</span>
            <Maximize2 className="size-4 text-slate-300 group-hover/dl:text-primary-base transition-colors" />
         </button>
      </div>

      {/* Main Content Focus */}
      <div className="md:col-span-8 bg-slate-50 rounded-[40px] p-12 flex flex-col justify-between items-start min-h-[450px] border border-slate-100 group/content relative shadow-inner overflow-hidden">
         <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-base/5 blur-[80px] rounded-full -z-0" />
         
         <div className="flex flex-col gap-5 relative z-10 w-full">
            <div className="flex justify-between items-start">
               <div className="px-4 py-2 bg-white rounded-2xl border border-slate-100 text-[11px] font-black text-primary-base uppercase tracking-widest shadow-sm">Analysis V.4</div>
               <div className="flex gap-4">
                  <button type="button" aria-label="Share insight" className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:shadow-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-base">
                    <Share2 className="size-4" />
                  </button>
                  <button type="button" aria-label="Bookmark for later" className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 hover:text-slate-900 hover:shadow-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary-base">
                    <Bookmark className="size-4" />
                  </button>
               </div>
            </div>
            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] leading-[1.5] max-w-xs pt-4">Architectural Intelligence Core Consensus</h2>
            <div className="h-0.5 w-12 bg-primary-base/30 rounded-full" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-tight leading-[1.8] max-w-sm mt-2">
               The structural integrity of your crm environment is monitored by a distributed lattice of ai agents. Real-time consensus module ensures 100% data fidelity.
            </p>
         </div>

         <div className="w-full flex items-center justify-between relative z-10 mt-12 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white shadow-sm">
            <button 
              type="button"
              className="px-10 py-5 bg-slate-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary-base transition-all shadow-2xl active:scale-95 outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
            >
              Activate Neural Core
            </button>
            <div className="flex -space-x-3 pr-2">
               {[1,2,3,4].map(i => (
                  <div key={i} className="size-10 rounded-xl border-4 border-white bg-slate-200 shadow-sm transition-transform hover:scale-110 cursor-help" title={`Agent Node ${i}`} />
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
