"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const USERS_LIST = [
  { name: 'Admin User', role: 'Superadmin', color: 'bg-primary-base' },
  { name: 'Guest Acc', role: 'Reviewer', color: 'bg-slate-400' },
  { name: 'Moderator', role: 'Support', color: 'bg-indigo-500' }
];

export function BentoAvatarTransition() {
  const [index, setIndex] = useState(0);
  const users = USERS_LIST;

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % (users?.length || USERS_LIST.length));
  };

  const currentUser = users[index] || users[0];

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col items-center gap-3 group">
      <div className="w-full flex justify-between items-center px-2">
         <h3 className="text-xs font-black text-gray-400  ">Account Swap</h3>
         <motion.button 
           type="button"
           whileTap={{ rotate: 180 }}
           onClick={handleNext}
           className="size-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary-base transition-colors"
         >
            <RefreshCw className="size-4" />
         </motion.button>
      </div>

      <div className="relative w-full h-32 flex items-center justify-center">
         <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ x: 20, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -20, opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-3"
            >
               <div className={cn("size-20 rounded-card shadow-2xl flex items-center justify-center text-white text-2xl font-black", currentUser.color)}>
                  {currentUser.name[0]}
               </div>
               <div className="text-center">
                  <h4 className="text-base font-black text-gray-900 ">{currentUser.name}</h4>
                  <p className="text-[11px] font-black text-gray-400  ">{currentUser.role}</p>
               </div>
            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
