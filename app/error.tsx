'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error for diagnosis
        console.error('--- CLIENT EXCEPTION CAUGHT BY ERROR BOUNDARY ---')
        console.error('Message:', error.message)
        console.error('Stack:', error.stack)
        console.error('Digest:', error.digest)
        console.error('--------------------------------------------------')
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
            <div className="relative overflow-hidden rounded-[42px] border-2 border-slate-200/60 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white/90 backdrop-blur-xl animate-in zoom-in-95 duration-700 ring-8 ring-slate-100/30">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-20 bg-rose-500" />

                {/* Error Icon */}
                <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-rose-500/40 mb-8 transition-all hover:scale-105 bg-rose-500 relative z-10 border-4 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                </div>

                <div className="flex-1 w-full flex flex-col items-center relative z-10">
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                        Произошла ошибка
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                        Приложение столкнулось с неожиданной проблемой на стороне клиента.
                    </p>

                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                        <div className="text-[13px] font-mono text-rose-500/90 break-all leading-relaxed font-semibold">
                            {error.message || "Unknown client-side exception"}
                        </div>
                    </div>
                </div>

                <div className="w-full flex gap-3 relative z-10">
                    <button type="button"
                        onClick={() => window.location.href = '/dashboard'}
                        className="flex-1 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm"
                    >
                        На главную
                    </button>
                    <button type="button"
                        onClick={() => reset()}
                        className="flex-1 px-4 py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 text-sm"
                    >
                        Попробовать снова
                    </button>
                </div>

                <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                <div className="text-[11px] font-bold text-slate-300 relative z-10">
                    Merch CRM Recovery Mode
                </div>
            </div>
        </div>
    )
}
