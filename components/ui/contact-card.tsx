'use client';

import * as React from 'react';
import Image from 'next/image';
import { Mail, Phone, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  avatarUrl?: string;
  initials?: string;
  tags?: { label: string; color?: string }[];
  onEmailClick?: () => void;
  onPhoneClick?: () => void;
}

const ContactCard = React.forwardRef<HTMLDivElement, ContactCardProps>(
  ({ name, email, phone, company, role, avatarUrl, initials, tags, onEmailClick, onPhoneClick, className, ...rest }, ref) => {
    const fallbackInitials = initials || name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3 rounded-element border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-sm transition duration-200 hover:shadow-md hover:border-primary-base/30',
          className,
        )}
        {...rest}
      >
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-bg-weak-50 text-[11px] font-black text-slate-400 tracking-tight overflow-hidden ring-4 ring-bg-white-0 shadow-sm relative">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill className="object-cover" />
          ) : (
            fallbackInitials
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-[11px] font-black tracking-tight text-slate-900">
              {name}
            </span>
            {role && (
              <span className="shrink-0 text-[11px] font-bold text-slate-400 tracking-wide">· {role}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            {company && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 tracking-wide">
                <Building2 className="size-3.5 text-slate-300" />
                <span className="truncate">{company}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {email && (
                <button
                  type="button"
                  onClick={onEmailClick}
                  className="flex items-center gap-2 text-[11px] font-black text-slate-400 transition hover:text-primary-base tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-primary-base rounded"
                >
                  <Mail className="size-3.5" />
                  <span className="truncate max-w-[140px] tabular-nums">{email}</span>
                </button>
              )}
              {phone && (
                <button
                  type="button"
                  onClick={onPhoneClick}
                  className="flex items-center gap-2 text-[11px] font-black text-slate-400 transition hover:text-primary-base tracking-widest outline-none focus-visible:ring-2 focus-visible:ring-primary-base rounded"
                >
                  <Phone className="size-3.5" />
                  <span className="tabular-nums">{phone}</span>
                </button>
              )}
            </div>
          </div>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <span
                  key={tag.label}
                  className={cn(
                    'rounded-md px-1.5 py-0.5 text-[11px] font-black tracking-tight',
                    tag.color || 'bg-bg-weak-50 text-slate-400',
                  )}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  },
);
ContactCard.displayName = 'ContactCard';

export { ContactCard };
export type { ContactCardProps };
