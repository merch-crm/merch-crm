"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';
import { BentoCard } from "@/components/library/custom/ui/bento-primitives";

export function BentoGestureCheckbox() {
  const [checked, setChecked] = useState(false);

  return (
    <BentoCard>
      <h3 className="text-sm font-black text-gray-900">Шаг Рабочего Процесса</h3>
      
      <div 
        role="button"
        tabIndex={0}
        aria-pressed={checked}
        aria-label="Toggle step completion"
        onClick={() => setChecked(!checked)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setChecked(!checked);
          }
        }}
        className={cn(
          "flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20",
          checked ? "bg-emerald-50 border-emerald-500/20" : "bg-gray-50 border-gray-100"
        )}
      >
        <div className={cn(
          "size-8 rounded-xl border-2 flex items-center justify-center transition-all",
          checked ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg shadow-emerald-200" : "bg-white border-gray-200"
        )}>
          <AnimatePresence mode="wait">
            {checked && (
              <motion.div
                key="checked"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
              >
                <Check className="size-5 stroke-[3]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1">
           <p className={cn("text-xs font-black transition-colors", checked ? "text-emerald-900" : "text-gray-900")}>
              Отметить завершение
           </p>
           <p className="text-[11px] font-bold text-gray-400 mt-0.5">Сохранение состояния локально</p>
        </div>

        <div className={cn("size-2 rounded-full", checked ? "bg-emerald-500" : "bg-gray-200")} />
      </div>



    </BentoCard>
  );
}
