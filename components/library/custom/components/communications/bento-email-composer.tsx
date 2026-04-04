"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Paperclip, Send, Image as ImageIcon, Smile, Type, AtSign } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoEmailComposer() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full max-w-lg h-80 rounded-[40px] bg-white border border-slate-100 shadow-crm-md animate-pulse" />;
  }

  return (
    <div className="w-full max-w-lg rounded-[40px] bg-white border border-slate-100 shadow-premium p-3 flex flex-col group/composer hover:border-primary-base/30 transition-all duration-500 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
         <div className="flex items-center gap-2 w-12 shrink-0">
            <AtSign className="size-3 text-slate-400" />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">To</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="px-4 py-1.5 rounded-xl bg-primary-base/10 text-primary-base text-[10px] font-black uppercase tracking-tight flex items-center gap-2 border border-primary-base/10 shadow-sm">
               <div className="size-1.5 rounded-full bg-primary-base animate-pulse" />
               alex@alpha.com
            </div>
         </div>
      </div>
      <div className="px-6 py-5 border-b border-slate-50 flex items-center gap-4">
         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest w-12 shrink-0 leading-none">Sub</span>
         <input 
           type="text" 
           placeholder="Project Alpha Update..." 
           aria-label="Email subject line"
           className="flex-1 text-[11px] font-black text-slate-900 uppercase tracking-tight border-none outline-none placeholder:text-slate-200 bg-transparent focus:placeholder:text-slate-100" 
         />
      </div>
      
      <div className="p-6 flex-1 min-h-[160px]">
         <textarea 
           placeholder="Describe the neural node propagation status..." 
           aria-label="Email message body"
           className="w-full h-full resize-none border-none outline-none text-[11px] font-black text-slate-700 uppercase tracking-tight placeholder:text-slate-200 bg-transparent leading-relaxed focus:placeholder:text-slate-100"
         />
      </div>
      
      <div className="p-4 bg-slate-50/50 rounded-3xl flex items-center justify-between border border-slate-100 mt-2 shadow-inner">
         <div className="flex items-center gap-1.5 p-1">
            {[
               { icon: Type, label: "Text Formatting Options" },
               { icon: Paperclip, label: "Attach Secured Files" },
               { icon: ImageIcon, label: "Insert Media Asset" },
               { icon: Smile, label: "Insert Response Glyph" }
            ].map((tool, i) => (
             <button 
               key={i} 
               type="button" 
               aria-label={tool.label}
               className="p-3 rounded-2xl text-slate-400 hover:text-primary-base hover:bg-white hover:shadow-xl hover:border-primary-base/10 border border-transparent transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary-base/10 group/tool"
             >
                <tool.icon className="size-4 group-hover/tool:scale-110 group-hover/tool:rotate-6 transition-transform" />
              </button>
            ))}
         </div>
         <motion.button 
           type="button"
           aria-label="Transmit email matrix"
           whileHover={{ scale: 1.02 }}
           whileTap={{ scale: 0.98 }}
           className="px-10 py-4 rounded-2xl bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl shadow-black/20 hover:bg-primary-base hover:shadow-primary-base/30 transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20 border border-slate-900"
         >
           Commit
           <Send className="size-4 group-hover:translate-x-1 transition-transform" />
         </motion.button>
      </div>
    </div>
  );
}
