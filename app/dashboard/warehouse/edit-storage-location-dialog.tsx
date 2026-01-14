"use client";

import { StorageLocation } from "./storage-locations-tab";

import { useState } from "react";
import { Plus, X, MapPin, User, Building, Package, AlignLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateStorageLocation } from "./actions";
import { useFormStatus } from "react-dom";
import { ItemDetailDrawer } from "./item-detail-drawer";

interface EditStorageLocationDialogProps {
    users: { id: string; name: string }[];
    location: StorageLocation | null;
    isOpen: boolean;
    onClose: () => void;
}

const ITEMS_PER_PAGE = 7;

export function EditStorageLocationDialog({ users, location, isOpen, onClose }: EditStorageLocationDialogProps) {
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState<any>(null);

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

    // Pagination logic
    const items = location.items || [];
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = items.slice(startIndex, endIndex);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />
            <div className="relative w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8">
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

                <div className="grid grid-cols-2 gap-8">
                    {/* Left Column - Edit Form */}
                    <div>
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
                    </div>

                    {/* Right Column - Items List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Package className="w-3 h-3" /> Товары на складе
                            </label>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                                {items.length} ПОЗИЦИЙ
                            </span>
                        </div>

                        <div className="space-y-2">
                            {currentItems.length > 0 ? (
                                currentItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer"
                                    >
                                        <div className="flex flex-col flex-1 min-w-0 mr-3">
                                            <span className="text-xs font-bold text-slate-900">{item.name}</span>
                                            {item.sku && <span className="text-[10px] text-slate-400 font-mono mt-0.5">{item.sku}</span>}
                                            {item.description && (
                                                <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs font-black text-slate-600 bg-white px-2.5 py-1 rounded-lg shadow-sm border border-slate-100 flex-shrink-0">
                                            {item.quantity} {item.unit || "уп."}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-16 text-slate-400 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    Склад пуст
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold text-slate-700"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Назад
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${currentPage === page
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-bold text-slate-700"
                                >
                                    Вперёд
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedItem && (
                <ItemDetailDrawer
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
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
