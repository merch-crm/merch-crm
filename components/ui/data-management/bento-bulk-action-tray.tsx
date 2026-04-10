"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, Mail, Download, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Typo } from "@/components/ui/typo";

/**
 * BentoBulkActionTray - A floating action tray for bulk operations.
 * High-Premium aesthetic with full accessibility and normalized typography.
 */
export function BentoBulkActionTray({ 
  selectedCount = 1,
  onClear = () => {},
  inline = false
}: { 
  selectedCount?: number;
  onClear?: () => void;
  inline?: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
           initial={{ y: 100, opacity: 0, scale: 0.9 }}
           animate={{ y: 0, opacity: 1, scale: 1 }}
           exit={{ y: 100, opacity: 0, scale: 0.9 }}
           className={cn(
             "w-full max-w-xl rounded-card bg-slate-950 p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex items-center gap-4 border border-white/10 overflow-hidden group/tray backdrop-blur-xl",
             inline 
               ? "relative z-[100] scale-90 sm:scale-100" 
               : "fixed bottom-12 left-1/2 -translate-x-1/2 z-[100]"
           )}
        >
           {/* Animated logic glow */}
           <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-80 shadow-[0_0_20px_rgba(37,99,235,0.5)] animate-pulse" />
           
           <div className="size-14 rounded-element bg-white/5 flex flex-col items-center justify-center text-white shrink-0 border border-white/10 shadow-inner group/node">
              <Typo as="span" className="text-xl font-black leading-none tracking-tighter tabular-nums">{selectedCount.toString().padStart(2, '0')}</Typo>
              <Typo as="span" className="text-[10px] font-black mt-1 tracking-widest text-blue-400 opacity-80 uppercase">Шт.</Typo>
           </div>

           <div className="flex flex-1 items-center gap-3 justify-center">
              <button 
                type="button" 
                aria-label="Отправить письмо выбранным"
                className="size-11 rounded-element bg-white/5 text-white hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-500 border border-white/5 focus-visible:ring-4 focus-visible:ring-white/10 outline-none group/btn shadow-lg hover:shadow-blue-600/20"
              >
                 <Mail className="size-5" />
              </button>
              <button 
                type="button" 
                aria-label="Редактировать выбранные"
                className="size-11 rounded-element bg-white/5 text-white hover:bg-slate-800 flex items-center justify-center transition-all duration-500 border border-white/5 focus-visible:ring-4 focus-visible:ring-white/10 outline-none group/btn shadow-lg"
              >
                 <Edit className="size-5" />
              </button>
              <button 
                type="button" 
                aria-label="Скачать выбранные данные"
                className="size-11 rounded-element bg-white/5 text-white hover:bg-slate-800 flex items-center justify-center transition-all duration-500 border border-white/5 focus-visible:ring-4 focus-visible:ring-white/10 outline-none group/btn shadow-lg"
              >
                 <Download className="size-5" />
              </button>
              <div className="w-px h-8 bg-white/10 mx-2" />
              <button 
                type="button" 
                aria-label="Удалить выбранные"
                className="size-11 rounded-element bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-all duration-500 border border-rose-500/20 focus-visible:ring-4 focus-visible:ring-rose-500/20 outline-none group/btn shadow-lg hover:shadow-rose-500/20"
              >
                 <Trash2 className="size-5" />
              </button>
           </div>

           <div className="flex flex-col items-end pr-4 shrink-0 text-right">
              <Typo as="span" className="text-[9px] font-black text-slate-500 tracking-widest whitespace-nowrap uppercase">Массовые операции</Typo>
              <Typo as="span" className="text-[10px] font-black text-white tracking-[0.2em] flex items-center gap-2 justify-end uppercase">
                 <Zap className="size-3 text-amber-400 fill-amber-400" /> Активно
              </Typo>
           </div>

           <button 
             type="button"
             onClick={onClear}
             aria-label="Сбросить выделение"
             className="size-10 rounded-full flex items-center justify-center text-white/20 hover:text-white hover:bg-white/10 transition-all duration-500 focus-visible:ring-4 focus-visible:ring-white/10 outline-none shrink-0"
           >
              <X className="size-5 stroke-[3px]" />
           </button>

           <div className="absolute right-0 bottom-0 size-24 bg-blue-600/10 blur-3xl rounded-full -z-10 group-hover/tray:bg-blue-600/20 transition-colors duration-1000" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
