'use client';

import * as React from 'react';
import { ChevronRight, ArrowDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface ConversionFunnelProps extends React.HTMLAttributes<HTMLDivElement> {
  stages: FunnelStage[];
}

function ConversionFunnel({ stages, className, ...rest }: ConversionFunnelProps) {
  const maxValue = Math.max(...stages.map((s) => s.value), 1);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  return (
    <div className={cn('flex flex-col gap-5', className)} {...rest}>
      {stages.map((stage, idx) => {
        const widthPct = (stage.value / maxValue) * 100;
        const prevValue = idx > 0 ? stages[idx - 1].value : null;
        const conversionRate = prevValue ? ((stage.value / prevValue) * 100).toFixed(1) : null;
        const dropOffPct = prevValue ? (100 - parseFloat(conversionRate!)).toFixed(1) : null;

        return (
          <motion.div 
            key={stage.label} 
            className="flex flex-col gap-2 relative group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.5, ease: "easeOut" }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Header with Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {idx > 0 && (
                  <motion.div
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.15 + 0.2 }}
                  >
                    <ChevronRight className="size-3.5 text-slate-300" />
                  </motion.div>
                )}
                <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors tracking-tight">
                  {stage.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <motion.span 
                  className="text-sm font-black text-slate-950 tabular-nums"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.15 + 0.3 }}
                >
                  {stage.value.toLocaleString()}
                </motion.span>
                {conversionRate && (
                  <span className="text-[11px] font-black text-slate-400 tabular-nums bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                    {conversionRate}%
                  </span>
                )}
              </div>
            </div>

            {/* Bar with Animation */}
            <div className="h-4 w-full overflow-hidden rounded-lg bg-slate-50 border border-slate-100/50 relative">
              <motion.div
                className={cn('h-full rounded-md relative overflow-hidden', stage.color)}
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ delay: idx * 0.15 + 0.1, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Shine effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-20"
                  animate={{ x: ['-100%', '1000%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                />
              </motion.div>
              
              {/* Drop-off tooltip (Functional part) */}
              <AnimatePresence>
                {hoveredIdx === idx && dropOffPct && (
                  <motion.div 
                    className="absolute right-0 -top-10 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-element shadow-xl z-20 flex items-center gap-2"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  >
                    <ArrowDownRight className="size-3 text-rose-500" />
                    <span className="text-[10px] font-black text-rose-600 tracking-widest whitespace-nowrap">
                      Loss: {dropOffPct}%
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export { ConversionFunnel };
export type { ConversionFunnelProps, FunnelStage };
