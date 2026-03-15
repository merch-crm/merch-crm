// app/(main)/dashboard/production/components/calculator-skeleton.tsx
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface CalculatorSkeletonProps {
  className?: string;
}

export function CalculatorSkeleton({ className }: CalculatorSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Основной контент */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Левая колонка */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3">
          {/* Секция 1 */}
          <div className="crm-card">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Секция 2 */}
          <div className="crm-card">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Секция 3 */}
          <div className="crm-card">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Правая колонка */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="crm-card !bg-slate-900">
            <Skeleton className="h-6 w-24 bg-slate-700 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24 bg-slate-700" />
                  <Skeleton className="h-4 w-16 bg-slate-700" />
                </div>
              ))}
              <Skeleton className="h-px w-full bg-slate-700 my-2" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-20 bg-slate-700" />
                <Skeleton className="h-8 w-28 bg-slate-700" />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Skeleton className="h-11 flex-1 rounded-xl bg-slate-700" />
              <Skeleton className="h-11 flex-1 rounded-xl bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
