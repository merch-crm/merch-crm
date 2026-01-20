"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden text-center p-12 space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mx-auto shadow-inner">
                    <AlertCircle className="w-10 h-10" />
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-slate-900 leading-none">Упс! Что-то пошло не так</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Произошла системная ошибка. Мы уже работаем над её исправлением.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98] w-full"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Попробовать снова
                    </Button>

                    <Link href="/dashboard" className="block">
                        <Button
                            variant="outline"
                            className="h-14 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-lg w-full"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Вернуться на главную
                        </Button>
                    </Link>
                </div>

                <div className="pt-4 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-300">
                        Код ошибки: {error.digest || "SYSTEM_RUNTIME_ERR"}
                    </p>
                </div>
            </div>
        </div>
    );
}
