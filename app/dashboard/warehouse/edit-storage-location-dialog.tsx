"use client";

import { StorageLocation } from "./storage-locations-tab";

import { useState } from "react";
import { Plus, X, MapPin, User, Building, Package, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStorageLocation } from "./actions";
import { useFormStatus } from "react-dom";

interface EditStorageLocationDialogProps {
    users: { id: string; name: string }[];
    location: StorageLocation | null;
    isOpen: boolean;
    onClose: () => void;
}

export function EditStorageLocationDialog({ users, location, isOpen, onClose }: EditStorageLocationDialogProps) {
    const [error, setError] = useState("");

    // Reset error when dialog opens/closes


    async function handleSubmit(formData: FormData) {
        if (!location) return;
        const res = await updateStorageLocation(location.id, formData);
        if (res?.error) {
            setError(res.error);
        } else {
            onClose();
        }
    }

    if (!isOpen || !location) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Редактирование</h2>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Изменение места хранения</p>
                    </div>
                    <button
                        onClick={onClose}
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
                            defaultValue={location.name}
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
                            defaultValue={location.description || ""}
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
                            defaultValue={location.address}
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
                                defaultValue={location.responsibleUserId || ""}
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

                <div className="mt-8 pt-8 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Package className="w-3 h-3" /> Товары на складе
                        </label>
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                            {location.items?.length || 0} ПОЗИЦИЙ
                        </span>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {location.items && location.items.length > 0 ? (
                            location.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-900">{item.name}</span>
                                        {item.sku && <span className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sku}</span>}
                                    </div>
                                    <div className="text-xs font-black text-slate-600 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-100">
                                        {item.quantity} {item.unit || "шт"}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                Склад пуст
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
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
            ) : "Сохранить изменения"}
        </Button>
    );
}
