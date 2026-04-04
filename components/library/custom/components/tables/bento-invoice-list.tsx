"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

const invoices = [
  { id: 'INV-021', date: 'May 12, 2025', amount: '$1,400', status: 'Paid' },
  { id: 'INV-020', date: 'Apr 12, 2025', amount: '$1,400', status: 'Paid' },
  { id: 'INV-019', date: 'Mar 12, 2025', amount: '$850', status: 'Due' },
];

export function BentoInvoiceList() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col gap-3 group overflow-hidden">
      <div className="flex justify-between items-center">
         <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary-base/5 text-primary-base flex items-center justify-center">
               <CreditCard className="size-5" />
            </div>
            <h3 className="text-sm font-black text-gray-900  leading-none">Billing History</h3>
         </div>
         <button type="button" aria-label="Download billing history" className="text-gray-300 hover:text-gray-900 transition-colors">
            <Download className="size-4" />
         </button>
      </div>

      <div className="space-y-3">
         {invoices.map((inv, i) => (
            <motion.div 
               key={inv.id}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-1 hover:bg-white hover:shadow-sm transition-all"
            >
               <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-gray-400  ">{inv.id}</span>
                  <span className={cn(
                     "text-[11px] font-black px-1.5 py-0.5 rounded-md ",
                     inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  )}>
                     {inv.status}
                  </span>
               </div>
               <div className="flex justify-between items-end mt-1">
                  <div className="flex flex-col">
                     <span className="text-xs font-black text-gray-950">{inv.amount}</span>
                     <span className="text-[11px] font-bold text-gray-400">{inv.date}</span>
                  </div>
                  <ExternalLink className="size-3 text-gray-300 group-hover:text-primary-base" />
               </div>
            </motion.div>
         ))}
      </div>

      <button type="button" className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[11px] font-black   hover:bg-primary-base transition-colors shadow-lg">
         Manage Subscription
      </button>

    </div>
  );
}
