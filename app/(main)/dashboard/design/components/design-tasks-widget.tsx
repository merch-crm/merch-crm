"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ListTodo } from "lucide-react";

export function DesignTasksWidget() {
  return (
    <div
      className="h-full flex flex-col items-center justify-center p-10 text-center"
      style={{ backgroundColor: "#fff", minHeight: 260 }}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        <ListTodo className="h-6 w-6" />
      </div>
      <h3 className="text-[14px] font-bold text-slate-700 mb-1.5">Список задач</h3>
      <p className="text-[12px] text-slate-400 max-w-[200px] leading-snug">
        Здесь будет список актуальных задач по дизайну
      </p>
    </div>
  );
}

export function DesignTasksWidgetSkeleton() {
  return <Skeleton className="h-full w-full min-h-[260px]" />;
}
