"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingCart, Tag, Laptop } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoProductShowcase() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-96 rounded-[48px] bg-white border border-slate-100 shadow-crm-md animate-pulse p-4">
        <div className="bg-slate-50 h-56 rounded-[36px]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-[48px] bg-white border border-slate-100 shadow-premium p-3 group/card relative overflow-hidden hover:border-primary-base/30 transition-all duration-700">
      <div className="bg-slate-50 rounded-[38px] h-56 flex items-center justify-center relative overflow-hidden border border-slate-50/50 shadow-inner">
         <div className="absolute inset-0 bg-gradient-to-br from-primary-base/5 via-transparent to-slate-900/5 z-0 opacity-50" />
         <motion.div 
            whileHover={{ scale: 1.05, rotate: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="size-36 bg-slate-950 rounded-[40px] flex items-center justify-center text-white relative z-10 shadow-2xl border-4 border-white/90"
         >
            <div className="absolute inset-0 bg-primary-base/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 rounded-[36px]" />
            <Laptop className="size-12 text-white/90 relative z-10" />
            <div className="absolute bottom-4 right-4"><div className="size-2 rounded-full bg-primary-base animate-pulse shadow-[0_0_8px_rgba(var(--primary-base),0.6)]" /></div>
         </motion.div>
         {/* Texture overlay */}
         <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay" />
      </div>

      <div className="p-8 flex flex-col gap-6">
         <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
               <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] leading-none">MATRIX NODE PRO</h3>
               <div className="flex items-center gap-2">
                  <Tag className="size-3 text-primary-base" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Limited Distribution</p>
               </div>
            </div>
            <div className="flex flex-col items-end gap-2">
               <span className="text-[11px] font-black text-slate-950 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg uppercase tracking-tight tabular-nums shadow-sm">$2,499</span>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">System Unit</span>
            </div>
         </div>

         <button 
           type="button" 
           aria-label="Secure purchase Matrix Node Pro for $2,499"
           className="w-full py-5 rounded-2xl bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary-base transition-all shadow-2xl shadow-black/20 hover:shadow-primary-base/30 group/btn outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20 active:scale-95 border border-slate-900"
         >
            <ShoppingCart className="size-4 group-hover/btn:-translate-y-0.5 transition-transform" />
            Commit Order
            <ArrowRight className="size-4 group-hover/btn:translate-x-1.5 transition-transform" />
         </button>
      </div>
      
      <div className="absolute -bottom-10 -left-10 size-40 bg-primary-base/[0.02] blur-[40px] rounded-full pointer-events-none" />
    </div>
  );
}
