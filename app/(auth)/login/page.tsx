"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Loader2, Printer, User, Lock, Eye, EyeOff } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 py-5 rounded-[24px] text-base font-black text-[#6366f1] bg-[#f5f7ff] hover:bg-[#eef2ff] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
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
        <div className="min-h-screen bg-[#f1f4f9] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
            <div className="max-w-[500px] w-full bg-white p-12 rounded-[48px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col gap-10">
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-indigo-200">
                        <Printer className="h-10 w-10 text-white" strokeWidth={1.5} />
                    </div>
                    <h2 className="text-[38px] font-black text-slate-900 tracking-tight leading-tight">
                        Вход в MerchCRM
                    </h2>
                    <p className="mt-3 text-center text-lg font-bold text-slate-400">
                        Войдите в систему управления печатью
                    </p>
                </div>

                <form action={action} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-300" strokeWidth={1.5} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-14 pr-6 py-5 rounded-[24px] border border-slate-50 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-indigo-100 focus:bg-[#f8faff] transition-all font-bold text-base"
                                    placeholder="admin@crm.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Пароль</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-300" strokeWidth={1.5} />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-14 pr-14 py-5 rounded-[24px] border border-slate-50 bg-slate-50/50 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-0 focus:border-indigo-100 focus:bg-[#f8faff] transition-all font-bold text-base"
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
                                className="peer h-6 w-6 border-2 border-slate-200 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all checked:bg-indigo-600"
                            />
                        </div>
                        <label htmlFor="remember-me" className="ml-3 block text-base font-bold text-slate-400 cursor-pointer select-none">
                            Запомнить меня
                        </label>
                    </div>

                    {state?.error && (
                        <div className="py-5 px-6 bg-red-50/50 text-red-500 text-base font-black text-center rounded-[24px] border border-red-100/50 animate-in fade-in zoom-in-95 leading-none">
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
