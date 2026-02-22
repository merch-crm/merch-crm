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

        // In a real app, you would send this to Sentry or a custom endpoint
        // Optional: fetch('/api/log/error', { method: 'POST', body: JSON.stringify({ message: error.message, stack: error.stack }) }).catch(() => {})
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="text-center p-[--radius-padding] md:p-[--padding-xl] bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-200 max-w-md w-full mx-4 space-y-3 animate-in zoom-in-95 duration-700">
                <div className="w-[80px] h-[80px] bg-rose-50 rounded-[var(--radius-outer)] flex items-center justify-center text-rose-500 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                </div>

                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">Произошла ошибка</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        Приложение столкнулось с неожиданной проблемой на стороне клиента.
                    </p>
                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-[11px] font-mono text-slate-500 break-all border border-slate-100 italic">
                        {error.message || "Unknown client-side exception"}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button type="button"
                        onClick={() => reset()}
                        className="flex-1 px-6 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
                    >
                        Попробовать снова
                    </button>
                    <button type="button"
                        onClick={() => window.location.href = '/dashboard'}
                        className="flex-1 px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                    >
                        В панель
                    </button>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs font-bold text-slate-300">
                    Merch CRM Recovery Mode
                </div>
            </div>
        </div>
    )
}
