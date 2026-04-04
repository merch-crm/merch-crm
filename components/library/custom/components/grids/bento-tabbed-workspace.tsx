"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, LayoutGrid, Clock, Settings, Search } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

const tabs = [
  { id: 'grid', label: 'View Grid', icon: LayoutGrid },
  { id: 'list', label: 'View List', icon: Table },
  { id: 'logs', label: 'Recent Logs', icon: Clock },
];

export function BentoTabbedWorkspace() {
  const [activeTab, setActiveTab] = useState('grid');

  return (
    <div className="w-full max-w-4xl p-1 bg-gray-50 rounded-[44px] border border-gray-200 shadow-inner overflow-hidden">
      <div className="bg-white rounded-[40px] shadow-sm flex flex-col overflow-hidden">
         {/* Navigation Bar */}
         <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-2xl">
               {tabs.map((tab) => (
                  <motion.button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={cn(
                        "relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black   transition-all",
                        activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-950'
                     )}
                  >
                     {activeTab === tab.id && (
                        <motion.div layoutId="activeTab" className="absolute inset-0 bg-slate-900 rounded-xl" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                     )}
                     <tab.icon className="size-3.5 relative z-10" />
                     <span className="relative z-10">{tab.label}</span>
                  </motion.button>
               ))}
            </div>
            <div className="size-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:text-gray-950 cursor-pointer transition-colors"><Search className="size-4" /></div>
         </div>

         {/* Content Area */}
         <div className="p-10 min-h-[400px] flex items-center justify-center relative overflow-hidden group">
            <AnimatePresence mode="wait">
               <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="w-full max-w-2xl"
               >
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                     {activeTab === 'grid' && [1,2,3,4,5,6].map(i => (
                        <div key={i} className="aspect-square bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-center text-gray-200">
                           <LayoutGrid className="size-12 opacity-10" />
                        </div>
                     ))}
                     {activeTab === 'list' && [1,2,3].map(i => (
                        <div key={i} className="col-span-3 h-16 bg-gray-50 rounded-2xl border border-gray-100" />
                     ))}
                     {activeTab === 'logs' && (
                        <div className="col-span-3 flex flex-col gap-3">
                           <div className="flex flex-col gap-2">
                              <h3 className="text-4xl font-black text-gray-950  leading-none italic opacity-10">NO LOGS AVAILABLE</h3>
                              <p className="text-xs font-bold text-gray-400   text-center mt-4">System is currently purging cache...</p>
                           </div>
                        </div>
                     )}
                  </div>
               </motion.div>
            </AnimatePresence>
            
            {/* Corner Decorative */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-base/5 blur-[80px] rounded-full pointer-events-none" />
         </div>

         {/* Footer / Status */}
         <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between text-[11px] font-black text-gray-400   bg-gray-50/50">
            <div className="flex items-center gap-2">
               <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span>Matrix Operational</span>
            </div>
            <div className="flex items-center gap-3">
               <span className="hover:text-gray-950 cursor-pointer">Security Panel</span>
               <Settings className="size-3" />
            </div>
         </div>
      </div>
    </div>
  );
}
