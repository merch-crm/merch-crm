'use client';

import * as React from 'react';
import { User, Building2, Calendar, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  amount: React.ReactNode | number;
  currency?: string;
  contact?: React.ReactNode;
  company?: React.ReactNode;
  probability?: number;
  dueDate?: React.ReactNode;
  stage?: React.ReactNode;
  stageColor?: string;
  draggable?: boolean;
}

const DealCard = React.forwardRef<HTMLDivElement, DealCardProps>(
  ({ title, amount, currency = '₽', contact, company, probability, dueDate, stage, stageColor, draggable, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group flex flex-col gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm transition duration-200 hover:shadow-md hover:border-primary-base/30',
          draggable && 'cursor-grab active:cursor-grabbing',
          className,
        )}
        {...rest}
      >
        {stage && (
          <div className="flex items-center gap-2">
            <span className={cn('size-1.5 rounded-full ring-2 ring-bg-white-0', stageColor || 'bg-primary-base')} />
            <span className="text-[11px] font-bold text-text-soft-400  ">
              {stage}
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-bold leading-snug text-text-strong-950 line-clamp-2">
            {title}
          </h4>
          <span className="shrink-0 text-sm font-bold text-text-strong-950 tabular-nums">
            {currency}{typeof amount === 'number' ? amount.toLocaleString('ru-RU') : amount}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {contact && (
            <div className="flex items-center gap-2 text-xs font-medium text-text-sub-600">
              <User className="size-3.5 text-text-soft-400" />
              <span className="truncate">{contact}</span>
            </div>
          )}
          {company && (
            <div className="flex items-center gap-2 text-xs font-medium text-text-sub-600">
              <Building2 className="size-3.5 text-text-soft-400" />
              <span className="truncate">{company}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stroke-soft-200 pt-3">
          {dueDate && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-soft-400 tabular-nums">
              <Calendar className="size-3" />
              <span>{dueDate}</span>
            </div>
          )}
          {probability !== undefined && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-base tabular-nums">
              <Percent className="size-3" />
              <span>{probability}%</span>
            </div>
          )}
        </div>
      </div>
    );
  },
);
DealCard.displayName = 'DealCard';

export { DealCard };
export type { DealCardProps };
