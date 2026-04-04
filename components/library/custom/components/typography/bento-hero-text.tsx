"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function BentoHeroText() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col gap-3 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-base/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary-base/40 transition-colors duration-700" />
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex flex-col gap-2 relative z-10"
      >
        <span className="text-[11px] font-black text-primary-base  tracking-normal">Дизайн-система</span>
        <h1 className="text-4xl font-black text-gray-950 leading-[1.1] tracking-normal">
          Lumin <br />
          <span className="text-gray-400">Apple</span>
        </h1>
      </motion.div>

      <p className="text-xs font-bold text-gray-500 leading-relaxed max-w-[200px] mt-2 relative z-10">
        Создаём компоненты высокой точности для современной CRM.
      </p>

      <div className="mt-4 flex items-center gap-3 relative z-10">
         <div className="h-px flex-1 bg-gray-100" />
         <span className="text-[11px] font-black text-gray-400  tracking-normal">v4.0.2</span>
      </div>
    </div>
  );
}
