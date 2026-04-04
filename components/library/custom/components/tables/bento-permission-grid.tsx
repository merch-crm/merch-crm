"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Eye, Edit3 } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

const roles = [
  { name: 'Admin', p: [1, 1, 1] },
  { name: 'Editor', p: [1, 1, 0] },
  { name: 'Viewer', p: [1, 0, 0] },
];

export function BentoPermissionGrid() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col gap-3 group overflow-hidden">
      <div className="flex justify-between items-center">
         <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
               <Shield className="size-5" />
            </div>
            <h3 className="text-sm font-black text-gray-900  leading-none">Access Control</h3>
         </div>
      </div>

      <div className="flex flex-col gap-3">
         <div className="grid grid-cols-4 px-2 text-[11px] font-black text-gray-400  ">
            <span className="col-span-1">Role</span>
            <div className="flex justify-center"><Eye className="size-3" /></div>
            <div className="flex justify-center"><Edit3 className="size-3" /></div>
            <div className="flex justify-center"><Key className="size-3" /></div>
         </div>
         
         <div className="flex flex-col gap-2">
            {roles.map((role, i) => (
               <motion.div 
                  key={role.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="grid grid-cols-4 px-2 py-3 bg-gray-50 rounded-2xl items-center border border-transparent hover:border-gray-100 transition-all"
               >
                  <span className="text-xs font-black text-gray-950">{role.name}</span>
                  {role.p.map((val, idx) => (
                     <div key={idx} className="flex justify-center">
                        <div className={cn(
                           "size-2.5 rounded-full",
                           val ? 'bg-primary-base shadow-[0_0_8px_rgba(var(--primary-base),0.5)]' : 'bg-gray-200'
                        )} />
                     </div>
                  ))}
               </motion.div>
            ))}
         </div>
      </div>

      <div className="flex items-center gap-2 justify-center text-[11px] font-black text-gray-400  ">
         <Edit3 className="size-3" />
         Managed by SuperAdmin
      </div>

    </div>
  );
}
