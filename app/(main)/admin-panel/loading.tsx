import React from "react";
import { ShieldCheck } from "lucide-react";

export default function AdminLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-700">
            <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                    <ShieldCheck className="w-12 h-12" />
                </div>
                {/* Spinning ring */}
                <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-3xl animate-spin" />
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900er">Синхронизация данных</h2>
                <p className="text-sm font-bold text-slate-400 animate-pulse">Загрузка модулей администрирования...</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-4xl opacity-50">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-white rounded-3xl border border-slate-200 animate-pulse" />
                ))}
            </div>
        </div>
    );
}
