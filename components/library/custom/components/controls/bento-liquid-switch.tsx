"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoLiquidSwitch() {
  const [isOn, setIsOn] = useState(false);

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col items-center gap-3">
      <div className="text-center">
        <h3 className="text-sm font-black text-gray-900">Системный Режим</h3>
        <p className="text-[11px] font-bold text-gray-400   mt-1">Жидкий Тумблер</p>
      </div>

      <div 
        role="button"
        tabIndex={0}
        aria-pressed={isOn}
        aria-label="Переключить системный режим"
        onClick={() => setIsOn(!isOn)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOn(!isOn);
          }
        }}
        className={cn(
          "relative w-24 h-12 rounded-full cursor-pointer transition-colors duration-500 outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isOn ? "bg-emerald-500 focus-visible:ring-emerald-500" : "bg-rose-500 focus-visible:ring-rose-500"
        )}
      >
        <motion.div
           layout
           transition={{ type: "spring", stiffness: 500, damping: 30 }}
           className={cn(
             "absolute top-1 left-1 size-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500",
             isOn ? "translate-x-12 bg-white" : "translate-x-0 bg-white"
           )}
        >
           {/* Gooey effect circles */}
           <motion.div 
             animate={{ scale: isOn ? [1, 1.2, 1] : 1 }}
             className={cn("absolute inset-0 rounded-full bg-white opacity-40 blur-sm -z-10", isOn ? "block" : "hidden")}
           />
        </motion.div>
      </div>


      <div className="flex gap-3 mt-2">
         <div className="flex flex-col items-center">
            <span className={cn("text-[11px] font-black  ", !isOn ? "text-rose-600" : "text-gray-300")}>ВЫКЛ</span>
            <div className={cn("size-1 rounded-full mt-1", !isOn ? "bg-rose-500" : "bg-transparent")} />
         </div>
         <div className="flex flex-col items-center">
            <span className={cn("text-[11px] font-black  ", isOn ? "text-emerald-600" : "text-gray-300")}>ВКЛ</span>
            <div className={cn("size-1 rounded-full mt-1", isOn ? "bg-emerald-500" : "bg-transparent")} />
         </div>
      </div>
    </div>
  );
}
