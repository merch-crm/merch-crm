"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { History, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';
import { BentoCard, BentoIconContainer } from "@/components/library/custom/ui/bento-primitives";

const logs = [
  { id: 1, type: 'success', msg: 'Project exported', time: '12m ago' },
  { id: 2, type: 'error', msg: 'API connection lost', time: '45m ago' },
  { id: 3, type: 'info', msg: 'System backup complete', time: '2h ago' },
];

export function BentoActionLog({ className }: { className?: string }) {
  return (
    <BentoCard className={cn("max-w-sm p-8 flex flex-col gap-3 group overflow-hidden", className)}>
      <div className="flex items-center gap-3">
         <BentoIconContainer className="size-10 bg-primary-base/10 text-primary-base">
            <History className="size-5" />
         </BentoIconContainer>
         <div className="flex flex-col">
            <h3 className="text-sm font-black text-gray-950  leading-none">Security Audit</h3>
            <p className="text-[11px] font-black text-gray-400   mt-1">Real-time Stream</p>
         </div>
      </div>

      <div className="space-y-3">
         {logs.map((log, i) => (
            <motion.div 
               key={log.id}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="flex items-start gap-3"
            >
               <div className={cn(
                  "size-8 rounded-[10px] mt-0.5 flex items-center justify-center shrink-0",
                  log.type === 'success' ? 'bg-emerald-50 text-emerald-500' : 
                  log.type === 'error' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'
               )}>
                  {log.type === 'success' ? <CheckCircle2 className="size-4" /> : 
                   log.type === 'error' ? <AlertCircle className="size-4" /> : <Clock className="size-4" />}
               </div>
               <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-gray-800">{log.msg}</span>
                  <span className="text-[11px] font-black text-gray-400 ">{log.time}</span>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="mt-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
         <span className="text-[11px] font-black text-gray-400  ">Current Integrity</span>
         <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-black text-emerald-600">99.8%</span>
         </div>
      </div>
    </BentoCard>
  );
}
