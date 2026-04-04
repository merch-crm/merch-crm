"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileDown, MoreVertical } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoExportReport() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-gray-900">Export History</h3>
        <button type="button" aria-label="More options" className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
          <MoreVertical className="size-4" />
        </button>
      </div>

      <div className="space-y-3">
        {[
          { name: 'Revenue_Q3_All.xlsx', size: '4.2 MB', date: 'Just now', status: 'ready', color: 'blue' },
          { name: 'Client_List_VIP.pdf', size: '1.1 MB', date: '2h ago', status: 'ready', color: 'emerald' },
          { name: 'Global_Audit_Log.csv', size: '450 KB', date: 'Yesterday', status: 'failed', color: 'rose' }
        ].map((file, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 0.98 }}
            className="group relative flex items-center gap-3 p-3 pr-4 rounded-2xl bg-white border border-gray-50 shadow-sm hover:border-gray-100 transition-all cursor-pointer"
          >
            <div className={cn(
              "size-10 rounded-xl flex items-center justify-center shrink-0",
              file.status === 'failed' ? "bg-rose-50 text-rose-500" : "bg-primary-base/5 text-primary-base"
            )}>
              <FileDown className="size-5" />
            </div>
            
            <div className="flex-1 min-w-0">
               <h4 className="text-[11px] font-black text-gray-950 truncate leading-none mb-1">{file.name}</h4>
               <p className="text-[11px] font-bold text-gray-400  ">{file.size} • {file.date}</p>
            </div>

            <div className="flex items-center gap-2">
               {file.status === 'ready' ? (
                 <button type="button" aria-label={`Download ${file.name}`} className="size-8 bg-gray-50 text-gray-900 rounded-full flex items-center justify-center hover:bg-primary-base hover:text-white transition-all">
                   <Download className="size-3.5" />
                 </button>
               ) : (
                 <span className="text-[11px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-full ">Failed</span>
               )}
            </div>
          </motion.div>
        ))}
      </div>
      
      <button type="button" className="w-full mt-4 py-3 bg-gray-950 text-white rounded-2xl text-[11px] font-black   hover:bg-primary-base transition-colors shadow-lg shadow-gray-200">
        Generate New Report
      </button>

    </div>
  );
}
