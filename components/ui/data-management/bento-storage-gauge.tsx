"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, AlertTriangle } from 'lucide-react';

export function BentoStorageGauge({ percentage = 74 }: { percentage?: number }) {
  const isHigh = percentage > 85;

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-slate-100 shadow-crm-md p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-slate-400" />
          <h3 className="text-sm font-black text-slate-900 tracking-wide">Объем базы данных</h3>
        </div>
        {isHigh && (
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[11px] font-black tracking-wide"
          >
            <AlertTriangle className="size-3" /> Близко к лимиту
          </motion.div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center p-4 relative">
         <svg className="size-32 transform -rotate-90">
            <circle
              cx="64" cy="64" r="58"
              stroke="rgb(248 250 252)"
              strokeWidth="10"
              fill="none"
            />
            <motion.circle
              cx="64" cy="64" r="58"
              stroke={isHigh ? "rgb(239 68 68)" : "rgb(59 130 246)"}
              strokeWidth="10"
              fill="none"
              strokeDasharray={364}
              initial={{ strokeDashoffset: 364 }}
              animate={{ strokeDashoffset: 364 - (364 * percentage) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
         </svg>
         
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-slate-950">{percentage}%</span>
            <span className="text-[11px] font-black text-slate-400 mt-0.5 tracking-wide">Занято</span>
         </div>
      </div>

      <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 border-t border-slate-50 pt-4 px-2">
         <div className="flex flex-col gap-0.5">
            <span className="text-slate-900 tabular-nums">7.4 ГБ</span>
            <span className="text-[11px] tracking-wide">Используется</span>
         </div>
         <div className="flex flex-col gap-0.5 text-right">
            <span className="text-slate-900 tabular-nums">10 ГБ</span>
            <span className="text-[11px] tracking-wide">Общий лимит</span>
         </div>
      </div>
    </div>
  );
}
