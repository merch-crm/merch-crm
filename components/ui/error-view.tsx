"use client";

import { AlertCircle, RefreshCcw, Home } from"lucide-react";
import Link from"next/link";

interface ErrorViewProps {
    title?: string;
    message?: string;
    onReset?: () => void;
    icon?: React.ReactNode;
}

export function ErrorView({
    title ="Произошла ошибка",
    message ="Произошла непредвиденная ошибка",
    onReset,
    icon,
}: ErrorViewProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4 font-sans">
            <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-rose-500" />

                {/* Error Icon */}
                <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-rose-500/30 mb-8 transition-colors bg-rose-500 relative z-10">
                    {icon || <AlertCircle className="w-12 h-12 stroke-[2]" />}
                </div>

                <div className="flex-1 w-full flex flex-col items-center relative z-10">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                        {title}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                        Приложение столкнулось с неожиданной проблемой на стороне клиента.
                    </p>

                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner overflow-hidden">
                        <div className="text-xs font-mono text-rose-500/90 break-words whitespace-pre-wrap leading-relaxed font-semibold max-h-[120px] overflow-y-auto w-full">
                            Error: {message}
                        </div>
                    </div>
                </div>

                <div className="w-full flex gap-3 relative z-10">
                    <Link href="/dashboard" className="flex-[0.7] block">
                        <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm">
                            <Home className="w-4 h-4" />
                            На главную
                        </button>
                    </Link>
                    {onReset && (
                        <button
                            type="button"
                            onClick={onReset}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 text-sm"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Попробовать снова
                        </button>
                    )}
                </div>

                <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                <div className="text-xs font-bold text-slate-300 relative z-10">
                    Merch CRM Recovery Mode
                </div>
            </div>
        </div>
    );
}
