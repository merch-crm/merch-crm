"use client";

import React from 'react';
import { cn } from '@/components/library/custom/utils/cn';
import { Check } from 'lucide-react';

interface BentoMessageBubbleProps {
  message: string;
  time: string;
  type: 'sent' | 'received';
  status?: 'sent' | 'delivered' | 'read';
}

export function BentoMessageBubble({ message, time, type, status = 'sent' }: BentoMessageBubbleProps) {
  return (
    <div className={cn("flex w-full", type === 'sent' ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[70%] p-4 flex flex-col gap-1 relative",
        type === 'sent' 
          ? "bg-primary-base text-white rounded-[24px] rounded-br-[8px]" 
          : "bg-gray-100 text-gray-900 rounded-[24px] rounded-bl-[8px]"
      )}>
        <p className="text-sm font-medium leading-snug">{message}</p>
        <div className={cn("flex items-center justify-end gap-1 mt-1", type === 'sent' ? "opacity-80" : "opacity-60")}>
          <span className="text-[11px] font-bold">{time}</span>
          {type === 'sent' && (
            <div className="flex -space-x-1">
              <Check className={cn("size-3", status === 'read' ? "text-emerald-300" : "text-white")} />
              {(status === 'delivered' || status === 'read') && (
                <Check className={cn("size-3", status === 'read' ? "text-emerald-300" : "text-white")} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
