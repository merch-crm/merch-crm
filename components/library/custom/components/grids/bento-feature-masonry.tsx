"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/components/library/custom/utils/cn';

const features = [
  { title: 'Cloud Sync', desc: 'Real-time database mirroring.', size: 'col-span-2' },
  { title: 'AI Audit', desc: 'Auto-scan for anomalies.', size: 'col-span-1' },
  { title: 'API Gen', desc: 'Instant REST endpoints.', size: 'col-span-1' },
  { title: 'Global CDN', desc: 'Edge delivery in 12 regions.', size: 'col-span-2' },
];

export function BentoFeatureMasonry() {
  return (
    <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-3 gap-3">
      {features.map((f, i) => (
        <motion.div 
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "rounded-[32px] p-8 border border-gray-100 bg-white shadow-crm-md flex flex-col justify-end min-h-[200px] hover:border-primary-base transition-colors group cursor-default",
            f.size
          )}
        >
           <h4 className="text-lg font-black text-gray-950  group-hover:text-primary-base transition-colors">{f.title}</h4>
           <p className="text-[11px] font-bold text-gray-400   mt-1">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
