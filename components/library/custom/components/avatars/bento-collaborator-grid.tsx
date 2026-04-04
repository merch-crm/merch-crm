"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, MoreHorizontal, UserPlus } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

const COLLABORATORS = [
  { name: 'Alex K.', color: 'bg-indigo-500' },
  { name: 'Sarah J.', color: 'bg-emerald-500' },
  { name: 'Mike R.', color: 'bg-amber-500' },
  { name: 'Elena Z.', color: 'bg-rose-500' }
];

export function BentoCollaboratorGrid() {
  const users = COLLABORATORS;

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3 group">
      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-2">
            <Users className="size-4 text-primary-base" />
            <h3 className="text-sm font-black text-gray-900 tracking-tight leading-none  ">Коллабораторы</h3>
         </div>
         <span className="text-[11px] font-black text-slate-400  ">4 Онлайн</span>
      </div>

      <div className="grid grid-cols-4 gap-3">
         {users?.map((user, i) => (
           <motion.div
             key={i}
             whileHover={{ y: -5 }}
             className="flex flex-col items-center gap-1"
           >
              <div className={cn("size-12 rounded-2xl shadow-sm border border-white flex items-center justify-center text-white font-black text-sm", user.color)}>
                 {user.name[0]}
              </div>
              <span className="text-[11px] font-black text-gray-900  ">{user.name}</span>
           </motion.div>
         ))}
      </div>


      <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
         <button 
           type="button"
           className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors border border-transparent hover:border-gray-100"
         >
            <UserPlus className="size-3.5 text-gray-500" />
            <span className="text-[11px] font-black text-gray-900  ">Пригласить</span>
         </button>
         <button 
           type="button"
           className="size-11 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors border border-transparent hover:border-gray-100"
         >
            <MoreHorizontal className="size-4 text-gray-400" />
         </button>
      </div>
    </div>
  );
}
