'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        'flex flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-slate-100 bg-slate-50 p-12 text-center transition-all duration-300 hover:border-primary-base hover:bg-white',
        className,
      )}
      {...rest}
    >
      <div className="flex size-18 items-center justify-center rounded-card bg-white shadow-sm ring-1 ring-slate-100 order-first">
        {Icon ? (
          <Icon className="size-9 text-primary-base" />
        ) : (
          <div className="size-9 rounded-full bg-slate-100" />
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
          className="inline-flex items-center gap-2.5 rounded-element bg-primary-base px-6 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
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
