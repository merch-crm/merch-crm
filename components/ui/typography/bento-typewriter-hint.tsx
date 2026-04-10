"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { Typo } from "@/components/ui/typo";

export function BentoTypewriterHint({ text = "Click here to initialize system..." }: { text?: string }) {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className="w-full max-w-sm rounded-card bg-white border border-gray-100 p-8 flex flex-col gap-3 shadow-crm-md">
      <div className="flex items-center gap-2 mb-2">
         <div className="size-2 rounded-full bg-red-500" />
         <div className="size-2 rounded-full bg-amber-500" />
         <div className="size-2 rounded-full bg-emerald-500" />
      </div>

      <div className="flex items-start gap-3">
         <Terminal className="size-4 text-emerald-500 mt-1 shrink-0" />
         <div className="font-mono text-xs leading-relaxed">
            <Typo as="span" className="text-gray-950">{displayText}</Typo>
            <motion.span 
               animate={{ opacity: [0, 1, 0] }}
               transition={{ duration: 0.8, repeat: Infinity }}
               className="inline-block w-2 h-4 bg-primary-base ml-1 align-middle"
            />
         </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
         <Typo as="span" className="text-xs font-black text-gray-400 tracking-tight">Ожидание ввода</Typo>
         <Typo as="span" className="text-xs font-mono text-emerald-400">Готово</Typo>
      </div>
    </div>
  );
}
