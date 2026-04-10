"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Eye, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BentoCard, BentoHeader } from '@/components/ui/bento-primitives';

const roles = [
  { name: 'Admin', p: [1, 1, 1] },
  { name: 'Editor', p: [1, 1, 0] },
  { name: 'Viewer', p: [1, 0, 0] },
];

export function BentoPermissionGrid() {
  return (
    <BentoCard>
      <BentoHeader title="Access Control" icon={<Shield className="size-5" />}
      />

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
                   className="grid grid-cols-4 px-2 py-3 bg-gray-50 rounded-element items-center border border-transparent hover:border-gray-100 transition-all"
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

      <div className="flex items-center gap-2 justify-center text-[11px] font-black text-gray-400 mt-2">
         <Edit3 className="size-3" />
         Managed by SuperAdmin
      </div>

    </BentoCard>
  );
}
