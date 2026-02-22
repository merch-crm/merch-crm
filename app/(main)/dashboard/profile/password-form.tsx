"use client";

import { useState } from "react";
import { updatePassword } from "./actions";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PasswordForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPassword, setShowPassword] = useState(false);

    // Local reusable password field
    function PasswordField({ name, label, height = "h-12" }: { name: string; label: string; height?: string }) {
        return (
            <div className="space-y-2 group/input">
                <Label className="text-xs font-black text-slate-400 ml-1 group-hover/input:text-primary transition-colors">{label}</Label>
                <div className="relative">
                    <Input
                        name={name}
                        type={showPassword ? "text" : "password"}
                        required
                        className={cn(height, "px-6 rounded-2xl bg-slate-50/50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold transition-all duration-300")}
                        placeholder="••••••••"
                    />
                    {name === "currentPassword" && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors h-10 w-10 p-0"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        const formData = new FormData(e.currentTarget);
        const result = await updatePassword(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Пароль успешно обновлен!" });
            e.currentTarget.reset();
        }
        setLoading(false);
    }

    return (
        <form id="password-form" onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-3">
                <PasswordField name="currentPassword" label="Текущий пароль" />
                <PasswordField name="newPassword" label="Новый пароль" height="h-14" />
                <PasswordField name="confirmPassword" label="Подтвердите пароль" height="h-14" />
            </div>

            {message.text && (
                <div className={cn(
                    "p-5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
                    message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-rose-50 text-rose-800 border border-rose-100"
                )}>
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
                    <span className="text-sm font-black">{message.text}</span>
                </div>
            )}

            <div className="pt-6">
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-3xl bg-slate-900 hover:bg-black text-white font-black text-base shadow-2xl shadow-slate-200 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 border-none"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Обновление..." : "Обновить пароль"}
                </Button>
            </div>
        </form>
    );
}
