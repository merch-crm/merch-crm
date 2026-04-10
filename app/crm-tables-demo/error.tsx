"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center px-4">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 animate-in zoom-in duration-500">
        <AlertCircle className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-black text-slate-900">Что-то пошло не так</h2>
        <p className="text-sm text-slate-500 max-w-[300px]">
          При загрузке данных произошла ошибка. Пожалуйста, попробуйте еще раз.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-slate-300 mt-2">ID: {error.digest}</p>
        )}
      </div>
      <Button onClick={() => reset()}
        variant="outline"
        className="h-11 px-8 rounded-2xl font-bold gap-2"
      >
        <RefreshCcw className="w-4 h-4" />
        Повторить попытку
      </Button>
    </div>
  );
}
