"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/components/library/custom/utils/cn';
import { Phone, MessageSquare, MoreHorizontal } from 'lucide-react';

export function BentoContactChip({ 
  name = "Sarah Jenkins", 
  role = "Product Manager",
  status = "online",
  company = "TechCorp"
}: { 
  name?: string; 
  role?: string;
  status?: "online" | "offline" | "busy";
  company?: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-[24px] bg-white border border-gray-100 shadow-sm w-full max-w-[320px] transition-all hover:shadow-md group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="size-12 rounded-full overflow-hidden bg-gray-100 p-0.5 border border-gray-200 relative">
             <div className="w-full h-full rounded-full overflow-hidden relative">
                <Image 
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name}`} 
                  alt={name} 
                  width={48}
                  height={48}
                  className="w-full h-full object-cover" 
                />
             </div>
          </div>
          <div className={cn(
             "absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-white z-10",
             status === 'online' ? "bg-emerald-500" : status === 'busy' ? "bg-red-500" : "bg-gray-400"
          )} />
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-black text-gray-900 leading-tight group-hover:text-primary-base transition-colors">{name}</h4>
          <span className="text-[11px] font-bold text-gray-400">{role} at {company}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
         <button type="button" className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
            <MessageSquare className="size-3.5" />
         </button>
         <button type="button" className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 transition-colors">
            <Phone className="size-3.5" />
         </button>
         <button type="button" className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="size-3.5" />
         </button>
      </div>
    </div>
  );
}
