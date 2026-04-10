"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Server, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodes = [
  { name: 'US-East-1', ping: '12ms', load: '24%', status: 'active' },
  { name: 'EU-West-3', ping: '84ms', load: '62%', status: 'active' },
  { name: 'Asia-South', ping: '--', load: '0%', status: 'down' },
];

export function BentoStatusList() {
  return (
    <div className="w-full max-w-sm rounded-card bg-slate-950 p-8 flex flex-col gap-3 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
         <Signal className="size-20 text-white" />
      </div>
      
      <div className="flex justify-between items-center relative z-10">
         <h3 className="text-xs font-black text-white/40 tracking-tight">Node Monitor</h3>
         <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-white/60">Live</span>
         </div>
      </div>

      <div className="space-y-3 relative z-10">
         {nodes.map((node, i) => (
            <motion.div 
               key={node.name}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
            >
               <div className="flex items-center gap-3">
                  <div className={cn("size-8 rounded-lg flex items-center justify-center", node.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
                     <Server className="size-4" />
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-white ">{node.name}</span>
                     <span className="text-xs font-black text-white/30">{node.ping} Ping</span>
                  </div>
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-white ">{node.load}</span>
                  <span className="text-xs font-black text-white/30 ">Load</span>
               </div>
            </motion.div>
         ))}
      </div>

      <button type="button" aria-label="Refresh Infrastructure Status" className="relative z-10 w-full py-3 rounded-xl bg-white/10 text-white text-xs font-black border border-white/5 hover:bg-white/20 transition-all">
         Refresh Infrastructure
      </button>

    </div>
  );
}
