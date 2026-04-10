"use client";

import React from 'react';
import { Terminal, Copy } from 'lucide-react';

export function BentoCodeDiff() {
  return (
    <div className="w-full max-w-sm rounded-card bg-white p-6 flex flex-col gap-3 border border-gray-100 shadow-crm-md">
      <div className="flex items-center justify-between px-2">
         <div className="flex items-center gap-2">
            <Terminal className="size-3.5 text-emerald-500" />
            <span className="text-xs font-mono text-gray-500">lib/utils.ts</span>
         </div>
         <Copy className="size-3.5 text-gray-300 hover:text-gray-950 cursor-pointer transition-colors" />
      </div>

      <div className="font-mono text-xs leading-relaxed overflow-hidden rounded-xl bg-gray-50 p-4 border border-gray-100/50">
         <div className="flex gap-3">
            <span className="text-gray-400 select-none">24</span>
            <span className="text-emerald-600 tracking-normal">const kit = &quot;apple&quot;;</span>
         </div>
         <div className="flex gap-3 bg-red-50 -mx-4 px-4 py-0.5">
            <span className="text-red-300 select-none">25</span>
            <span className="text-red-500 tracking-normal">- return kit.v3;</span>
         </div>
         <div className="flex gap-3 bg-emerald-50 -mx-4 px-4 py-0.5">
            <span className="text-emerald-300 select-none">26</span>
            <span className="text-emerald-600 tracking-normal">+ return kit.v4;</span>
         </div>
         <div className="flex gap-3">
            <span className="text-gray-400 select-none">27</span>
            <span className="text-indigo-600 tracking-normal">export default kit;</span>
         </div>
      </div>

      <div className="text-xs font-black text-gray-400  tracking-tight text-center">
         Конфликт версий разрешён
      </div>
    </div>
  );
}
