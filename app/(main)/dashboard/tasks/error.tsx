"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Tasks error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
      <div className="p-4 bg-red-50 rounded-full">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900">
        Ошибка загрузки задач
      </h2>
      <p className="text-slate-500 text-center max-w-md">
        Произошла ошибка при загрузке страницы задач. Попробуйте обновить страницу.
      </p>
      <Button onClick={reset}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Попробовать снова
      </Button>
    </div>
  );
}
