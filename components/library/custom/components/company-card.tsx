'use client';

import * as React from 'react';
import Image from "next/image";
import { Building2, Users, Globe, MapPin } from 'lucide-react';
import { cn } from '../utils/cn';

interface CompanyCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  industry?: string;
  employees?: number | string;
  website?: string;
  location?: string;
  logoUrl?: string;
  revenue?: string;
}

const CompanyCard = React.forwardRef<HTMLDivElement, CompanyCardProps>(
  ({ name, industry, employees, website, location, logoUrl, revenue, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'group flex gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-5 shadow-sm transition duration-200 hover:shadow-md hover:border-primary-base/30',
          className,
        )}
        {...rest}
      >
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-bg-weak-50 overflow-hidden ring-4 ring-bg-white-0 shadow-sm relative">
          {logoUrl ? (
            <Image src={logoUrl} alt={name} fill className="object-contain p-1.5" />
          ) : (
            <Building2 className="size-6 text-text-soft-400" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1.5 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-[11px] font-black uppercase tracking-tight text-slate-900 ">
              {name}
            </span>
            {revenue && (
              <span className="shrink-0 text-[11px] font-black text-emerald-600 tabular-nums uppercase tracking-tighter">
                {revenue}
              </span>
            )}
          </div>
          {industry && (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
              {industry}
            </span>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
            {employees && (
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-slate-300" />
                <span className="tabular-nums">{employees}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="size-3.5 text-slate-300" />
                <span className="truncate">{location}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-1.5 min-w-0">
                <Globe className="size-3.5 text-slate-300" />
                <button
                   type="button"
                   className="truncate hover:text-primary-base transition-colors font-black"
                   onClick={(e) => {
                      e.stopPropagation();
                      window.open(`https://${website.replace(/^https?:\/\//, '')}`, '_blank');
                   }}
                >
                  {website}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
CompanyCard.displayName = 'CompanyCard';

export { CompanyCard };
export type { CompanyCardProps };
