import * as React from 'react';
import { getLeadTempBadgeConfig } from '@/lib/status-configs';
import { Badge, type BadgeColor } from './badge';
import { cn } from '@/lib/utils';

type LeadTemperature = 'hot' | 'warm' | 'cold';

interface LeadScoreBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color' | 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onDragOver'> {
  temperature: LeadTemperature;
  score?: number;
}

function LeadScoreBadge({ temperature, score, className, children, ...rest }: LeadScoreBadgeProps) {
  const config = getLeadTempBadgeConfig(temperature);

  const badgeColor: BadgeColor = config.color as BadgeColor;

  return (
    <Badge {...rest} color={badgeColor} icon={config.icon} className={cn("px-3 py-1", className)}>
      {config.label}
      {score !== undefined && (
        <span className="ml-1 opacity-70 tabular-nums">({score})</span>
      )}
      {children}
    </Badge>
  );
}

export { LeadScoreBadge };
export type { LeadScoreBadgeProps, LeadTemperature };
