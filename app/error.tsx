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
            <div className="max-w-[480px] w-full bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden text-center p-12 space-y-10 animate-in zoom-in-95 duration-700">

                {/* Icon Container */}
                <div className="w-[100px] h-[100px] bg-[#FFF1F2] rounded-[24px] flex items-center justify-center text-[#F43F5E] mx-auto">
                    <AlertCircle className="w-12 h-12 stroke-[2.5]" />
                </div>

                {/* Text Section */}
                <div className="space-y-4">
                    <h1 className="text-[32px] font-bold text-[#0F172A] leading-tight tracking-normal">
                        Упс! Что-то пошло не так
                    </h1>
                    <p className="text-[#64748B] text-lg font-medium leading-relaxed max-w-[320px] mx-auto">
                        Произошла системная ошибка. Мы уже работаем над её исправлением.
                    </p>
                </div>

                {/* Buttons Section */}
                <div className="flex flex-col gap-4">
                    <Button
                        onClick={() => reset()}
                        className="h-[72px] bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-[24px] font-bold text-xl shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] w-full flex items-center justify-center gap-3"
                    >
                        <RotateCcw className="w-6 h-6" />
                        Попробовать снова
                    </Button>

                    <Link href="/dashboard" className="block w-full">
                        <Button
                            variant="outline"
                            className="h-[72px] border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] rounded-[24px] font-bold text-xl w-full flex items-center justify-center gap-3"
                        >
                            <Home className="w-6 h-6" />
                            Вернуться на главную
                        </Button>
                    </Link>
                </div>

                {/* Footer Section */}
                <div className="pt-6 border-t border-slate-50">
                    <p className="text-sm font-bold text-[#CBD5E1] tracking-wide">
                        Код ошибки: <span className="font-medium">{error.digest || "449102760"}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
