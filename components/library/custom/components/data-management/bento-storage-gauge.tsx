"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { HardDrive, AlertTriangle } from 'lucide-react';

export function BentoStorageGauge({ percentage = 74 }: { percentage?: number }) {
  const isHigh = percentage > 85;

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-gray-400" />
          <h3 className="text-sm font-black text-gray-900">Database Storage</h3>
        </div>
        {isHigh && (
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-[11px] font-black"
          >
            <AlertTriangle className="size-3" /> NEAR LIMIT
          </motion.div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center p-4 relative">
         <svg className="size-32 transform -rotate-90">
            <circle
              cx="64" cy="64" r="58"
              stroke="rgb(249 250 251)"
              strokeWidth="10"
              fill="none"
            />
            <motion.circle
              cx="64" cy="64" r="58"
              stroke={isHigh ? "rgb(239 68 68)" : "rgb(59 130 246)"}
              strokeWidth="10"
              fill="none"
              strokeDasharray={364}
              initial={{ strokeDashoffset: 364 }}
              animate={{ strokeDashoffset: 364 - (364 * percentage) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
         </svg>
         
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-950 ">{percentage}%</span>
            <span className="text-[11px] font-black text-gray-400   mt-0.5">Used</span>
         </div>
      </div>

      <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 border-t border-gray-50 pt-4 px-2">
         <div className="flex flex-col gap-0.5">
            <span className="text-gray-900">7.4 GB</span>
            <span className="text-[11px]  ">Occupied</span>
         </div>
         <div className="flex flex-col gap-0.5 text-right">
            <span className="text-gray-900">10 GB</span>
            <span className="text-[11px]  ">Total Limit</span>
         </div>
      </div>
    </div>
  );
}
