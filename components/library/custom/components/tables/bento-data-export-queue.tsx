"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { DownloadCloud, CheckCircle2, Loader2 } from 'lucide-react';

const exports = [
  { name: 'Monthly_Sales_May.csv', status: 'ready', time: '12:45 PM' },
  { name: 'Customer_Data_Full.xlsx', status: 'processing', time: '12:50 PM' },
  { name: 'Inventory_Audit_Q2.pdf', status: 'ready', time: '10:00 AM' },
];

export function BentoDataExportQueue() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col gap-3 group overflow-hidden">
      <div className="flex justify-between items-center px-1">
         <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
               <DownloadCloud className="size-5" />
            </div>
            <div className="flex flex-col">
               <h3 className="text-sm font-black text-gray-950  leading-none">Export Hub</h3>
               <p className="text-[11px] font-black text-gray-400   mt-1">Background Tasks</p>
            </div>
         </div>
          <div className="px-2 py-0.5 bg-emerald-50 rounded-lg text-[11px] font-black text-emerald-600  ">Active</div>
      </div>

      <div className="space-y-2">
         {exports.map((exp, i) => (
            <motion.div 
               key={exp.name}
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: i * 0.1 }}
               className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group/task hover:bg-white hover:shadow-sm transition-all"
            >
               <div className="flex items-center gap-3">
                  {exp.status === 'ready' ? 
                     <CheckCircle2 className="size-4 text-emerald-500" /> : 
                     <Loader2 className="size-4 text-primary-base animate-spin" />
                  }
                  <div className="flex flex-col">
                     <span className="text-[11px] font-bold text-gray-950 truncate max-w-[140px]">{exp.name}</span>
                     <span className="text-[11px] font-black text-gray-400 ">{exp.time}</span>
                  </div>
               </div>
               {exp.status === 'ready' && (
                 <button type="button" aria-label={`Download ${exp.name}`} className="text-gray-300 hover:text-primary-base transition-colors">
                   <DownloadCloud className="size-3" />
                 </button>
               )}
            </motion.div>
         ))}
      </div>


      <div className="mt-2 text-center">
         <span className="text-[11px] font-black text-gray-400  ">Auto-clear every 24 hours</span>
      </div>
    </div>
  );
}
