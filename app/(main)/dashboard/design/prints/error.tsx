"use client";

import { useEffect } from"react";
import { AlertTriangle, RefreshCw } from"lucide-react";
import { Button } from"@/components/ui/button";

export default function PrintsError({
 error,
 reset,
}: {
 error: Error & { digest?: string };
 reset: () => void;
}) {
 useEffect(() => {
 console.error("Prints page error:", error);
 }, [error]);

 return (
 <div className="flex flex-col items-center justify-center py-16 px-4">
 <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
 <AlertTriangle className="w-8 h-8 text-red-600"/>
 </div>

 <h3 className="text-xl font-bold text-slate-900 mb-2">
 Ошибка загрузки
 </h3>
 <p className="text-slate-500 text-center max-w-md mb-6">
 Не удалось загрузить страницу принтов. Попробуйте обновить страницу.
 </p>

 <Button onClick={reset} variant="outline">
 <RefreshCw className="w-4 h-4 mr-2"/>
 Попробовать снова
 </Button>
 </div>
);
}
