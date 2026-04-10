"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Typo } from "@/components/ui/typo";

export function BentoPricingTier() {
  const features = [
    'Безлимит участников',
    '1ТБ облачного хранилища',
    '24/7 Приоритетная поддержка',
    'Индивидуальное обучение ИИ'
  ];

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-gray-100 shadow-crm-md p-1 group relative overflow-hidden">
      <div className="bg-slate-950 rounded-card p-8 flex flex-col gap-3 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-base to-transparent" />
         
         <div className="flex flex-col items-center text-center gap-2">
            <div className="size-12 rounded-element bg-primary-base/10 flex items-center justify-center text-primary-base mb-2">
               <Star className="size-6 fill-primary-base" />
            </div>
            <Typo as="h3" className="text-xl font-black text-white">Корпоративный Плюс</Typo>
            <Typo as="p" className="text-[11px] font-black text-primary-base tracking-[0.2em] uppercase">Наш самый мощный план</Typo>
         </div>

         <div className="flex flex-col items-center text-center">
            <div className="flex items-end gap-1">
               <Typo as="span" className="text-4xl font-black text-white leading-none">$199</Typo>
               <Typo as="span" className="text-xs font-bold text-white/40 pb-1 opacity-50">/месяц</Typo>
            </div>
         </div>

         <div className="space-y-3 pt-2">
            {features.map((f, i) => (
               <div key={i} className="flex items-center gap-3">
                  <div className="size-4 rounded-full bg-primary-base flex items-center justify-center text-white">
                     <Check className="size-2.5 stroke-[4px]" />
                  </div>
                  <Typo as="span" className="text-xs font-bold text-white/70">{f}</Typo>
               </div>
            ))}
         </div>

         <motion.button 
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           className="w-full py-4 rounded-element bg-primary-base text-white text-xs font-black shadow-[0_10px_20px_-5px_rgba(var(--primary-base),0.4)]"
         >
            <Typo as="span">Начать 14-дневный триал</Typo>
         </motion.button>
      </div>
    </div>
  );
}
