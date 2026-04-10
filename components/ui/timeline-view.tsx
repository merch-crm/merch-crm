'use client';

import * as React from 'react';
import { Calendar, CheckCircle, Clock, Info, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'event' | 'task' | 'milestone' | 'info';
  status?: 'completed' | 'current' | 'upcoming';
}

interface TimelineViewProps extends React.HTMLAttributes<HTMLDivElement> {
  events: TimelineEvent[];
}

const typeConfig: Record<TimelineEvent['type'], { icon: LucideIcon; color: string }> = {
  event: { icon: Calendar, color: 'bg-primary-base text-white ring-primary-base/20' },
  task: { icon: CheckCircle, color: 'bg-emerald-500 text-white ring-emerald-500/20' },
  milestone: { icon: Clock, color: 'bg-violet-500 text-white ring-violet-500/20' },
  info: { icon: Info, color: 'bg-bg-weak-50 text-text-soft-400 ring-stroke-soft-200' },
};

function TimelineView({ events, className, ...rest }: TimelineViewProps) {
  return (
    <div className={cn('flex flex-col gap-0', className)} {...rest}>
      {events.map((event, idx) => {
        const config = typeConfig[event.type] || typeConfig.info;
        const Icon = config.icon;
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className="flex gap-3 group">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full shadow-md z-10 transition-all duration-300 ring-4 ring-bg-white-0',
                  config.color,
                  event.status === 'upcoming' && 'bg-bg-weak-50 text-text-soft-400 ring-stroke-soft-100 border-2 border-stroke-soft-200',
                  event.status === 'current' && 'scale-110 shadow-primary-base/30 ring-primary-base/10',
                )}
              >
                <Icon className="size-4.5" />
              </div>
              {!isLast && (
                <div className={cn('w-0.5 flex-1 rounded-full my-2 h-[40px]', 
                  event.status === 'completed' ? 'bg-emerald-400' : 'bg-stroke-soft-200')} 
                />
              )}
            </div>
            <div className={cn('flex flex-col gap-1.5 pb-8 pt-0.5 min-w-0', !isLast && 'mb-0')}>
              <div className="flex items-center gap-3">
                <span className={cn('text-sm font-bold  text-text-strong-950', 
                  event.status === 'upcoming' && 'text-text-soft-400 font-medium')}>
                  {event.title}
                </span>
                <span className="text-[11px] font-bold text-text-soft-400 tabular-nums">
                  {event.timestamp}
                </span>
              </div>
              {event.description && (
                <p className={cn('text-xs font-medium leading-relaxed max-w-sm line-clamp-2 transition-colors',
                  event.status === 'upcoming' ? 'text-text-soft-400 opacity-60' : 'text-text-sub-600 group-hover:text-text-strong-950')}>
                  {event.description}
                </p>
              )}
              {event.status === 'current' && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in slide-in-from-left-2 duration-500">
                  <div className="size-1.5 rounded-full bg-primary-base animate-ping" />
                  <span className="text-[11px] font-bold text-primary-base">
                    В процессе
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { TimelineView };
export type { TimelineViewProps, TimelineEvent };
