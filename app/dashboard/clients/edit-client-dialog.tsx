"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { updateClient } from "./actions";

interface EditClientDialogProps {
    client: any;
    isOpen: boolean;
    onClose: () => void;
}

export function EditClientDialog({ client, isOpen, onClose }: EditClientDialogProps) {
    const [loading, setLoading] = useState(false);

    if (!isOpen || !client) return null;

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const res = await updateClient(client.id, formData);
        setLoading(false);
        if (res?.error) {
            alert(res.error);
        } else {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-black/30 transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 border border-slate-200">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-6">Редактировать клиента</h3>

                    <form action={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Фамилия <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="lastName"
                                    defaultValue={client.lastName}
                                    required
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Имя <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="firstName"
                                    defaultValue={client.firstName}
                                    required
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Отчество</label>
                            <input
                                type="text"
                                name="patronymic"
                                defaultValue={client.patronymic || ""}
                                className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Компания</label>
                            <input
                                type="text"
                                name="company"
                                defaultValue={client.company || ""}
                                className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Телефон <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="phone"
                                defaultValue={client.phone}
                                required
                                className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telegram</label>
                                <input
                                    type="text"
                                    name="telegram"
                                    defaultValue={client.telegram || ""}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                                    placeholder="@username"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
                                <input
                                    type="text"
                                    name="instagram"
                                    defaultValue={client.instagram || ""}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                                    placeholder="insta_link"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={client.email || ""}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Город</label>
                                <input
                                    type="text"
                                    name="city"
                                    defaultValue={client.city || ""}
                                    className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Комментарии</label>
                            <textarea
                                name="comments"
                                defaultValue={client.comments || ""}
                                rows={3}
                                className="block w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2 border transition-all"
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:outline-none disabled:opacity-50 transition-all"
                            >
                                {loading ? "Сохранение..." : "Сохранить изменения"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
