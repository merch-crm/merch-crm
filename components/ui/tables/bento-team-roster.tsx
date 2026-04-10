"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BentoCard, BentoHeader } from '@/components/ui/bento-primitives';

const team = [
  { name: 'Alex Reid', role: 'Designer', score: 98 },
  { name: 'Sarah Wu', role: 'Support', score: 94 },
  { name: 'David Kim', role: 'Product', score: 89 },
];

export function BentoTeamRoster() {
  return (
    <BentoCard>
      <BentoHeader title="Team Efficiency" subtitle="Top Performers" rightElement={ <button type="button" aria-label="More options" className="size-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="size-4" />
          </button>
        }
      />

      <div className="space-y-3">
         {team.map((member, i) => (
            <motion.div 
               key={member.name}
               initial={{ y: 10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: i * 0.1 }}
               className="flex items-center justify-between p-1 group/item"
            >
               <div className="flex items-center gap-3">
                  <Avatar className="size-10 rounded-element">
                     <AvatarFallback className="bg-slate-900 text-white text-[11px] font-black">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                     <span className="text-xs font-bold text-gray-950 group-hover/item:text-primary-base transition-colors">{member.name}</span>
                     <span className="text-[11px] font-black text-gray-400  ">{member.role}</span>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                     <span className="text-xs font-black text-gray-900 leading-none">{member.score}</span>
                     <span className="text-[11px] font-black text-emerald-500 ">Score</span>
                  </div>
                  <Star className="size-3 fill-emerald-500 text-emerald-500" />
               </div>
            </motion.div>
         ))}
      </div>

      <button type="button" className="w-full bg-emerald-500 rounded-card p-5 flex items-center gap-3 group/banner cursor-pointer transition-transform hover:scale-[1.02] text-left mt-2">
         <div className="size-10 rounded-element bg-white/20 flex items-center justify-center text-white">
            <Star className="size-5 fill-white" />
         </div>
         <div className="flex flex-col">
            <span className="text-white text-xs font-black">Elite Milestone</span>
            <span className="text-white/70 text-[11px] font-bold">14 days above target</span>
         </div>
      </button>

    </BentoCard>
  );
}
