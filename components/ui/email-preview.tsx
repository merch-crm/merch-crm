'use client';

import * as React from 'react';
import { Paperclip, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  from: string;
  subject: string;
  snippet: string;
  timestamp: string;
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachment?: boolean;
  onStarClick?: () => void;
}

const EmailPreview = React.forwardRef<HTMLDivElement, EmailPreviewProps>(
  ({ from, subject, snippet, timestamp, isRead = false, isStarred = false, hasAttachment, onStarClick, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3 rounded-xl border p-4 transition-all duration-200 cursor-pointer shadow-sm',
          isRead 
            ? 'border-stroke-soft-200 bg-bg-white-0' 
            : 'border-primary-base/20 bg-primary-base/5 ring-1 ring-primary-base/10 shadow-primary-base/5',
          className,
        )}
        {...rest}
      >
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span className={cn('truncate text-sm ', isRead ? 'text-text-sub-600 font-semibold' : 'font-bold text-text-strong-950')}>
              {from}
            </span>
            <span className="shrink-0 text-xs font-bold text-text-soft-400 tabular-nums lowercase">{timestamp}</span>
          </div>
          <span className={cn('truncate text-sm ', isRead ? 'text-text-sub-600 font-medium' : 'font-bold text-text-strong-950')}>
            {subject}
          </span>
          <p className="truncate text-xs font-medium text-text-soft-400 leading-relaxed">{snippet}</p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2">
          <button 
             type="button" 
             onClick={(e) => { e.stopPropagation(); onStarClick?.(); }} 
             className="p-1 rounded-lg hover:bg-bg-weak-50 transition-colors"
          >
            <Star className={cn('size-4.5 transition-all duration-200', isStarred ? 'fill-amber-400 text-amber-400 scale-110' : 'text-text-soft-400')} />
          </button>
          {hasAttachment && <Paperclip className="size-3.5 text-text-soft-400" />}
        </div>
      </div>
    );
  },
);
EmailPreview.displayName = 'EmailPreview';

export { EmailPreview };
export type { EmailPreviewProps };
