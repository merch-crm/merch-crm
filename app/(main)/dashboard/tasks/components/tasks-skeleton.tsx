"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TasksSkeleton() {
 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
   <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-3">
    {/* Breadcrumb */}
    <Skeleton className="h-4 w-24 rounded-lg" />

    {/* Header */}
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
     <div className="space-y-2">
      <Skeleton className="h-9 w-48 rounded-xl" />
      <Skeleton className="h-5 w-72 rounded-lg" />
     </div>
     <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-80 rounded-2xl" />
      <Skeleton className="h-11 w-40 rounded-xl" />
     </div>
    </div>

    {/* Filter Tabs */}
    <div className="flex flex-col xl:flex-row gap-3">
     <Skeleton className="h-14 w-96 rounded-2xl" />
     <div className="flex items-center gap-3 flex-1">
      <Skeleton className="h-11 flex-1 max-w-md rounded-xl" />
      <Skeleton className="h-11 w-28 rounded-xl" />
      <Skeleton className="h-11 w-28 rounded-xl" />
     </div>
    </div>

    {/* Kanban Columns */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
     {[...Array(4)].map((_, i) => (
      <div
       key={i}
       className="bg-gradient-to-b from-slate-50/80 to-slate-100/50 border border-slate-200/60 rounded-2xl p-4"
      >
       <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
         <Skeleton className="h-3 w-3 rounded-full" />
         <Skeleton className="h-5 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-8 rounded-lg" />
       </div>
       <div className="space-y-3">
        {[...Array(3)].map((_, j) => (
         <Skeleton key={j} className="h-36 w-full rounded-xl" />
        ))}
       </div>
      </div>
     ))}
    </div>
   </div>
  </div>
 );
}
