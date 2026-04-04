"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Clock } from 'lucide-react';

export function BentoProjectSummary() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-indigo-950 p-8 flex flex-col gap-3 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary-base/10 blur-[60px] rounded-full" />
      
      <div className="flex justify-between items-start">
         <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary-base">
            <Layout className="size-6" />
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[11px] font-black text-white/40   mb-1">Status</span>
            <div className="flex items-center gap-2 group/status px-3 py-1 rounded-full bg-primary-base/20 border border-primary-base/20">
               <div className="size-1.5 rounded-full bg-primary-base animate-pulse" />
               <span className="text-[11px] font-black text-white  ">In Progress</span>
            </div>
         </div>
      </div>

      <div className="flex flex-col gap-1">
         <h3 className="text-xl font-black text-white ">MerchCRM UI Kit</h3>
         <p className="text-xs font-bold text-white/40">Expanding 42 categories with premium Bento systems.</p>
      </div>

      <div className="space-y-3 pt-2">
         <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '85%' }}
               transition={{ duration: 1.5, ease: "easeOut" }}
               className="h-full bg-primary-base" 
            />
         </div>
         <div className="flex justify-between text-[11px] font-bold text-white/40 ">
            <span>Overall Progress</span>
            <span className="text-white">85% Complete</span>
         </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
         <div className="flex -space-x-3">
            {[1,2,3].map((i) => (
               <div key={i} className="size-8 rounded-xl border-4 border-indigo-950 bg-slate-800 flex items-center justify-center text-[11px] font-black text-white">
                  {i}
               </div>
            ))}
         </div>
         <div className="flex items-center gap-2 text-[11px] font-black text-white/40 ">
            <Clock className="size-3" />
            Due in 4 days
         </div>
      </div>
    </div>
  );
}
