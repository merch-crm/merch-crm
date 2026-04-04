"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, Users, ArrowUpRight, Flame, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { cn } from "../../utils/cn";

export interface DealCardProps {
  title: string;
  client: string;
  value: number;
  stage: string;
  daysAtStage: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  className?: string;
}

const PRIORITY_MAP = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  medium: { label: 'Medium', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  high: { label: 'High', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  critical: { label: 'Critical', color: 'bg-red-50 text-red-600 border-red-100' },
};

export function DealCard({ 
  title, client, value, stage, daysAtStage, priority, confidence, className 
}: DealCardProps) {
  const isHot = daysAtStage < 5 && confidence > 70;
  const isStale = daysAtStage > 14;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
      className={cn(
        "group relative flex flex-col p-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm transition-all duration-300 overflow-hidden",
        className
      )}
    >
      {/* Velocity / Heat Indicator */}
      <div className="absolute top-0 right-0 p-4">
        {isHot ? (
           <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 rounded-full text-white">
              <Flame className="size-3 fill-white" />
              <span className="text-[11px] font-black  ">Hot Deal</span>
           </div>
        ) : isStale ? (
           <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-slate-500 border border-slate-200">
              <Clock className="size-3" />
              <span className="text-[11px] font-black  ">Stale</span>
           </div>
        ) : (
           <div className="size-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
             <MoreHorizontal className="size-4" />
           </div>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 pr-20">
         <div className="flex items-center gap-2">
            <span className={cn("px-2 py-0.5 rounded-lg text-[11px] font-black   border", PRIORITY_MAP[priority].color)}>
               {PRIORITY_MAP[priority].label}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
               <Clock className="size-3" />
               {daysAtStage}д в работе
            </div>
         </div>
         <h4 className="text-base font-black text-gray-900  leading-tight mt-1 group-hover:text-primary-base transition-colors">
            {title}
         </h4>
         <div className="flex items-center gap-1.5 mt-0.5">
            <div className="size-4 rounded-full bg-gray-100 flex items-center justify-center">
               <Users className="size-2 text-gray-500" />
            </div>
            <span className="text-xs font-bold text-gray-500 italic">{client}</span>
         </div>
      </div>

      {/* Financials / Confidence */}
      <div className="mt-6 flex flex-col gap-3">
         <div className="flex items-end justify-between">
            <div className="flex flex-col">
               <span className="text-[11px] font-black text-gray-400   leading-none mb-1">Сумма сделки</span>
               <div className="flex items-center text-2xl font-black text-gray-900  italic">
                  <span className="text-primary-base mr-1">₽</span>
                  {value.toLocaleString()}
               </div>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[11px] font-black text-gray-400   leading-none mb-1">Вероятность</span>
               <span className="text-sm font-black text-emerald-500 italic">{confidence}%</span>
            </div>
         </div>

         {/* Confidence bar */}
         <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${confidence}%` }}
               className="h-full bg-emerald-500"
            />
         </div>
      </div>

      {/* Footer / Stage */}
      <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-gray-900 rounded-xl flex items-center gap-2 group-hover:bg-primary-dark transition-colors">
               <ShieldCheck className="size-3 text-emerald-400" />
               <span className="text-[11px] font-black text-white  ">{stage}</span>
            </div>
         </div>

         <motion.button 
           whileHover={{ scale: 1.1, rotate: 15 }}
           className="size-8 rounded-xl bg-primary-base/10 text-primary-base flex items-center justify-center border border-primary-base/10"
         >
            <ArrowUpRight className="size-4" />
         </motion.button>
      </div>

      {/* Grid Pattern in background (subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      </div>
    </motion.div>
  );
}
