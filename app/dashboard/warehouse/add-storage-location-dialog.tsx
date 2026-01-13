"use client";

import { useState } from "react";
import { Plus, X, MapPin, User, Building, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addStorageLocation } from "./actions";
import { useFormStatus } from "react-dom";


interface AddStorageLocationDialogProps {
    users: { id: string; name: string }[];
}

export function AddStorageLocationDialog({ users }: AddStorageLocationDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(formData: FormData) {
        const res = await addStorageLocation(formData);
        if (res?.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            setError("");
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 gap-2 font-black shadow-xl shadow-indigo-200 transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" />
                Создать место хранения
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Новое место хранения</h2>
                                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Добавление локации на склад</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl bg-slate-50 transition-all hover:rotate-90"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form action={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Building className="w-3 h-3" /> Название
                                </label>
                                <input
                                    name="name"
                                    required
                                    placeholder="Например: основной склад"
                                    className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <AlignLeft className="w-3 h-3" /> Описание
                                </label>
                                <input
                                    name="description"
                                    placeholder="Например: для хранения расходников"
                                    className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" /> Адрес
                                </label>
                                <input
                                    name="address"
                                    required
                                    placeholder="Улица, номер дома..."
                                    className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <User className="w-3 h-3" /> Ответственный за хранение
                                </label>
                                <div className="relative group">
                                    <select
                                        name="responsibleUserId"
                                        className="w-full h-14 px-5 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold appearance-none cursor-pointer outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                    >
                                        <option value="">Не назначен</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in shake duration-500">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                    <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <SubmitButton />
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
        >
            {pending ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Сохранение...
                </div>
            ) : "Создать место"}
        </Button>
    );
}
