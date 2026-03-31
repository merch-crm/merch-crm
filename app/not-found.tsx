"use client";

import { FileSearch, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NotFound() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="min-h-screen bg-slate-50" />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
            <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl animate-in zoom-in-95 duration-700">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-amber-500" />

                {/* Error Icon */}
                <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-amber-500/30 mb-8 transition-colors bg-amber-500 relative z-10">
                    <FileSearch className="w-12 h-12 stroke-[2]" />
                </div>

                <div className="flex-1 w-full flex flex-col items-center relative z-10">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Страница не найдена</h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                        Запрашиваемый ресурс был удален, перемещен или никогда не существовал.
                    </p>

                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                        <div className="text-[13px] font-mono text-amber-600/90 break-all leading-relaxed font-semibold">Error 404: The requested URL could not be found on this server.</div>
                    </div>
                </div>

                <div className="w-full flex gap-3 relative z-10">
                    <Link href="/dashboard" className="flex-1 block">
                        <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 text-sm">
                            <Home className="w-4 h-4" />
                            На главную
                        </button>
                    </Link>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-[0.7] flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Назад
                    </button>
                </div>

                <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                <div className="text-xs font-bold text-slate-300 relative z-10">
                    Merch CRM Navigation Safe
                </div>
            </div>
        </div>
    );
}
