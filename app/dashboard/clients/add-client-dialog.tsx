"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { addClient } from "./actions";

export function AddClientDialog({ variant = "default" }: { variant?: "default" | "minimal" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const res = await addClient(formData);
        setLoading(false);
        if (res?.error) {
            alert(res.error);
        } else {
            setIsOpen(false);
        }
    }

    if (!isOpen) {
        if (variant === "minimal") {
            return (
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center transition-colors px-2 py-1 hover:bg-indigo-50 rounded-lg"
                >
                    <Plus className="mr-1 h-3 w-3" /> Создать
                </button>
            );
        }
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 gap-2 font-black shadow-xl shadow-indigo-200 transition-all active:scale-95 inline-flex items-center"
            >
                <Plus className="w-5 h-5" />
                Добавить клиента
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={() => setIsOpen(false)} />

                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-slate-200">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-6">Новый клиент</h3>

                    <form action={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Фамилия <span className="text-red-500">*</span></label>
                                <input type="text" name="lastName" required className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Имя <span className="text-red-500">*</span></label>
                                <input type="text" name="firstName" required className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Отчество</label>
                            <input type="text" name="patronymic" className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Компания</label>
                            <input type="text" name="company" className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Телефон <span className="text-red-500">*</span></label>
                            <input type="text" name="phone" required className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telegram</label>
                                <input type="text" name="telegram" className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" placeholder="@username" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
                                <input type="text" name="instagram" className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" placeholder="insta_link" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" name="email" className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Город</label>
                                <input type="text" name="city" className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Комментарии</label>
                            <textarea name="comments" rows={3} className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all" />
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-all"
                            >
                                {loading ? "Сохранение..." : "Сохранить клиента"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
