'use client';

import * as React from 'react';
import { cn } from '../utils/cn';

interface KanbanBoardProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * KanbanBoard: A horizontally scrolling container for Kanban columns.
 */
function KanbanBoard({ className, ...rest }: KanbanBoardProps) {
  return (
    <div
      className={cn(
        'flex gap-3 overflow-x-auto pb-6 pt-2 scrollbar-hide',
        '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      {...rest}
    />
  );
}

export { KanbanBoard };
export type { KanbanBoardProps };
