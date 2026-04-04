'use client';

import * as React from 'react';
import { Flame, Thermometer, Snowflake, type LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

type LeadTemperature = 'hot' | 'warm' | 'cold';

interface LeadScoreBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  temperature: LeadTemperature;
  score?: number;
}

const tempConfig: Record<LeadTemperature, { icon: LucideIcon; label: string; classes: string }> = {
  hot: { icon: Flame, label: 'Hot', classes: 'bg-red-50 text-red-700 ring-red-200' },
  warm: { icon: Thermometer, label: 'Warm', classes: 'bg-amber-50 text-amber-700 ring-amber-200' },
  cold: { icon: Snowflake, label: 'Cold', classes: 'bg-blue-50 text-blue-700 ring-blue-200' },
};

function LeadScoreBadge({ temperature, score, className, ...rest }: LeadScoreBadgeProps) {
  const config = tempConfig[temperature];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset transition-all duration-200',
        config.classes,
        className,
      )}
      {...rest}
    >
      <Icon className="size-3.5" />
      {config.label}
      {score !== undefined && (
        <span className="ml-0.5 opacity-70 tabular-nums">({score})</span>
      )}
    </span>
  );
}

export { LeadScoreBadge };
export type { LeadScoreBadgeProps, LeadTemperature };
