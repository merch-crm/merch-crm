"use client";

import { useState } from "react";
import { updatePassword } from "./actions";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage({ type: "", text: "" });

        const result = await updatePassword(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Пароль успешно обновлен!" });
            (document.getElementById("password-form") as HTMLFormElement).reset();
        }
        setLoading(false);
    }

    return (
        <form id="password-form" action={handleSubmit} className="space-y-8">
            <div className="space-y-6">
                <div className="space-y-2 group/input">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-hover/input:text-primary transition-colors">Текущий пароль</Label>
                    <div className="relative">
                        <Input
                            name="currentPassword"
                            type={showPassword ? "text" : "password"}
                            required
                            className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold transition-all duration-300"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-hover/input:text-primary transition-colors">Новый пароль</Label>
                    <Input
                        name="newPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold transition-all duration-300"
                        placeholder="••••••••"
                    />
                </div>

                <div className="space-y-2 group/input">
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 group-hover/input:text-primary transition-colors">Подтвердите пароль</Label>
                    <Input
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        className="h-14 px-6 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold transition-all duration-300"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {message.text && (
                <div className={cn(
                    "p-5 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300",
                    message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-rose-50 text-rose-800 border border-rose-100"
                )}>
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
                    <span className="text-[14px] font-black">{message.text}</span>
                </div>
            )}

            <div className="pt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 rounded-[24px] bg-slate-900 hover:bg-black text-white font-black text-[16px] shadow-2xl shadow-slate-200 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Обновление..." : "Обновить пароль"}
                </button>
            </div>
        </form>
    );
}
