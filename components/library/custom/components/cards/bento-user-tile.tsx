"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoUserTile({ 
  name = "Leonid Molchanov", 
  role = "Lead Developer", 
  status = "online" 
}: { 
  name?: string; 
  role?: string; 
  status?: "online" | "away" | "offline" 
}) {
  return (
    <div className="group relative w-full rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-6 flex items-center justify-between hover:border-primary-base transition-all cursor-pointer">
      <div className="flex items-center gap-3">
         <div className="relative">
            <div className="size-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white text-xl font-bold shadow-2xl ring-4 ring-white">
               {name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white",
              status === 'online' ? 'bg-emerald-500' : status === 'away' ? 'bg-amber-500' : 'bg-gray-300'
            )} />
         </div>
         
         <div className="flex flex-col">
            <h3 className="text-base font-black text-gray-950  group-hover:text-primary-base transition-colors">{name}</h3>
            <p className="text-[11px] font-bold text-gray-400  ">{role}</p>
         </div>
      </div>

      <div className="flex items-center gap-3">
         <div className="hidden sm:flex flex-col items-end px-4 border-r border-gray-100">
            <span className="text-[11px] font-black text-gray-400 ">Recent Activity</span>
            <span className="text-xs font-bold text-gray-800">2m ago</span>
         </div>
         <motion.div 
           whileHover={{ x: 4 }}
           className="size-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"
         >
            <ChevronRight className="size-5" />
         </motion.div>
      </div>
    </div>
  );
}
