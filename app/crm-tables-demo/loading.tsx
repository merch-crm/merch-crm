"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-bold text-slate-500">Загрузка данных...</p>
        </div>
    );
}
