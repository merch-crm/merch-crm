"use client";

import { ReactNode } from "react";
import { cn } from "@/components/library/custom/utils/cn";

interface ComponentShowcaseProps {
  title: ReactNode;
  description?: ReactNode;
  desc?: ReactNode;
  children: ReactNode;
  className?: string; // Standard HTML/React prop
  source?: string;    // Added missing prop from older usages
  importPath?: string;// Added missing prop from older usages
  code?: string;      // Added missing prop from older usages
}

export function ComponentShowcase({
  title,
  description,
  desc,
  children,
  className,
}: ComponentShowcaseProps) {
  const finalDescription = description || desc;

  return (
    <div
      className={cn(
        "crm-card overflow-visible",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
          </div>
          {finalDescription && (
            <p className="text-sm text-muted-foreground">{finalDescription}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="rounded-[var(--radius-inner)] border border-border bg-[var(--background)] p-6 overflow-visible">
        {children}
      </div>
    </div>
  );
}
