"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function BentoSplitHeading({ text = "CREATIVE" }: { text?: string }) {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col items-center justify-center gap-3 h-48 group">
      <div className="flex gap-1">
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            whileHover={{ y: -10, color: "var(--primary-base)" }}
            className="text-5xl font-black text-gray-900 cursor-default select-none transition-colors"
          >
            {char}
          </motion.span>
        ))}
      </div>
      <p className="text-[11px] font-black text-gray-400  tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-opacity">
        Interactive Type
      </p>
    </div>
  );
}
