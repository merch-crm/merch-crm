"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldAlert } from 'lucide-react';

const features = [
  { name: 'AI Models', free: <ShieldAlert className="size-3 text-rose-500" />, pro: <Check className="size-3 text-emerald-500" /> },
  { name: 'Analytics', free: 'Basic', pro: 'Full' },
  { name: 'Security', free: '2FA', pro: 'Advanced' },
  { name: 'Support', free: 'Email', pro: '24/7' },
];

export function BentoTierComparison() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col gap-3 group overflow-hidden">
      <div className="flex justify-between items-center px-1">
         <h3 className="text-sm font-black text-gray-900  leading-none">Capacities</h3>
         <div className="px-2 py-0.5 bg-primary-base rounded-md text-[11px] font-black text-white  ">Pricing Matrix</div>
      </div>

      <div className="flex flex-col">
         <div className="grid grid-cols-3 px-2 py-3 border-b border-gray-50 text-[11px] font-black text-gray-400  ">
            <span>Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center">Pro</span>
         </div>
         <div className="flex flex-col mt-2 gap-1">
            {features.map((feature, i) => (
               <motion.div 
                  key={feature.name}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="grid grid-cols-3 px-2 py-3 items-center rounded-xl hover:bg-gray-50 transition-colors"
               >
                  <span className="text-[11px] font-bold text-gray-900">{feature.name}</span>
                  <div className="flex justify-center text-[11px] font-black text-gray-400  ">
                     {feature.free}
                  </div>
                  <div className="flex justify-center text-[11px] font-black text-primary-base  ">
                     {feature.pro}
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      <button type="button" className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[11px] font-black   shadow-xl hover:bg-primary-base transition-all">
         Upgrade to Pro Plan
      </button>

    </div>
  );
}
