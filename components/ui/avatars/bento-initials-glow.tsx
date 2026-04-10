"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function BentoInitialsGlow({ name = "Design System" }: { name?: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-gray-100 shadow-crm-md p-8 flex items-center justify-center min-h-[220px] group relative overflow-hidden">
      {/* Animated glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 bg-primary-base blur-[80px] rounded-full z-0"
      />
      
      <div className="relative z-10 flex flex-col items-center gap-3">
         <motion.div
           whileHover={{ scale: 1.1, rotate: 5 }}
           className="size-24 rounded-card bg-gray-950 flex items-center justify-center shadow-2xl text-white text-4xl font-black ring-8 ring-gray-100"
         >
           {initials}
         </motion.div>
         <div className="text-center">
            <h4 className="text-sm font-black text-gray-900 ">{name}</h4>
            <p className="text-[11px] font-black text-gray-400   mt-1">Initials Token</p>
         </div>
      </div>
    </div>
  );
}
