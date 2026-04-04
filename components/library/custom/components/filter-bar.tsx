'use client';

import * as React from 'react';
import { X, ChevronDown, Filter } from 'lucide-react';
import { cn } from '../utils/cn';

interface FilterItem {
  id: string;
  label: string;
  value: string;
}

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeFilters: FilterItem[];
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  onAddClick?: () => void;
}

function FilterBar({ activeFilters, onRemove, onClearAll, onAddClick, className, ...rest }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)} {...rest}>
      <button
        type="button"
        onClick={onAddClick}
        className="flex items-center gap-2 rounded-xl bg-bg-white-0 px-3 py-2 text-xs font-bold text-text-strong-950 shadow-sm ring-1 ring-stroke-soft-200 transition duration-200 hover:bg-bg-weak-50 hover:ring-primary-base/30 active:scale-95"
      >
        <Filter className="size-3.5" />
        Фильтры
        <ChevronDown className="size-3.5 text-text-soft-400" />
      </button>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <div
              key={filter.id}
              className="group flex items-center gap-1.5 rounded-xl bg-primary-base/10 px-3 py-1.5 ring-1 ring-primary-base/20 transition-all duration-300 hover:bg-primary-base/15"
            >
              <span className="text-[11px] font-bold   text-primary-base">
                {filter.label}:
              </span>
              <span className="text-xs font-bold text-text-strong-950 tabular-nums">
                {filter.value}
              </span>
              <button
                type="button"
                onClick={() => onRemove(filter.id)}
                className="ml-1 rounded-full p-0.5 text-primary-base/50 transition duration-200 hover:bg-primary-base/10 hover:text-primary-base"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {onClearAll && (
            <button
               type="button"
               onClick={onClearAll}
               className="text-xs font-bold text-text-soft-400 hover:text-red-500 transition-colors px-2"
            >
               Сбросить все
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { FilterBar };
export type { FilterBarProps, FilterItem };
