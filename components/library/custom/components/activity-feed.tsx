'use client';

import * as React from 'react';
import { Mail, Phone, Calendar, MessageSquare, FileText, CheckCircle, type LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

type ActivityType = 'email' | 'call' | 'meeting' | 'note' | 'task' | 'deal';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  user?: string;
}

interface ActivityFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ActivityItem[];
  maxItems?: number;
}

const activityIcons: Record<ActivityType, { icon: LucideIcon; color: string }> = {
  email: { icon: Mail, color: 'bg-blue-50 text-blue-600' },
  call: { icon: Phone, color: 'bg-emerald-50 text-emerald-600' },
  meeting: { icon: Calendar, color: 'bg-indigo-50 text-indigo-600' },
  note: { icon: MessageSquare, color: 'bg-amber-50 text-amber-600' },
  task: { icon: CheckCircle, color: 'bg-cyan-50 text-cyan-600' },
  deal: { icon: FileText, color: 'bg-pink-50 text-pink-600' },
};

function ActivityFeed({ items, maxItems, className, ...rest }: ActivityFeedProps) {
  const visibleItems = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      {visibleItems.map((item, idx) => {
        const config = activityIcons[item.type];
        const Icon = config.icon;
        const isLast = idx === visibleItems.length - 1;

        return (
          <div key={item.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-full shadow-sm ring-4 ring-bg-white-0',
                  config.color,
                )}
              >
                <Icon className="size-4.5" />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-stroke-soft-200 mt-2 rounded-full" />
              )}
            </div>
            <div className={cn('flex flex-col gap-1.5 pb-2', !isLast && 'mb-4')}>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.title}</span>
                <span className="text-[11px] font-semibold text-text-soft-400 tabular-nums">
                  {item.timestamp}
                </span>
              </div>
              {item.description && (
                <p className="text-[11px] font-bold leading-relaxed text-slate-500 line-clamp-3">
                  {item.description}
                </p>
              )}
              {item.user && (
                <div className="flex items-center gap-1.5 pt-1">
                   <div className="size-1.5 rounded-full bg-primary-base" />
                   <span className="text-[11px] font-black text-slate-400/80 uppercase tracking-tighter">— {item.user}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ActivityFeed };
export type { ActivityFeedProps, ActivityItem, ActivityType };
