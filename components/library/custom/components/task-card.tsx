'use client';

import * as React from 'react';
import { Calendar, User, Flag } from 'lucide-react';
import { cn } from '../utils/cn';

type Priority = 'low' | 'medium' | 'high' | 'urgent';
type TaskStatus = 'todo' | 'in-progress' | 'done' | 'overdue';

interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  priority?: Priority;
  status?: TaskStatus;
  assignee?: string;
  dueDate?: string;
  completed?: boolean;
  onToggle?: () => void;
}

const priorityConfig: Record<Priority, { color: string }> = {
  low: { color: 'text-text-soft-400' },
  medium: { color: 'text-primary-base' },
  high: { color: 'text-amber-500' },
  urgent: { color: 'text-red-600' },
};

const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  ({ title, priority = 'medium', status, assignee, dueDate, completed, onToggle, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm transition duration-200 hover:shadow-md hover:border-primary-base/20',
          completed && 'opacity-60 grayscale-[0.2]',
          className,
        )}
        {...rest}
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
          className={cn(
            'mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300',
            completed 
              ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/20 shadow-md' 
              : 'border-stroke-soft-200 hover:border-primary-base hover:bg-primary-base/5',
          )}
        >
          {completed && (
            <svg className="size-3.5" viewBox="0 0 12 12" fill="none">
              <path 
                d="M2 6L5 9L10 4" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          )}
        </button>

        <div className="flex flex-1 flex-col gap-2 min-w-0" style={{ minWidth: 0 }}>
          <span className={cn('text-sm font-bold  text-text-strong-950 truncate', completed && 'line-through text-text-soft-400')}>
            {title}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Flag className={cn('size-[18px]', priorityConfig[priority].color)} />
              <span className="text-[11px] font-bold   text-text-soft-400">
                {priority}
              </span>
            </div>
            {assignee && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-sub-600">
                <User className="size-[18px] text-text-soft-400" />
                <span className="truncate">{assignee}</span>
              </div>
            )}
            {dueDate && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-text-soft-400 tabular-nums">
                <Calendar className="size-3.5" />
                {dueDate}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
TaskCard.displayName = 'TaskCard';

export { TaskCard };
export type { TaskCardProps, Priority, TaskStatus };
