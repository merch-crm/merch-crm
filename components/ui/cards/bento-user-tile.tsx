"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Typo } from "@/components/ui/typo";

interface BentoUserTileProps {
  name?: React.ReactNode;
  role?: React.ReactNode;
  status?: "online" | "away" | "offline";
  lastActive?: React.ReactNode;
}

export function BentoUserTile({ 
  name = "Leonid Molchanov", 
  role = "Lead Developer", 
  status = "online",
  lastActive = "2м назад"
}: BentoUserTileProps) {
  // Helper to get initials if name is a string
  const getInitials = (n: React.ReactNode) => {
    if (typeof n === 'string') {
      return n.split(' ').map(item => item[0]).join('');
    }
    return "LM"; // Fallback
  };

  return (
    <div className="group relative w-full rounded-card bg-white border border-slate-100 shadow-crm-md p-6 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 blur-[40px] rounded-full -mr-16 -mt-16 transition-colors" />
      
      <div className="flex items-center gap-3 relative z-10">
         <div className="relative">
            <div className="size-16 rounded-card bg-slate-950 flex items-center justify-center text-white text-xl font-black shadow-2xl ring-4 ring-white">
               {getInitials(name)}
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 size-5 rounded-full border-4 border-white shadow-sm",
              status === 'online' ? 'bg-emerald-500' : status === 'away' ? 'bg-amber-500' : 'bg-slate-300'
            )} />
         </div>
         
         <div className="flex flex-col">
            <Typo as="h3" className="text-base font-black text-slate-950 leading-none group-hover:text-slate-900 transition-colors">{name}</Typo>
            <Typo as="p" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 leading-none">{role}</Typo>
         </div>
      </div>

      <div className="flex items-center gap-3 relative z-10">
         <div className="hidden sm:flex flex-col items-end px-4 border-r border-slate-100">
            <Typo as="span" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Активность</Typo>
            <Typo as="span" className="text-[11px] font-black text-slate-900 tracking-widest leading-none">{lastActive}</Typo>
         </div>
         <motion.div 
            whileHover={{ x: 4 }}
            className="size-10 rounded-element bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"
         >
            <ChevronRight className="size-5" />
         </motion.div>
      </div>
    </div>
  );
}
