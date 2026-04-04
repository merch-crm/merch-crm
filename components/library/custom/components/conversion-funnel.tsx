'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface ConversionFunnelProps extends React.HTMLAttributes<HTMLDivElement> {
  stages: FunnelStage[];
}

function ConversionFunnel({ stages, className, ...rest }: ConversionFunnelProps) {
  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className={cn('flex flex-col gap-3', className)} {...rest}>
      {stages.map((stage, idx) => {
        const widthPct = (stage.value / maxValue) * 100;
        const prevValue = idx > 0 ? stages[idx - 1].value : null;
        const conversionRate = prevValue ? ((stage.value / prevValue) * 100).toFixed(1) : null;

        return (
          <div key={stage.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="size-3.5 text-text-soft-400" />}
                <span className="text-sm font-semibold text-text-sub-600">{stage.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-text-strong-950 tabular-nums">
                  {stage.value.toLocaleString()}
                </span>
                {conversionRate && (
                  <span className="text-xs font-medium text-text-soft-400 tabular-nums">
                    ({conversionRate}%)
                  </span>
                )}
              </div>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-bg-weak-50">
              <div
                className={cn('h-full rounded-full transition-all duration-700 ease-out', stage.color)}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { ConversionFunnel };
export type { ConversionFunnelProps, FunnelStage };
