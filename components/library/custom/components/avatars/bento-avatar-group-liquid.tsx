"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoAvatarGroupLiquid() {
  const users = [
    { n: 'U1', c: 'bg-primary-base' },
    { n: 'U2', c: 'bg-indigo-500' },
    { n: 'U3', c: 'bg-emerald-500' },
    { n: 'U4', c: 'bg-amber-500' },
    { n: 'U5', c: 'bg-rose-500' },
    { n: 'U6', c: 'bg-slate-900' }
  ];

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col items-center gap-3 group">
      <div className="text-center">
         <h3 className="text-sm font-black text-gray-900  ">Liquid Collaborative</h3>
         <p className="text-[11px] font-bold text-gray-400 mt-1  ">Hover to separate</p>
      </div>

      <div className="flex -space-x-3 hover:space-x-2 transition-all duration-700 ease-in-out p-4">
         {users?.map((u, i) => (
           <motion.div
             key={i}
             whileHover={{ y: -8, scale: 1.2, rotate: 5 }}
             className={cn(
               "size-12 rounded-full border-4 border-white shadow-2xl flex items-center justify-center text-white text-[11px] font-black z-[10] transition-transform",
               u.c
             )}
           >
              {u.n}
           </motion.div>
         ))}
         <div className="size-12 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center text-gray-400 text-[11px] font-black z-[5]">
            +4
         </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
         <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
         <span className="text-[11px] font-black text-gray-400  tracking-[0.2em]">12 LIVE SESSIONS</span>
      </div>
    </div>
  );
}
