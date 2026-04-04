'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

function EmptyState({ title, description, icon: Icon, action, className, ...rest }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-stroke-soft-200 bg-bg-weak-50/50 p-12 text-center transition-all duration-300 hover:border-primary-base/30 hover:bg-bg-white-0',
        className,
      )}
      {...rest}
    >
      <div className="flex size-18 items-center justify-center rounded-3xl bg-bg-white-0 shadow-lg shadow-black/5 ring-1 ring-stroke-soft-200 order-first">
        {Icon ? (
          <Icon className="size-9 text-primary-base" />
        ) : (
          <div className="size-9 rounded-full bg-primary-base/10" />
        )}
      </div>
      <div className="flex flex-col gap-2 max-w-sm">
        <h3 className="text-lg font-bold text-text-strong-950 ">{title}</h3>
        {description && (
          <p className="text-sm font-medium leading-relaxed text-text-soft-400">
            {description}
          </p>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="inline-flex items-center gap-2.5 rounded-2xl bg-primary-base px-6 py-3 text-sm font-bold text-white shadow-xl shadow-primary-base/20 transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
        >
          {action.icon && <action.icon className="size-4.5" />}
          {action.label}
        </button>
      )}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
