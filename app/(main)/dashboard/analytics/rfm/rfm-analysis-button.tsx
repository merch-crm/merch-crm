"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

export function RFMAnalysisButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 h-12 gap-2 font-bold shadow-xl shadow-slate-200 min-w-[180px]"
        >
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <RefreshCw className="w-4 h-4" />
            )}
            {pending ? "Анализ..." : "Запустить анализ"}
        </Button>
    );
}
