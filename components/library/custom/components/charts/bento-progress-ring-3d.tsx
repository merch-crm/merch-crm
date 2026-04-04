"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target } from 'lucide-react';

export function BentoProgressRing3D({ percentage = 82 }: { percentage?: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-slate-950 p-8 flex flex-col items-center gap-3 group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-base to-transparent opacity-50" />
      
      <div className="flex justify-between w-full px-2">
         <h3 className="text-[11px] font-black text-primary-base tracking-normal">Рейтинг Безопасности</h3>
         <ShieldCheck className="size-4 text-primary-base" />
      </div>

      <div className="relative size-44 flex items-center justify-center">
         {/* Glow effect */}
         <div className="absolute inset-0 bg-primary-base blur-[60px] opacity-10 rounded-full" />
         
         <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
               className="text-white/5"
               strokeWidth="10"
               stroke="currentColor"
               fill="transparent"
               r={radius}
               cx="50"
               cy="50"
            />
            <motion.circle
               className="text-primary-base"
               strokeWidth="10"
               strokeDasharray={circumference}
               initial={{ strokeDashoffset: circumference }}
               animate={{ strokeDashoffset }}
               transition={{ duration: 2, ease: "easeOut" }}
               strokeLinecap="round"
               stroke="currentColor"
               fill="transparent"
               r={radius}
               cx="50"
               cy="50"
            />
         </svg>
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tracking-normal">{percentage}%</span>
            <span className="text-[11px] font-black text-white/30 tracking-normal mt-1">Оптимизировано</span>
         </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-4 w-full flex items-center justify-between border border-white/5">
         <div className="flex items-center gap-3">
            <Target className="size-4 text-emerald-400" />
            <span className="text-xs font-bold text-white/80">Цель достигнута</span>
         </div>
         <span className="text-[11px] font-black text-emerald-400 ">Проверено</span>
      </div>
    </div>
  );
}
