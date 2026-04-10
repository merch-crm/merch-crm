"use client";

import React from 'react';
import { Quote } from 'lucide-react';

export function BentoGlassBlockquote() {
  return (
    <div className="w-full max-w-sm rounded-card bg-gradient-to-br from-indigo-500 to-primary-base p-8 flex flex-col gap-3 relative overflow-hidden group">
      {/* Glass overlay */}
      <div className="absolute inset-2 rounded-element bg-white/10 backdrop-blur-md border border-white/20 z-0" />
      
      <div className="relative z-10">
         <Quote className="size-8 text-white/40 mb-4 group-hover:scale-110 transition-transform" />
         <blockquote className="text-lg font-black text-white leading-snug tracking-normal">
           «Качество — это не действие, а привычка. Мы создаём то, что любим.»
         </blockquote>
         <div className="mt-6 flex items-center gap-3">
            <div className="size-8 rounded-full bg-white/20 border border-white/40" />
            <div className="flex flex-col">
               <span className="text-xs font-black text-white">Аристотель</span>
               <span className="text-xs font-bold text-white/50">Философия</span>
            </div>
         </div>
      </div>
    </div>
  );
}
