"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, UserCheck } from 'lucide-react';

export function BentoPresenceIndicator() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col items-center gap-3 group overflow-hidden relative">
      <div className="flex items-center justify-between w-full px-2">
         <h3 className="text-[11px] font-black text-gray-400  ">Active Presence</h3>
         <motion.div
           animate={{ scale: [1, 1.2, 1] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
         />
      </div>

      <div className="relative size-24 rounded-full bg-emerald-50 border-4 border-white flex items-center justify-center shadow-inner group">
         <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping opacity-20" />
         <UserCheck className="size-10 text-emerald-600 transition-transform group-hover:scale-110" />
      </div>

      <div className="w-full flex items-center justify-between pt-4 border-t border-gray-50">
         <div className="flex flex-col">
            <span className="text-[11px] font-black text-gray-950 leading-none">Healthy</span>
            <span className="text-[11px] font-bold text-gray-400   mt-1">Status</span>
         </div>
         <Activity className="size-4 text-emerald-400 opacity-40" />
      </div>
    </div>
  );
}
