'use client';

import * as React from 'react';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '../utils/cn';

interface EventCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  type: string;
  startTime: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
  status?: 'upcoming' | 'ongoing' | 'past' | 'cancelled';
}

const statusConfig: Record<string, { color: string; label: string }> = {
  upcoming: { color: 'bg-primary-base text-white', label: 'Предстоит' },
  ongoing: { color: 'bg-emerald-500 text-white animate-pulse', label: 'Идет сейчас' },
  past: { color: 'bg-bg-weak-50 text-text-soft-400', label: 'Завершено' },
  cancelled: { color: 'bg-red-50 text-red-600', label: 'Отменено' },
};

function EventCard({ title, type, startTime, endTime, location, attendees, status = 'upcoming', className, ...rest }: EventCardProps) {
  const config = statusConfig[status];
  return (
    <div
      className={cn(
        'group flex flex-col gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-sm transition duration-200 hover:shadow-md hover:border-primary-base/20',
        className,
      )}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[11px] font-bold   text-text-soft-400">
            {type}
          </span>
          <h4 className="text-sm font-bold text-text-strong-950 truncate ">{title}</h4>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold  ', config.color)}>
          {config.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-sub-600 tabular-nums">
          <Clock className="size-3.5 text-primary-base" />
          <span>{startTime}{endTime && ` - ${endTime}`}</span>
        </div>
        {location && (
          <div className="flex items-center gap-2 text-xs font-medium text-text-soft-400 transition hover:text-text-sub-600 cursor-default">
            <MapPin className="size-3.5" />
            <span className="truncate max-w-[120px]">{location}</span>
          </div>
        )}
      </div>

      {attendees && attendees.length > 0 && (
        <div className="flex items-center justify-between border-t border-stroke-soft-200 pt-4">
          <div className="flex items-center -space-x-2">
            {attendees.slice(0, 3).map((a, i) => (
              <div
                key={i}
                className="flex size-7 items-center justify-center rounded-full bg-bg-weak-50 text-[11px] font-bold text-text-soft-400 ring-2 ring-bg-white-0 shadow-sm transition-all duration-300 group-hover:ring-primary-base/20"
              >
                {a[0].toUpperCase()}
              </div>
            ))}
            {attendees.length > 3 && (
              <div className="flex size-7 items-center justify-center rounded-full bg-bg-weak-50 text-[11px] font-bold text-text-soft-400 ring-2 ring-bg-white-0 shadow-sm border border-stroke-soft-200">
                +{attendees.length - 3}
              </div>
            )}
          </div>
          <button type="button" className="text-[11px] font-bold text-primary-base hover:underline transition-all">
            Детали встречи
          </button>
        </div>
      )}
    </div>
  );
}

export { EventCard };
export type { EventCardProps };
