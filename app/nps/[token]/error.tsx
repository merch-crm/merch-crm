"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("NPS Page Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-t-4 border-amber-500">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Что-то пошло не так</h1>
        <p className="text-slate-600 mb-6">
          Произошла непредвиденная ошибка при загрузке формы отзыва.
        </p>
        <div className="flex flex-col gap-3">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => reset()}
          >
            Попробовать снова
          </Button>
          <Button variant="ghost" className="w-full text-slate-400" onClick={() => window.location.href = "/"}
          >
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
}
