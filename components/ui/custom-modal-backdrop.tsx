"use client";

import React, { useState, useEffect } from "react";
import { X, Ghost } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CustomModalBackdrop() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isMounted) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-40 h-14 rounded-element bg-slate-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex justify-center p-8">
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Открыть оверлей"
        className="rounded-element px-10 h-14 text-[11px] font-black tracking-[0.2em] bg-slate-950 hover:bg-primary-base text-white border-0 shadow-2xl shadow-black/20 hover:shadow-primary-base/30 transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20"
        onClick={() => setIsOpen(true)}
      >
        Открыть оверлей
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title-matrix"
          >
             {/* Sophisticated Gradient Backdrop with Blur */}
             <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                type="button"
                aria-label="Закрыть"
                className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent backdrop-blur-xl transition-all duration-700 cursor-default outline-none border-0" 
                onClick={() => setIsOpen(false)}
             />
             
             {/* Dialog Container */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-[420px] bg-white rounded-card shadow-2xl overflow-hidden border border-slate-100/50"
             >
                <button 
                  type="button"
                  aria-label="Закрыть"
                  onClick={() => setIsOpen(false)}
                  className="absolute top-8 right-8 size-12 rounded-element bg-slate-50 flex items-center justify-center hover:bg-slate-100 hover:text-slate-950 transition-all z-10 outline-none focus-visible:ring-4 focus-visible:ring-slate-200 border-0"
                >
                  <X className="size-5 text-slate-400" />
                </button>

                <div className="p-12 flex flex-col items-center text-center">
                   <div className="size-20 rounded-card bg-primary-base/10 flex items-center justify-center text-primary-base mb-8 shadow-inner border border-primary-base/10 relative">
                      <Ghost className="size-10 animate-bounce" />
                      <div className="absolute inset-0 rounded-card border border-primary-base/20 animate-ping" />
                   </div>
                   
                   <h3 id="modal-title-matrix" className="text-[12px] font-black text-slate-900 tracking-[0.3em] mb-6">
                      Bento Backdrop Pro
                   </h3>
                   
                   <div className="space-y-4">
                      <p className="text-[11px] font-black text-slate-500 tracking-widest leading-relaxed">
                        Эта фирменная архитектура фона использует динамический 
                        <span className="text-primary-base mx-1 font-black underline decoration-primary-base/20 decoration-2 underline-offset-4">градиент</span>,
                        который бесшовно адаптируется к окружающему освещению. 
                      </p>
                      <p className="text-[10px] font-black text-slate-300 tracking-tighter leading-relaxed italic">
                        Интегрированный движок размытия по Гауссу обеспечивает 100% читаемость всех узлов интерфейса.
                      </p>
                   </div>

                   <div className="w-full mt-12 flex flex-col gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        aria-label="Принять"
                        className="w-full rounded-element h-16 text-[11px] font-black tracking-[0.2em] bg-slate-950 text-white shadow-2xl shadow-black/30 hover:bg-primary-base hover:shadow-primary-base/40 transition-all outline-none focus-visible:ring-4 focus-visible:ring-primary-base/20 border-0" 
                        onClick={() => setIsOpen(false)}
                      >
                        Принять
                      </motion.button>
                      <button 
                        type="button"
                        aria-label="Отклонить"
                        className="w-full rounded-element h-16 text-[11px] font-black tracking-widest bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-950 transition-all outline-none focus-visible:ring-4 focus-visible:ring-slate-200 border-0" 
                        onClick={() => setIsOpen(false)}
                      >
                        Отклонить
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
