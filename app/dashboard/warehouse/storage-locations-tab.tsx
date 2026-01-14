"use client";

import { MapPin, User, Building2, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {locations.map((loc) => {
                    const totalItemsInLoc = loc.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    const isBrak = loc.name.toLowerCase().includes("брак");
                    const isMain = loc.name.toLowerCase().includes("главный") || loc.name.toLowerCase().includes("основной");

                    return (
                        <div
                            key={loc.id}
                            onClick={() => setEditingLocation(loc)}
                            className="group relative bg-white border border-slate-200/60 rounded-[32px] p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-indigo-100 active:scale-[0.98] cursor-pointer flex flex-col gap-5"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
                                        isBrak ? "bg-rose-50 text-rose-500" : isMain ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">
                                            {loc.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className={cn("w-1.5 h-1.5 rounded-full", totalItemsInLoc > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                {totalItemsInLoc > 0 ? `${totalItemsInLoc} шт.` : "Пусто"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 transition-opacity duration-300">
                                    <button
                                        onClick={(e) => handleEdit(e, loc)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteClick(e, loc.id, loc.name)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-transparent group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-sm transition-all">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-bold text-slate-600 truncate">{loc.address}</span>
                                </div>
                                <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-2xl border border-transparent group-hover:bg-white group-hover:border-slate-100 group-hover:shadow-sm transition-all">
                                    <User className="w-4 h-4 text-slate-400" />
                                    <span className="text-xs font-black text-slate-900 truncate">{loc.responsibleUser?.name || "Не назначен"}</span>
                                </div>
                            </div>

                            {/* Storage categories dots */}
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(() => {
                                    const grouped = loc.items?.reduce((acc: Record<string, number>, item: InventoryItem) => {
                                        if (item.quantity > 0) {
                                            const cat = (item as any).categoryName || "Прочее";
                                            acc[cat] = (acc[cat] || 0) + item.quantity;
                                        }
                                        return acc;
                                    }, {}) || {};

                                    const categories = Object.entries(grouped);
                                    if (categories.length === 0) return null;

                                    return categories.slice(0, 3).map(([category, count]) => (
                                        <Badge key={category} className="bg-white border-slate-100 text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors pointer-events-none">
                                            {category}: {count}
                                        </Badge>
                                    ));
                                })()}
                            </div>
                        </div>
                    );
                })}
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
