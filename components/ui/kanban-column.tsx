'use client';

import * as React from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  count?: number;
  total?: React.ReactNode;
  color?: string;
  onAdd?: () => void;
}

const KanbanColumn = React.forwardRef<HTMLDivElement, KanbanColumnProps>(
  ({ title, count, total, color = 'bg-primary-base', onAdd, children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex w-[320px] shrink-0 flex-col rounded-element bg-bg-weak-50 border border-stroke-soft-200 shadow-sm transition-all duration-200',
          className,
        )}
        {...rest}
      >
        <div className="flex items-center justify-between p-4 pb-0">
          <div className="flex items-center gap-2.5">
            <div className={cn('size-2 rounded-full ring-4 ring-bg-white-0', color)} />
            <h3 className="text-sm font-bold text-text-strong-950  ">
              {title}
            </h3>
            {count !== undefined && (
              <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-bg-white-0 border border-stroke-soft-200 text-[11px] font-bold text-text-soft-400 tabular-nums">
                {count}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-text-soft-400 tabular-nums">
                {total}
              </span>
            <button
              type="button"
              className="rounded-lg p-1.5 text-text-soft-400 transition hover:bg-bg-white-0 hover:text-text-strong-950 hover:shadow-sm"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4 scrollbar-hide">
          {children}
        </div>

        {onAdd && (
          <div className="p-4 pt-1">
            <button
              type="button"
              onClick={onAdd}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stroke-soft-200 p-3 text-xs font-bold text-text-soft-400 transition duration-200 hover:border-primary-base hover:bg-primary-base/5 hover:text-primary-base"
            >
              <Plus className="size-4" />
              Добавить сделку
            </button>
          </div>
        )}
      </div>
    );
  },
);
KanbanColumn.displayName = 'KanbanColumn';

export { KanbanColumn };
export type { KanbanColumnProps };
