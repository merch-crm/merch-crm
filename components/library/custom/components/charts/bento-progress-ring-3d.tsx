"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target } from 'lucide-react';

export interface BentoProgressRing3DProps {
  percentage?: number;
  title?: string;
  subtitle?: string;
  statusText?: string;
  badgeText?: string;
}

export function BentoProgressRing3D({ 
  percentage = 82,
  title = "Рейтинг Безопасности",
  subtitle = "Оптимизировано",
  statusText = "Цель достигнута",
  badgeText = "Проверено"
}: BentoProgressRing3DProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-sm p-8 flex flex-col items-center gap-3 group relative overflow-hidden transition-all hover:shadow-xl">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-base to-transparent opacity-20" />
      
      <div className="flex justify-between w-full px-2">
         <h3 className="text-[11px] font-bold text-primary-base tracking-normal uppercase">{title}</h3>
         <ShieldCheck className="size-4 text-primary-base" />
      </div>

      <div className="relative size-44 flex items-center justify-center">
         {/* Glow effect */}
         <div className="absolute inset-0 bg-primary-base blur-[60px] opacity-[0.03] rounded-full" />
         
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
            <span className="text-4xl font-bold text-slate-900 tracking-normal">{percentage}%</span>
            <span className="text-[11px] font-bold text-slate-400 tracking-normal mt-1">{subtitle}</span>
         </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-4 w-full flex items-center justify-between border border-gray-100/50">
         <div className="flex items-center gap-3">
            <Target className="size-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">{statusText}</span>
         </div>
         <span className="text-[11px] font-bold text-emerald-600 ">{badgeText}</span>
      </div>
    </div>
  );
}
