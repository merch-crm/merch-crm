"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorViewProps {
    title?: string;
    message?: string;
    onReset?: () => void;
    icon?: React.ReactNode;
}

export function ErrorView({
    title = "Произошла ошибка",
    message = "Произошла непредвиденная ошибка",
    onReset,
    icon,
}: ErrorViewProps) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
            <div className="text-center p-6 bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 max-w-md w-full space-y-3 animate-in zoom-in-95 duration-700">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                    {icon || <AlertCircle size={32} strokeWidth={2.5} />}
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">{message}</p>
                </div>
                {onReset && (
                    <button
                        type="button"
                        onClick={onReset}
                        className="w-full px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Попробовать снова
                    </button>
                )}
            </div>
        </div>
    );
}
