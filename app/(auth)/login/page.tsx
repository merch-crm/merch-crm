"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Loader2, Printer, User, Lock, Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-[72px] flex items-center justify-center gap-2 rounded-[24px] text-lg font-bold text-[#6366f1] bg-[#f5f7ff] hover:bg-[#eef2ff] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
        >
            {pending ? <Loader2 className="animate-spin h-5 w-5" /> : null}
            {pending ? "ВХОД В СИСТЕМУ..." : "Войти в систему"}
        </button>
    );
}

export default function LoginPage() {
    const [state, action] = useActionState(loginAction, null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
            <div className="max-w-[480px] w-full bg-white p-12 rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-slate-50 flex flex-col items-center">
                {/* Logo Section */}
                <div className="w-20 h-20 bg-[#4f46e5]/90 rounded-full flex items-center justify-center mb-10 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)]">
                    <Printer className="h-10 w-10 text-white" strokeWidth={1.5} />
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-[34px] font-bold text-slate-900 tracking-tight leading-tight mb-2">
                        Вход в MerchCRM
                    </h2>
                    <p className="text-lg text-slate-400 font-medium">
                        Войдите в систему управления печатью
                    </p>
                </div>

                <form action={action} className="w-full space-y-8">
                    <div className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <User className="h-6 w-6 text-slate-300 group-focus-within:text-indigo-400 transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full h-[72px] pl-16 pr-6 rounded-[24px] bg-[#edf2ff]/50 border-2 border-transparent focus:border-indigo-100 focus:bg-[#edf2ff] text-slate-900 placeholder-slate-400 transition-all font-semibold text-lg"
                                    placeholder="admin@crm.local"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Пароль</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <Lock className="h-6 w-6 text-slate-300 group-focus-within:text-indigo-400 transition-colors" strokeWidth={1.5} />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full h-[72px] pl-16 pr-16 rounded-[24px] bg-[#edf2ff]/50 border-2 border-transparent focus:border-indigo-100 focus:bg-[#edf2ff] text-slate-900 placeholder-slate-400 transition-all font-semibold text-lg"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-6 flex items-center text-slate-300 hover:text-indigo-400 transition-colors z-10 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="h-6 w-6" strokeWidth={1.5} /> : <Eye className="h-6 w-6" strokeWidth={1.5} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="relative flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-6 w-6 border-2 border-slate-200 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all checked:bg-indigo-600"
                            />
                        </div>
                        <label htmlFor="remember-me" className="ml-3 block text-base font-semibold text-slate-400 cursor-pointer select-none">
                            Запомнить меня
                        </label>
                    </div>

                    {state?.error && (
                        <div className="py-4 px-6 bg-red-50 text-red-500 text-sm font-bold text-center rounded-[20px] border border-red-100 animate-in fade-in zoom-in-95">
                            {state.error}
                        </div>
                    )}

                    <div className="pt-2">
                        <SubmitButton />
                    </div>
                </form>
            </div>
        </div>
    );
}

