'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

type Trend = 'up' | 'down' | 'neutral';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  trend?: Trend;
  icon?: React.ReactNode;
  sparkline?: React.ReactNode;
}

const trendConfig: Record<Trend, { icon: LucideIcon; color: string }> = {
  up: { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
  down: { icon: TrendingDown, color: 'text-red-600 bg-red-50' },
  neutral: { icon: Minus, color: 'text-text-soft-400 bg-bg-weak-50' },
};

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, change, changeLabel, trend = 'neutral', icon, sparkline, className, ...rest }, ref) => {
    const trendInfo = trendConfig[trend] || trendConfig.neutral;
    const TrendIcon = trendInfo.icon;

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex flex-col gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-sm transition duration-200 hover:shadow-md',
          className,
        )}
        {...rest}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black text-text-soft-400 uppercase tracking-wider">{title}</span>
          {icon && (
            <div className="flex size-9 items-center justify-center rounded-lg bg-bg-weak-50 text-text-sub-600">
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-semibold  text-text-strong-950">
              {value}
            </span>
            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-black',
                      trendInfo.color,
                    )}
                  >
                    <TrendIcon className="size-3" />
                    {Math.abs(change)}%
                  </span>

                {changeLabel && (
                  <span className="text-[11px] font-bold text-text-soft-400">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          {sparkline && <div className="h-10 w-24 shrink-0">{sparkline}</div>}
        </div>
      </div>
    );
  },
);
MetricCard.displayName = 'MetricCard';

export { MetricCard };
export type { MetricCardProps, Trend };
