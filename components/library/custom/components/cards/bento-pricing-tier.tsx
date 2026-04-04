"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';

export function BentoPricingTier() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-1 group relative overflow-hidden">
      <div className="bg-slate-950 rounded-[30px] p-8 flex flex-col gap-3 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-base to-transparent" />
         
         <div className="flex flex-col items-center text-center gap-2">
            <div className="size-12 rounded-2xl bg-primary-base/10 flex items-center justify-center text-primary-base mb-2">
               <Star className="size-6 fill-primary-base" />
            </div>
            <h3 className="text-xl font-black text-white  ">Enterprise Plus</h3>
            <p className="text-[11px] font-black text-primary-base  tracking-[0.2em]">Our most powerful plan</p>
         </div>

         <div className="flex flex-col items-center text-center">
            <div className="flex items-end gap-1">
               <span className="text-4xl font-black text-white  leading-none">$199</span>
               <span className="text-xs font-bold text-white/40   pb-1 opacity-50">/month</span>
            </div>
         </div>

         <div className="space-y-3 pt-2">
            {['Unlimited Team Members', '1TB Cloud Storage', '24/7 Priority Support', 'Custom AI Training'].map((f, i) => (
               <div key={i} className="flex items-center gap-3">
                  <div className="size-4 rounded-full bg-primary-base flex items-center justify-center text-white">
                     <Check className="size-2.5 stroke-[4px]" />
                  </div>
                  <span className="text-xs font-bold text-white/70">{f}</span>
               </div>
            ))}
         </div>

         <motion.button 
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           className="w-full py-4 rounded-2xl bg-primary-base text-white text-xs font-black   shadow-[0_10px_20px_-5px_rgba(var(--primary-base),0.4)]"
         >
            Start 14-Day Trial
         </motion.button>
      </div>
    </div>
  );
}
