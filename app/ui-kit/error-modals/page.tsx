import React from "react";
import { AlertCircle, Home, RefreshCcw, WifiOff, ServerCrash, XOctagon } from "lucide-react";

export const metadata = {
    title: "UI Kit | Error Modals",
};

export default function ErrorModalsPage() {
    return (
        <div className="min-h-screen bg-slate-100/50 p-8 sm:p-12 font-sans overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-24">
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">UI Kit: Error Modals</h1>
                    <p className="text-lg text-slate-500">5 premium variants for system error windows.</p>
                </div>

                {/* Variant 1: Current Refined (Soft Light + Glow) */}
                <div className="flex flex-col items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                        <span className="font-bold text-slate-700">1. Current Refined (Soft Glow)</span>
                    </div>

                    <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-rose-500" />

                        {/* Error Icon */}
                        <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-rose-500/30 mb-8 transition-colors bg-rose-500 relative z-10">
                            <AlertCircle className="w-12 h-12 stroke-[2]" />
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
                                    Error: Failed to fetch data from the server. Connection timed out after 3000ms.
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex gap-3 relative z-10">
                            <button type="button" className="flex-[0.7] flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm">
                                <Home className="w-4 h-4" />
                                На главную
                            </button>
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 text-sm">
                                <RefreshCcw className="w-4 h-4" />
                                Попробовать снова
                            </button>
                        </div>

                        <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                        <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                            Merch CRM Recovery Mode
                        </div>
                    </div>
                </div>

                {/* Variant 2: 404 Not Found (Amber/Orange) */}
                <div className="flex flex-col items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                        <span className="font-bold text-slate-700">2. 404 Not Found (Amber)</span>
                    </div>

                    <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-amber-500" />

                        {/* Error Icon */}
                        <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-amber-500/30 mb-8 transition-colors bg-amber-500 relative z-10">
                            <AlertCircle className="w-12 h-12 stroke-[2]" />
                        </div>

                        <div className="flex-1 w-full flex flex-col items-center relative z-10">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                                Страница не найдена
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                                Запрашиваемый ресурс был удален, перемещен или никогда не существовал.
                            </p>

                            <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                                <div className="text-[13px] font-mono text-amber-600/90 break-all leading-relaxed font-semibold">
                                    Error 404: The route /dashboard/inventory/old-item could not be resolved.
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex gap-3 relative z-10">
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 text-sm">
                                <Home className="w-4 h-4" />
                                На главную
                            </button>
                            <button type="button" className="flex-[0.7] flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm">
                                <RefreshCcw className="w-4 h-4" />
                                Назад
                            </button>
                        </div>

                        <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                        <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                            Merch CRM Navigation Safe
                        </div>
                    </div>
                </div>

                {/* Variant 3: 403 Forbidden / Access Denied (Purple/Violet) */}
                <div className="flex flex-col items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                        <span className="font-bold text-slate-700">3. Access Denied (Violet)</span>
                    </div>

                    <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-violet-500" />

                        {/* Error Icon */}
                        <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-violet-500/30 mb-8 transition-colors bg-violet-500 relative z-10">
                            <XOctagon className="w-12 h-12 stroke-[2]" />
                        </div>

                        <div className="flex-1 w-full flex flex-col items-center relative z-10">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                                Доступ запрещен
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                                У вашей роли недостаточно прав для просмотра этого раздела или выполнения действия.
                            </p>

                            <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                                <div className="text-[13px] font-mono text-violet-600/90 break-all leading-relaxed font-semibold">
                                    Error 403: Missing required permission &apos;manage_inventory_settings&apos;.
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex gap-3 relative z-10">
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-violet-500 text-white font-bold rounded-[20px] hover:bg-violet-600 transition-all active:scale-[0.98] shadow-xl shadow-violet-500/20 text-sm">
                                Запросить доступ
                            </button>
                            <button type="button" className="flex-[0.7] flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm">
                                <Home className="w-4 h-4" />
                                На главную
                            </button>
                        </div>

                        <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                        <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                            Merch CRM Security Policy
                        </div>
                    </div>
                </div>

                {/* Variant 4: Network Offline / No Connection (Blue/Sky) */}
                <div className="flex flex-col items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                        <span className="font-bold text-slate-700">4. Network Offline (Blue)</span>
                    </div>

                    <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-blue-500" />

                        {/* Error Icon */}
                        <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-500/30 mb-8 transition-colors bg-blue-500 relative z-10">
                            <WifiOff className="w-12 h-12 stroke-[2]" />
                        </div>

                        <div className="flex-1 w-full flex flex-col items-center relative z-10">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                                Нет подключения
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                                Похоже, у вас пропал интернет. Пожалуйста, проверьте соединение, чтобы продолжить работу.
                            </p>

                            <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                                <div className="text-[13px] font-mono text-blue-600/90 break-all leading-relaxed font-semibold">
                                    NetworkError: Failed to fetch. The user is currently offline.
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex gap-3 relative z-10">
                            <button type="button" className="flex-[0.7] flex items-center justify-center gap-2 px-4 py-4 bg-slate-100 text-slate-600 hover:text-slate-900 font-bold rounded-[20px] hover:bg-slate-200 transition-all active:scale-[0.98] shadow-sm text-sm">
                                <Home className="w-4 h-4" />
                                На главную
                            </button>
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-slate-900 text-white font-bold rounded-[20px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20 text-sm">
                                <RefreshCcw className="w-4 h-4" />
                                Переподключиться
                            </button>
                        </div>

                        <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                        <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                            Merch CRM Offline Mode
                        </div>
                    </div>
                </div>

                {/* Variant 5: 503 Maintenance / Down (Teal/Emerald) */}
                <div className="flex flex-col items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 self-start">
                        <span className="font-bold text-slate-700">5. Maintenance (Teal)</span>
                    </div>

                    <div className="relative overflow-hidden rounded-[42px] border border-slate-100/80 shadow-2xl shadow-slate-200/50 p-10 flex flex-col items-center text-center max-w-[480px] w-full bg-white transition-all hover:shadow-3xl">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-15 bg-teal-500" />

                        {/* Error Icon */}
                        <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-teal-500/30 mb-8 transition-colors bg-teal-500 relative z-10">
                            <ServerCrash className="w-12 h-12 stroke-[2]" />
                        </div>

                        <div className="flex-1 w-full flex flex-col items-center relative z-10">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                                Ведутся работы
                            </h2>
                            <p className="text-sm font-medium text-slate-500 mb-8 max-w-[320px]">
                                Мы проводим плановое техническое обслуживание. Система будет доступна через несколько минут.
                            </p>

                            <div className="w-full bg-slate-50 rounded-2xl border border-slate-100/80 p-5 mb-8 text-left shadow-inner">
                                <div className="text-[13px] font-mono text-teal-600/90 break-all leading-relaxed font-semibold">
                                    Status 503: Service Unavailable. Database migrations in progress.
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex gap-3 relative z-10">
                            <button type="button" className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-teal-500 text-white font-bold rounded-[20px] hover:bg-teal-600 transition-all active:scale-[0.98] shadow-xl shadow-teal-500/20 text-sm">
                                Проверить статус
                            </button>
                        </div>

                        <div className="w-[120px] h-px bg-slate-100 my-7 relative z-10" />

                        <div className="text-xs font-bold text-slate-300 tracking-widest  relative z-10">
                            Merch CRM Maintenance
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
