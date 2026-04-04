"use client";

import React from 'react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoGradientText() {
  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col items-center justify-center h-48 group">
      <h2 className={cn(
        "text-5xl font-black text-center leading-none transition-all duration-700",
        "bg-gradient-to-r from-primary-base via-indigo-500 to-emerald-500 bg-clip-text text-transparent bg-[length:200%_auto]",
        "group-hover:bg-right"
      )}>
        Современная <br /> эстетика
      </h2>
    </div>
  );
}
