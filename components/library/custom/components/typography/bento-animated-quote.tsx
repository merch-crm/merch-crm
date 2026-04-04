"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function BentoAnimatedQuote() {
  const [index, setIndex] = useState(0);
  const quotes = [
    "Дизайн — это мышление, ставшее видимым.",
    "Простота — высшая форма изысканности.",
    "Делай просто, но со смыслом."
  ];

  useEffect(() => {
    const timer = setInterval(() => setIndex(prev => (prev + 1) % quotes.length), 4000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex items-center justify-center min-h-[200px]">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-xl font-black text-center text-gray-900 leading-tight tracking-normal transition-all"
        >
          {quotes[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
