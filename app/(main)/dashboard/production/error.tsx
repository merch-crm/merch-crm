"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
 error: Error & { digest?: string };
 reset: () => void;
}

export default function ProductionError({ error, reset }: ErrorProps) {
 useEffect(() => {
  console.error("Production dashboard error:", error);
 }, [error]);

 return (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
   <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center mb-4">
    <AlertTriangle className="w-8 h-8 text-rose-600" />
   </div>
   <h2 className="text-xl font-bold text-slate-900 mb-2">
    Ошибка загрузки дашборда
   </h2>
   <p className="text-sm text-slate-500 text-center max-w-md mb-6">
    Не удалось загрузить данные производства. Попробуйте обновить страницу
    или вернитесь позже.
   </p>
   <div className="flex gap-3">
    <Button onClick={reset} variant="outline">
     <RefreshCw className="w-4 h-4 mr-2" />
     Попробовать снова
    </Button>
    <Button asChild>
     <a href="/dashboard">На главную</a>
    </Button>
   </div>
   {error.digest && (
    <p className="text-xs text-slate-400 mt-4">
     Код ошибки: {error.digest}
    </p>
   )}
  </div>
 );
}
