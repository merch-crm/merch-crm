"use client";

import { useState } from "react";
import { updatePassword } from "./actions";
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react";

export function PasswordForm() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPasswords, setShowPasswords] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage({ type: "", text: "" });

        const result = await updatePassword(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Пароль успешно изменен!" });
            // Optionally clear the form
            (document.getElementById("password-form") as HTMLFormElement).reset();
        }
        setLoading(false);
    }

    return (
        <form id="password-form" action={handleSubmit} className="space-y-6">
            <div className="space-y-6 max-w-lg">
                <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700 ml-1">Текущий пароль</label>
                    <input
                        name="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-slate-50/30 font-medium"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPasswords(!showPasswords)}
                        className="absolute right-4 top-10 text-slate-400 hover:text-slate-600"
                    >
                        {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Новый пароль</label>
                        <input
                            name="newPassword"
                            type={showPasswords ? "text" : "password"}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-slate-50/30 font-medium"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Подтверждение</label>
                        <input
                            name="confirmPassword"
                            type={showPasswords ? "text" : "password"}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-0 transition-all outline-none bg-slate-50/30 font-medium"
                        />
                    </div>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in zoom-in-95 ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                    }`}>
                    {message.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3.5 border-2 border-indigo-600 text-indigo-600 rounded-lg font-bold hover:bg-indigo-50 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {loading ? "Обновление..." : "Обновить пароль"}
                </button>
            </div>
        </form>
    );
}
