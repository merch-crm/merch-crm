'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { Typo } from '@/components/ui/typo';

interface PipelineStage {
  label: string;
  value: number;
  color: string;
}

interface PipelineBarProps extends React.HTMLAttributes<HTMLDivElement> {
  stages: PipelineStage[];
  showLabels?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const heightMap = { sm: 'h-2', md: 'h-3', lg: 'h-4' };

function PipelineBar({ stages, showLabels = true, height = 'md', className, ...rest }: PipelineBarProps) {
  const total = stages.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      <div className={cn('flex w-full overflow-hidden rounded-full', heightMap[height])}>
        {stages.map((stage) => {
          const width = total > 0 ? (stage.value / total) * 100 : 0;
          if (width === 0) return null;
          return (
            <Tooltip key={stage.label} content={`${stage.label}: ${stage.value}`} side="top">
              <div
                className={cn('transition-all duration-700 ease-in-out cursor-pointer hover:opacity-80', stage.color)}
                style={{ width: `${width}%` }}
              />
            </Tooltip>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {stages.map((stage) => (
            <div key={stage.label} className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full ring-2 ring-bg-white-0', stage.color)} />
              <Typo as="span" className="text-xs font-semibold text-text-sub-600">{stage.label}</Typo>
              <Typo as="span" className="text-xs font-bold text-text-strong-950 tabular-nums">
                {stage.value}
              </Typo>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { PipelineBar };
export type { PipelineBarProps, PipelineStage };
