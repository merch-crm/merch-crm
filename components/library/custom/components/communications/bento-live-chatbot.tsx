"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, X } from 'lucide-react';

export function BentoLiveChatbot() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <motion.button 
        type="button"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="size-14 rounded-full bg-primary-base flex items-center justify-center text-white shadow-xl shadow-primary-base/30 relative"
      >
        <Bot className="size-6" />
        <span className="absolute top-0 right-0 size-3.5 bg-red-500 border-2 border-white rounded-full" />
      </motion.button>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="w-[320px] rounded-[32px] bg-white border border-gray-100 shadow-2xl overflow-hidden flex flex-col"
    >
      <div className="bg-primary-base p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="relative">
               <div className="size-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                 <Bot className="size-5" />
               </div>
               <div className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-400 border-2 border-primary-base" />
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-black text-white leading-tight">Merch AI</span>
               <span className="text-[11px] font-bold text-white/70   flex items-center gap-1">
                 <Sparkles className="size-2.5" /> Online
               </span>
            </div>
         </div>
         <button type="button" onClick={() => setIsOpen(false)} className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="size-4" />
         </button>
      </div>
      
      <div className="p-4 flex flex-col gap-3 h-[200px] bg-gray-50/50 overflow-y-auto">
         <div className="flex items-start gap-2 w-[85%]">
            <div className="size-6 shrink-0 rounded-full bg-primary-base/10 flex items-center justify-center text-primary-base mt-1">
               <Bot className="size-3" />
            </div>
            <div className="bg-white p-3 rounded-[16px] rounded-tl-[4px] shadow-sm border border-gray-100 flex flex-col gap-2">
               <p className="text-xs font-medium text-gray-700 leading-relaxed">
                 Hi! I&apos;m Merch AI. I can help you find deals, create reports, or manage your pipeline. What do you need?
               </p>
               <div className="flex flex-wrap gap-1 mt-1">
                  <button type="button" className="px-2 cursor-pointer py-1 rounded-full border border-gray-200 text-[11px] font-bold text-gray-500 hover:text-primary-base hover:border-primary-base transition-colors">Find deals</button>
                  <button type="button" className="px-2 cursor-pointer py-1 rounded-full border border-gray-200 text-[11px] font-bold text-gray-500 hover:text-primary-base hover:border-primary-base transition-colors">Stats</button>
               </div>
            </div>
         </div>
         
         <div className="flex items-start justify-end w-full">
            <div className="bg-primary-base p-3 rounded-[16px] rounded-tr-[4px] shadow-sm flex flex-col gap-2 max-w-[80%]">
               <p className="text-xs font-medium text-white leading-relaxed">
                 Show me my revenue stats for this month.
               </p>
            </div>
         </div>
      </div>
      
      <div className="p-3 border-t border-gray-100 bg-white">
         <div className="relative">
            <input type="text" placeholder="Ask anything..." className="w-full bg-gray-50 border border-gray-100 placeholder:text-gray-400 text-sm font-medium rounded-full py-2.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-base/20 transition-all" />
            <button type="button" className="absolute right-1 top-1 bottom-1 aspect-square rounded-full bg-primary-base text-white flex items-center justify-center shadow-md hover:scale-105 transition-transform">
               <Send className="size-3.5 ml-0.5" />
            </button>
         </div>

      </div>
    </motion.div>
  );
}
