"use client";

import React from 'react';
import { Info, HelpCircle } from 'lucide-react';

export function BentoGlassInfoCard() {
  return (
    <div className="w-full max-w-sm h-[320px] rounded-[32px] bg-gradient-to-br from-indigo-500/80 to-primary-base/80 p-1 flex items-center justify-center group overflow-hidden shadow-2xl">
      <div className="w-full h-full bg-white/10 backdrop-blur-3xl rounded-[30px] p-8 flex flex-col justify-between border border-white/20 relative">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[60px] rounded-full z-0" />
         
         <div className="relative z-10 flex justify-between items-start">
            <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
               <Info className="size-6" />
            </div>
            <HelpCircle className="size-4 text-white/30 hover:text-white transition-colors cursor-pointer" />
         </div>

         <div className="relative z-10 flex flex-col gap-3">
            <h3 className="text-3xl font-black text-white  leading-tight">Insight System</h3>
            <p className="text-sm font-bold text-white/80 leading-relaxed">
               Advanced analytics engine providing real-time intelligence for your business decisions.
            </p>
         </div>

         <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2">
            <div className="size-2 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-black text-white  ">Active Intelligence</span>
         </div>
      </div>
    </div>
  );
}
