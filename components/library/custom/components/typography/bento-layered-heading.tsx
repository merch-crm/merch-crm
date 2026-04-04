"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function BentoLayeredHeading({ title = "CRM" }: { title?: string }) {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col items-center justify-center h-48 relative overflow-hidden group">
      <div className="relative">
         {/* Background Layer (Outline) */}
         <h2 className="text-8xl font-black text-gray-100 select-none  opacity-50 absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 scale-110 group-hover:scale-125 transition-transform duration-700">
            {title}
         </h2>
         
         {/* Middle Layer (Primary) */}
         <motion.h2 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-8xl font-black text-gray-950 select-none  relative z-10 mix-blend-multiply"
         >
            {title}
         </motion.h2>

         {/* Glow Layer */}
         <div className="absolute inset-0 bg-primary-base opacity-0 group-hover:opacity-20 blur-2xl rounded-full z-0 transition-opacity" />
      </div>
      
      <p className="text-[11px] font-black text-primary-base  tracking-[0.5em] mt-2 relative z-20">Lumin Apple</p>
    </div>
  );
}
