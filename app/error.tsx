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
        console.error("Global Error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
            <div className="max-w-[360px] w-full bg-white rounded-[2rem] shadow-crm-xl border border-slate-100/50 overflow-hidden text-center p-8 space-y-6 animate-in zoom-in-95 duration-700">

                {/* Icon Container */}
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto border border-rose-100/50 shadow-sm">
                    <AlertCircle className="w-8 h-8 stroke-[2.5]" />
                </div>

                {/* Text Section */}
                <div className="space-y-2">
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">
                        Упс! Что-то пошло не так
                    </h1>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">
                        Произошла системная ошибка. Мы уже работаем над её исправлением.
                    </p>
                </div>

                {/* Buttons Section */}
                <div className="flex flex-col gap-2.5">
                    <Button
                        onClick={() => reset()}
                        className="h-11 bg-slate-900 hover:bg-slate-800 text-white rounded-[14px] font-bold text-xs shadow-lg shadow-slate-200 transition-all active:scale-[0.98] w-full flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Попробовать снова
                    </Button>

                    <Link href="/dashboard" className="block w-full">
                        <Button
                            variant="ghost"
                            className="h-11 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-[14px] font-bold text-xs w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                        >
                            <Home className="w-3.5 h-3.5" />
                            Вернуться на главную
                        </Button>
                    </Link>
                </div>

                {/* Footer Section */}
                <div className="pt-5 border-t border-slate-50">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">
                        Код ошибки: <span className="font-medium text-slate-400">{error.digest || "449102760"}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
