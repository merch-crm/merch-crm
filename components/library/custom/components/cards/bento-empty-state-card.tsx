"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Database, Inbox } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoEmptyStateCard() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-80 rounded-[48px] bg-white border-2 border-dashed border-slate-100 flex items-center justify-center animate-pulse">
        <div className="size-16 rounded-[28px] bg-slate-50" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-[48px] bg-white border-2 border-dashed border-slate-100 p-10 flex flex-col items-center justify-center gap-5 min-h-[350px] group/card hover:border-primary-base transition-all duration-700 relative overflow-hidden shadow-sm hover:shadow-premium">
      <div className="size-24 rounded-[36px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover/card:text-primary-base group-hover/card:bg-white group-hover/card:border-primary-base/20 group-hover/card:shadow-2xl transition-all duration-700 relative z-10">
         <div className="absolute inset-0 bg-primary-base/5 blur-[20px] opacity-0 group-hover/card:opacity-100 transition-opacity" />
         <Inbox className="size-10 group-hover/card:scale-110 group-hover/card:-rotate-6 transition-all duration-500 relative z-10" aria-hidden="true" />
      </div>
      
      <div className="text-center mt-2 relative z-10">
         <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">Intelligence Void</h3>
         <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight mt-3 max-w-[220px] mx-auto leading-relaxed">
            Your asset matrix is currently offline. Synchronize your first bulk data set to begin operations.
         </p>
      </div>

      <button 
        type="button" 
        aria-label="Synchronize first data set"
        className="mt-6 flex items-center gap-3 px-10 py-5 rounded-2xl bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary-base transition-all shadow-2xl shadow-black/20 hover:shadow-primary-base/30 group/btn outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20 active:scale-95 relative z-10"
      >
         <Plus className="size-4 group-hover/btn:rotate-90 transition-transform duration-500" />
         Import Assets
      </button>

      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary-base/5 opacity-0 group-hover/card:opacity-100 transition-opacity rounded-[48px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 size-40 bg-primary-base/[0.02] blur-[40px] rounded-full pointer-events-none" />
    </div>
  );
}
