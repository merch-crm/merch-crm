"use client";

import React from 'react';
import { Circle, Clock, MinusCircle } from 'lucide-react';
import { cn } from '@/components/library/custom/utils/cn';

export function BentoAvatarStatus() {
  const statuses = [
    { label: 'Online', icon: Circle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { label: 'Away', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500' },
    { label: 'Busy', icon: MinusCircle, color: 'text-rose-500', bg: 'bg-rose-500' }
  ];

  return (
    <div className="w-full max-w-sm rounded-[32px] bg-white border border-gray-100 shadow-crm-md p-8 flex flex-col gap-3">
      <h3 className="text-sm font-black text-gray-900">Presence Sync</h3>

      <div className="grid grid-cols-3 gap-3">
        {statuses.map((s, i) => (
          <div key={i} className="flex flex-col items-center gap-3">
             <div className="relative">
                <div className="size-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                   <div className="size-8 rounded-lg bg-gray-200 animate-pulse" />
                </div>
                <div className={cn("absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-white", s.bg)} />
             </div>
             <span className={cn("text-[11px] font-black  ", s.color)}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
         <span className="text-[11px] font-bold text-gray-400">Total Available</span>
         <span className="text-xs font-black text-gray-900">14 Managers</span>
      </div>
    </div>
  );
}
