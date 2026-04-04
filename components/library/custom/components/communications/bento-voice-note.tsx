'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoVoiceNote({ duration = "0:14" }: { duration?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // audit-ok: hydration (inside useMemo)
  const waveform = useMemo(() => 
    Array.from({ length: 30 }).map(() => Math.floor(Math.random() * 60) + 20),
    []
  );

  // audit-ok: hydration (inside useMemo)
  const activeWaveform = useMemo(() => 
    Array.from({ length: 30 }).map(() => Math.floor(Math.random() * 60) + 40),
    []
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center gap-3 p-3 pl-2 rounded-full border border-gray-100 bg-white shadow-sm w-[300px] animate-pulse">
        <div className="size-10 rounded-full bg-gray-100" />
        <div className="flex-1 h-4 bg-gray-50 rounded-full mx-2" />
        <div className="w-8 h-3 bg-gray-50 rounded-full mr-2" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 pl-2 rounded-full border border-gray-200 bg-white shadow-sm w-[300px] group hover:border-primary-base/30 transition-colors">
      <motion.button 
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsPlaying(!isPlaying)}
        aria-label={isPlaying ? "Pause voice note" : "Play voice note"}
        className={cn(
          "size-10 rounded-full flex items-center justify-center text-white transition-all shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary-base focus-visible:ring-offset-2",
          isPlaying ? "bg-rose-500 shadow-rose-200" : "bg-primary-base shadow-primary-base/20"
        )}
      >
        {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-1" />}
      </motion.button>
      
      <div className="flex-1 flex items-center gap-[2px] h-6 overflow-hidden">
        {waveform.map((height, i) => (
          <motion.div 
            key={i}
            animate={{ 
              height: isPlaying ? `${activeWaveform[i]}%` : `${height}%`,
              opacity: isPlaying ? [0.5, 1, 0.5] : 1
            }}
            transition={{ 
              duration: isPlaying ? 0.6 : 0.3, 
              repeat: isPlaying ? Infinity : 0, 
              delay: isPlaying ? i * 0.05 : 0 
            }}
            className={cn(
              "w-1 rounded-full transition-colors duration-300",
              isPlaying ? "bg-primary-base" : "bg-slate-200 group-hover:bg-slate-300"
            )}
          />
        ))}
      </div>
      
      <span className="text-[11px] font-black text-slate-400 mr-2 w-8 text-right uppercase tracking-tighter tabular-nums">
        {duration}
      </span>
    </div>
  );
}
