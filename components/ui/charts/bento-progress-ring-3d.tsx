"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target } from 'lucide-react';

export function BentoProgressRing3D({ percentage = 82 }: { percentage?: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full max-w-sm rounded-card bg-white p-8 flex flex-col items-center gap-3 group relative overflow-hidden border border-slate-100 shadow-crm-md hover:shadow-crm-lg transition-all duration-500">
      <div className="flex justify-between w-full px-2">
         <h3 className="text-[11px] font-black text-primary-base tracking-normal">Рейтинг Безопасности</h3>
         <ShieldCheck className="size-4 text-primary-base" />
      </div>

      <div className="relative size-44 flex items-center justify-center">
         {/* Subtle glow effect for light mode */}
         <div className="absolute inset-0 bg-primary-base blur-[60px] opacity-[0.05] rounded-full" />
         
         <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
               className="text-slate-100"
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
            <span className="text-4xl font-black text-slate-900 tracking-normal">{percentage}%</span>
            <span className="text-[11px] font-black text-slate-400 tracking-normal mt-1">Оптимизировано</span>
         </div>
      </div>

      <div className="bg-slate-50 rounded-element p-4 w-full flex items-center justify-between border border-slate-100">
         <div className="flex items-center gap-3">
            <Target className="size-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-600">Цель достигнута</span>
         </div>
         <span className="text-[11px] font-black text-emerald-600">Проверено</span>
      </div>
    </div>
  );
}
