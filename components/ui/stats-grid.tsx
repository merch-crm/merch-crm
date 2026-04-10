'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
}

const colsMap = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

function StatsGrid({ columns = 4, className, ...rest }: StatsGridProps) {
  return (
    <div
      className={cn('grid gap-3', colsMap[columns], className)}
      {...rest}
    />
  );
}

export { StatsGrid };
export type { StatsGridProps };
