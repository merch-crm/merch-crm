"use client";

import { useState } from "react";
import { updateProfile } from "./actions";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function ProfileForm({ user }: { user: any }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setMessage({ type: "", text: "" });

        const result = await updateProfile(formData);

        if (result.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            setMessage({ type: "success", text: "Профиль успешно обновлен!" });
        }
        setLoading(false);
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Полное имя</label>
                    <input
                        name="name"
                        type="text"
                        defaultValue={user.name}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50/30 font-medium"
                        placeholder="Имя Фамилия"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Телефон</label>
                    <input
                        name="phone"
                        type="tel"
                        defaultValue={user.phone}
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-slate-50/30 font-medium"
                        placeholder="+7 (999) 000-00-00"
                    />
                </div>
                <div className="space-y-2 opacity-80">
                    <label className="text-sm font-bold text-slate-700 ml-1">Отдел</label>
                    <input
                        type="text"
                        value={user.department?.name || user.department || "Без отдела"}
                        readOnly
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-100 cursor-not-allowed outline-none font-medium text-slate-600"
                    />
                    <input type="hidden" name="department" value={user.department?.name || user.department || ""} />
                </div>
                <div className="space-y-2 opacity-60">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email (только чтение)</label>
                    <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-100 cursor-not-allowed outline-none font-medium"
                    />
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
                    className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/20 hover:bg-white hover:text-indigo-600 hover:ring-2 hover:ring-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {loading ? "Сохранение..." : "Сохранить изменения"}
                </button>
            </div>
        </form>
    );
}
