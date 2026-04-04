"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Key } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoInteractiveFlipCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full max-w-sm h-80 rounded-[48px] bg-slate-950 animate-pulse flex items-center justify-center">
        <Lock className="size-10 text-slate-800" />
      </div>
    );
  }

  return (
    <button 
      type="button"
      aria-label={isFlipped ? "Hide sensitive details" : "Reveal secured data details"}
      aria-expanded={isFlipped}
      className="w-full max-w-sm h-80 cursor-pointer group [perspective:2000px] bg-transparent border-none p-0 appearance-none outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20 rounded-[48px] text-left transition-all active:scale-95"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 200, damping: 25 }}
        className="relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d]"
      >
        {/* Front */}
        <div className="absolute inset-0 w-full h-full rounded-[48px] bg-slate-950 flex flex-col items-center justify-center p-10 [backface-visibility:hidden] overflow-hidden border border-slate-900 shadow-2xl">
           <div className="size-20 rounded-[32px] bg-primary-base/5 border border-primary-base/10 text-primary-base flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
              <Shield className="size-10" />
           </div>
           <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] leading-none mb-4">Secured Matrix</h3>
           <p className="text-[11px] font-black text-slate-500 uppercase tracking-tight leading-none group-hover:text-primary-base transition-colors duration-500">
              Click to Decrypt Details
           </p>
           
           <div className="absolute inset-0 bg-gradient-to-br from-primary-base/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           <div className="absolute -bottom-10 -right-10 size-40 bg-primary-base/5 blur-[50px] rounded-full" />
        </div>

        {/* Back */}
        <div className="absolute inset-0 w-full h-full rounded-[48px] bg-white border border-slate-100 shadow-premium flex flex-col items-center justify-center p-10 [backface-visibility:hidden] [transform:rotateY(180deg)] text-slate-900">
           <div className="size-16 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
              <Key className="size-8" />
           </div>
           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] leading-none mb-6">Validation Successful</h3>
           <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 w-full text-[10px] font-black uppercase tracking-widest leading-loose text-slate-500 relative overflow-hidden group-hover:shadow-inner transition-shadow shadow-sm">
              <div className="absolute top-0 right-0 p-2 opacity-10"><Shield className="size-12" /></div>
              NODE: CRM_ALPHA_99<br/>
              KEY: **********<br/>
              PHASE: ACTIVE_FLOW
           </div>
           <div className="mt-8 text-[11px] font-black text-slate-300 uppercase tracking-widest group-hover:text-slate-900 transition-colors border-t border-slate-50 pt-4 w-full">
              Hide Sensitive
           </div>
        </div>
      </motion.div>
    </button>
  );
}
