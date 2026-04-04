"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function BentoPerspectiveScrollText() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white p-6 h-[250px] flex flex-col gap-3 overflow-hidden relative group border border-gray-100 shadow-crm-md">
      <div className="flex items-center justify-between mb-2 z-20">
         <h3 className="text-orange-600 text-[11px] font-black  tracking-normal">Поток данных</h3>
      </div>

      {/* Wrapping the 3D scene in a 2D mask fixes all WebKit Z-index penetration bugs */}
      <div 
        className="flex-1 relative w-full h-full"
        style={{ 
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)', 
          maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' 
        }}
      >
        <div className="w-full h-full [perspective:1200px]">
          <motion.div 
            animate={{ y: [0, -200, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex flex-col gap-3 [transform:rotateX(25deg)] transform-gpu origin-center pt-4"
          >
             {[1, 2, 3, 4, 5, 6].map((i) => (
               <div key={i} className="flex flex-col gap-2 p-5 bg-white border border-gray-200 rounded-xl shadow-crm-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-gray-500 ">Событие #{i + 142}</span>
                    <div className="size-1 bg-orange-500 animate-pulse rounded-full" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-snug">
                    {i % 2 === 0 ? "Новая сделка зарегистрирована в воронке продаж." : "Статус лида обновлён на «Переговоры»."}
                  </p>
                  <div className="mt-2 h-[2px] w-8 bg-orange-500" />
               </div>
             ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
