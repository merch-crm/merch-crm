'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '../utils/cn';

interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  timestamp: string;
  sender?: string;
  variant: 'incoming' | 'outgoing';
  avatarUrl?: string;
}

function ChatBubble({ message, timestamp, sender, variant, avatarUrl, className, ...rest }: ChatBubbleProps) {
  const isOutgoing = variant === 'outgoing';
  return (
    <div className={cn('flex gap-3 group', isOutgoing && 'flex-row-reverse', className)} {...rest}>
      {!isOutgoing && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-[11px] font-bold text-slate-400 overflow-hidden ring-2 ring-bg-white-0 shadow-sm border border-stroke-soft-200 relative">
          {avatarUrl ? (
            <Image 
              src={avatarUrl} 
              alt={sender || "Avatar"} 
              width={32}
              height={32}
              className="size-full object-cover" 
            />
          ) : (
            sender?.[0]?.toUpperCase()
          )}
        </div>
      )}
      <div className={cn('flex max-w-[75%] flex-col gap-1', isOutgoing && 'items-end')}>
        {sender && !isOutgoing && (
          <span className="text-[11px] font-black uppercase tracking-tight text-slate-400  ml-1 leading-none ">
            {sender}
          </span>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-[11px] leading-relaxed shadow-sm font-bold transition-all duration-200',
            isOutgoing 
              ? 'rounded-br-[4px] bg-primary-base text-white hover:bg-primary-dark shadow-primary-base/10' 
              : 'rounded-bl-[4px] bg-bg-weak-50 text-slate-900 border border-stroke-soft-200 hover:bg-bg-white-0 hover:shadow-md',
          )}
        >
          {message}
        </div>
        <span className="text-[11px] font-black uppercase tracking-tighter text-slate-400 opacity-0 transition-opacity group-hover:opacity-100 tabular-nums">
          {timestamp}
        </span>
      </div>
    </div>
  );
}

export { ChatBubble };
export type { ChatBubbleProps };
