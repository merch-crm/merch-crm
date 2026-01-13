"use client";

import { MapPin, User, Building2, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteStorageLocation } from "./actions";
import { useState } from "react";
import { EditStorageLocationDialog } from "./edit-storage-location-dialog";
import { InventoryItem } from "./inventory-client";

export interface StorageLocation {
    id: string;
    name: string;
    address: string;
    responsibleUserId: string | null;
    description?: string | null;
    responsibleUser?: {
        name: string;
    } | null;
    items?: InventoryItem[];
}

interface StorageLocationsTabProps {
    locations: StorageLocation[];
    users: { id: string; name: string }[];
}

export function StorageLocationsTab({ locations, users }: StorageLocationsTabProps) {
    const [editingLocation, setEditingLocation] = useState<StorageLocation | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteName, setDeleteName] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
        e.stopPropagation();
        setDeleteId(id);
        setDeleteName(name);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        await deleteStorageLocation(deleteId);
        setIsDeleting(false);
        setDeleteId(null);
        setDeleteName(null);
    };

    const handleEdit = (e: React.MouseEvent, loc: StorageLocation) => {
        e.stopPropagation();
        setEditingLocation(loc);
    };

    if (locations.length === 0) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-center px-4 bg-slate-50/30 rounded-[3rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mb-6 text-slate-300 shadow-sm">
                    <MapPin className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">Места хранения не найдены</h2>
                <p className="text-slate-500 max-w-[280px] font-medium leading-relaxed">
                    Добавьте первое место хранения, чтобы систематизировать учет товаров на складе.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {locations.map((loc) => (
                    <div
                        key={loc.id}
                        onClick={() => setEditingLocation(loc)}
                        className="group relative bg-white rounded-2xl border border-slate-200/60 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 hover:border-indigo-100 cursor-pointer"
                    >
                        {/* Header: Name */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 duration-500">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                                        {loc.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="flex items-center gap-1">
                                            <div className={cn("w-2 h-2 rounded-full animate-pulse", loc.items?.length ? "bg-emerald-500" : "bg-slate-300")} />
                                            <span className={cn("text-[9px] font-black uppercase tracking-widest", loc.items?.length ? "text-emerald-600" : "text-slate-400")}>
                                                {loc.items?.length ? "Активно" : "Пусто"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => handleEdit(e, loc)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                                    title="Редактировать"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={(e) => handleDeleteClick(e, loc.id, loc.name)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                                    title="Удалить"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-4 h-10 flex items-start">
                            {loc.description && (
                                <p className="text-[13px] text-slate-600 font-medium leading-tight line-clamp-2">
                                    {loc.description}
                                </p>
                            )}
                        </div>

                        {/* Content: Details */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-transparent transition-all group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-sm">
                                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Адрес</p>
                                    <p className="text-xs font-bold text-slate-700 leading-relaxed">
                                        {loc.address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-transparent transition-all group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-sm">
                                <User className="w-4 h-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ответственный</p>
                                    <p className="text-xs font-black text-slate-900">
                                        {loc.responsibleUser?.name || "Не назначен"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content: Storage Summary by Category */}
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            {(() => {
                                const grouped = loc.items?.reduce((acc: Record<string, number>, item: InventoryItem) => {
                                    if (item.quantity > 0) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const cat = (item as any).categoryName || "Прочее";
                                        acc[cat] = (acc[cat] || 0) + item.quantity;
                                    }
                                    return acc;
                                }, {}) || {};

                                const categories = Object.entries(grouped);

                                if (categories.length === 0) {
                                    return (
                                        <div className="py-2 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                            <span className="text-[10px] font-medium text-slate-400">Нет товаров на хранении</span>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-2">
                                        {categories.map(([category, count]) => (
                                            <div key={category} className="flex items-center justify-between text-xs group/cat">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/cat:bg-indigo-400 transition-colors" />
                                                    <span className="font-bold text-slate-700">{category}</span>
                                                </div>
                                                <span className="font-black text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                    {count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>


                    </div>
                ))}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setDeleteId(null)}
                    />
                    <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8 text-center">
                        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-rose-500">
                            <Trash2 className="w-10 h-10" />
                        </div>

                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                            Удалить место хранения?
                        </h2>

                        <p className="text-slate-500 font-medium mb-8">
                            Вы собираетесь удалить <span className="text-slate-900 font-bold">&quot;{deleteName}&quot;</span>.
                            <br />
                            Все привязанные товары останутся без локации.
                            Это действие нельзя отменить.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="h-14 rounded-2xl font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Удаление...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-5 h-5" />
                                        Удалить
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {editingLocation && (
                <EditStorageLocationDialog
                    users={users}
                    location={editingLocation}
                    isOpen={!!editingLocation}
                    onClose={() => setEditingLocation(null)}
                />
            )}
        </>
    );
}
