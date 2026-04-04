"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export function BentoFeatureHighlight() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-emerald-500 p-8 flex flex-col justify-between min-h-[320px] group relative overflow-hidden">
      <div className="absolute -top-12 -right-12 size-48 bg-white/20 blur-[60px] rounded-full group-hover:scale-125 transition-transform duration-700" />
      
      <div className="relative z-10 flex flex-col gap-3">
         <div className="size-16 rounded-[24px] bg-white flex items-center justify-center text-emerald-600 shadow-xl">
            <Zap className="size-8 fill-emerald-600" />
         </div>
         
         <div className="flex flex-col gap-3">
            <h3 className="text-3xl font-black text-white  leading-tight">Instant Sync Architecture</h3>
            <p className="text-sm font-bold text-white/80 leading-relaxed">
               Every update propagates across all CRM nodes in less than 45ms. Zero lag, zero data loss.
            </p>
         </div>
      </div>

      <div className="relative z-10 flex items-center gap-2 group-hover:gap-3 transition-all duration-300 cursor-pointer">
         <span className="text-xs font-black text-white   border-b border-white pb-1">Master Tech Specs</span>
         <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Zap className="size-4 text-white" />
         </motion.div>
      </div>
    </div>
  );
}
