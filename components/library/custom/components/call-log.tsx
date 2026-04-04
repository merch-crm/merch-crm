'use client';

import * as React from 'react';
import { PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, type LucideIcon } from 'lucide-react';
import { cn } from '../utils/cn';

type CallType = 'incoming' | 'outgoing' | 'missed';

interface CallLogProps extends React.HTMLAttributes<HTMLDivElement> {
  contact: string;
  type: CallType;
  duration?: string;
  timestamp: string;
  note?: string;
}

const callTypeConfig: Record<CallType, { icon: LucideIcon; label: string; color: string }> = {
  incoming: { icon: PhoneIncoming, label: 'Входящий', color: 'text-emerald-600 bg-emerald-50' },
  outgoing: { icon: PhoneOutgoing, label: 'Исходящий', color: 'text-primary-base bg-primary-base/10' },
  missed: { icon: PhoneMissed, label: 'Пропущен', color: 'text-red-700 bg-red-50' },
};

function CallLog({ contact, type, duration, timestamp, note, className, ...rest }: CallLogProps) {
  const config = callTypeConfig[type];
  const Icon = config.icon;
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 shadow-sm transition hover:shadow-md hover:border-primary-base/20',
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-bg-white-0 shadow-sm',
          config.color,
        )}
      >
        <Icon className="size-4.5" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-[11px] font-black uppercase tracking-tight text-slate-900 ">
            {contact}
          </span>
          <span className="shrink-0 text-[11px] font-bold text-slate-400 tabular-nums uppercase tracking-tighter">
            {timestamp}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">{config.label}</span>
          {duration && (
            <div className="flex items-center gap-1 text-[11px] font-black text-slate-400 tabular-nums uppercase tracking-tighter">
              <Clock className="size-3.5" />
              {duration}
            </div>
          )}
        </div>
        {note && (
          <p className="text-[11px] font-bold text-slate-400 truncate mt-1 italic uppercase tracking-tighter">
            {note}
          </p>
        )}
      </div>
    </div>
  );
}

export { CallLog };
export type { CallLogProps, CallType };
