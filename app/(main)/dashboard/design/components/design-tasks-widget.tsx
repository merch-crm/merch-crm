"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DesignTasksWidget() {
  return (
    <div className="p-4 rounded-xl border border-dashed text-center">
      <p className="text-sm text-muted-foreground">Задачи дизайна в разработке</p>
    </div>
  );
}

export function DesignTasksWidgetSkeleton() {
  return <Skeleton className="h-[200px] w-full rounded-3xl" />;
}
