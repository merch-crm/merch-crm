"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, ShieldCheck } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoLockSwitch() {
  const [isLocked, setIsLocked] = useState(true);

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-6 flex flex-col items-center gap-3">
      <div className="w-full flex justify-between items-center px-2">
         <h3 className="text-gray-900 text-xs font-black  ">Главный Замок</h3>
         <ShieldCheck className={cn("size-4 transition-colors", isLocked ? "text-gray-300" : "text-emerald-500")} />
      </div>

      <div 
        role="button"
        tabIndex={0}
        aria-pressed={!isLocked}
        aria-label="Toggle main lock"
        onClick={() => setIsLocked(!isLocked)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsLocked(!isLocked);
          }
        }}
        className={cn(
          "relative w-20 h-32 rounded-[24px] cursor-pointer transition-all duration-500 flex flex-col items-center justify-between py-4 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isLocked ? "bg-gray-50 border-2 border-gray-100 shadow-inner focus-visible:ring-gray-200" : "bg-emerald-500/10 border-2 border-emerald-500/30 focus-visible:ring-emerald-500"
        )}
      >
        <motion.div
           layout
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
           className={cn(
             "size-12 rounded-xl flex items-center justify-center shadow-crm-lg transition-all duration-500 relative ring-4",
             isLocked 
              ? "translate-y-12 bg-white text-gray-900 ring-gray-100/50" 
              : "translate-y-0 bg-emerald-500 text-white ring-emerald-500/20"
           )}
        >
           <AnimatePresence mode="wait">
              {isLocked ? (
                <motion.div key="lock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Lock className="size-6" />
                </motion.div>
              ) : (
                <motion.div key="unlock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Unlock className="size-6" />
                </motion.div>
              )}
           </AnimatePresence>
        </motion.div>

        <div className="flex flex-col gap-1 items-center pb-2">
           <div className={cn("size-1 rounded-full transition-colors", !isLocked ? "bg-emerald-500" : "bg-gray-200")} />
           <div className={cn("size-1 rounded-full transition-colors", !isLocked ? "bg-emerald-500/40" : "bg-gray-200")} />
        </div>
      </div>


      <div className="text-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 w-full py-2.5">
         <p className="text-[11px] font-bold text-gray-400  ">{isLocked ? "Защищенный Режим" : "Доступ Открыт"}</p>
      </div>
    </div>
  );
}
