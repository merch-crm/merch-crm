'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealStage {
  label: string;
  date?: string;
  completed: boolean;
  active?: boolean;
}

interface DealTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  stages: DealStage[];
}

function DealTimeline({ stages, className, ...rest }: DealTimelineProps) {
  return (
    <div className={cn('flex items-center gap-1 w-full', className)} {...rest}>
      {stages.map((stage, idx) => (
        <React.Fragment key={stage.label}>
          <div className="flex flex-col items-center gap-2 min-w-[60px]">
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ring-4 ring-bg-white-0 shadow-sm border-2',
                stage.completed
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : stage.active
                  ? 'bg-primary-base border-primary-base text-white'
                  : 'bg-bg-weak-50 border-stroke-soft-200 text-text-soft-400',
              )}
            >
              {stage.completed ? <Check className="size-4" /> : idx + 1}
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  'text-[11px] font-bold text-center   tabular-nums',
                  stage.active ? 'text-primary-base' : 'text-text-soft-400',
                )}
              >
                {stage.label}
              </span>
              {stage.date && (
                <span className="text-[11px] font-semibold text-text-soft-400 tabular-nums">
                  {stage.date}
                </span>
              )}
            </div>
          </div>
          {idx < stages.length - 1 && (
            <div className="h-0.5 flex-1 min-w-[20px] rounded-full mx-1">
               <div className={cn('h-full w-full rounded-full transition-all duration-500 ease-in-out', 
                 stage.completed ? 'bg-emerald-400' : 'bg-stroke-soft-200')} 
               />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export { DealTimeline };
export type { DealTimelineProps, DealStage };
