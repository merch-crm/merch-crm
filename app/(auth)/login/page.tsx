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
            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-2xl text-base font-bold text-[#4f46e5]/80 bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-all duration-200 disabled:opacity-50"
        >
            {pending ? <Loader2 className="animate-spin h-5 w-5" /> : null}
            {pending ? "Вход в систему..." : "Войти в систему"}
        </button>
    );
}

export default function LoginPage() {
    const [state, action] = useActionState(loginAction, null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-[440px] w-full space-y-8 bg-white p-10 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50">
                <div className="flex flex-col items-center">
                    <div className="bg-[#4f46e5] rounded-full p-4 mb-6 shadow-lg shadow-indigo-500/20">
                        <Printer className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Вход в MerchCRM
                    </h2>
                    <p className="mt-2 text-center text-[15px] font-medium text-slate-400">
                        Войдите в систему управления печатью
                    </p>
                </div>

                <form action={action} className="mt-10 space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-4 rounded-lg border border-slate-100 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
                                    placeholder="admin@crm.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Пароль</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-11 pr-12 py-4 rounded-lg border border-slate-100 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors z-10 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm font-semibold text-slate-400 cursor-pointer">
                            Запомнить меня
                        </label>
                    </div>

                    {state?.error && (
                        <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in zoom-in-95">
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
