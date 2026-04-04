"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Target } from 'lucide-react';

export function BentoSplitActionLayout() {
  return (
    <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Left Action */}
      <motion.div 
        whileHover={{ scale: 0.98 }}
        className="rounded-[32px] bg-emerald-500 p-8 flex flex-col justify-between min-h-[280px] cursor-pointer group relative overflow-hidden"
      >
         <div className="absolute -bottom-10 -right-10 size-40 bg-white/20 blur-3xl rounded-full" />
         <div className="size-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-xl relative z-10">
            <Zap className="size-6 fill-emerald-600" />
         </div>
         <div className="relative z-10">
            <h3 className="text-2xl font-black text-white ">Deploy Instant</h3>
            <p className="text-white/70 text-xs font-bold mt-2">Push updates to all CRM nodes with zero latency.</p>
         </div>
         <div className="flex items-center gap-2 text-[11px] font-black text-white   pt-4 relative z-10">
            Learn More <ArrowRight className="size-3" />
         </div>
      </motion.div>

      {/* Right Action */}
      <motion.div 
        whileHover={{ scale: 0.98 }}
        className="rounded-[32px] bg-slate-900 border border-slate-800 p-8 flex flex-col justify-between min-h-[280px] cursor-pointer group relative overflow-hidden text-white"
      >
         <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary-base relative z-10">
            <Target className="size-6" />
         </div>
         <div className="relative z-10">
            <h3 className="text-2xl font-black ">Strategy Mode</h3>
            <p className="text-white/40 text-xs font-bold mt-2">Deeper analytics for long-term growth planning.</p>
         </div>
         <div className="flex items-center gap-2 text-[11px] font-black text-primary-base   pt-4 relative z-10">
            Analyze Now <ArrowRight className="size-3" />
         </div>
      </motion.div>
    </div>
  );
}
