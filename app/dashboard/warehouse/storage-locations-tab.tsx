"use client";

import { MapPin, User, Building2, Trash2, Pencil, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { deleteStorageLocation } from "./actions";
import { useState } from "react";
import { EditStorageLocationDialog } from "./edit-storage-location-dialog";
import { InventoryItem } from "./inventory-client";


export interface StorageLocation {
    id: string;
    name: string;
    address?: string | null;
    responsibleUserId?: string | null;
    description?: string | null;
    isSystem?: boolean;
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
    const [deleteIsSystem, setDeleteIsSystem] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent, id: string, name: string, isSystem: boolean) => {
        e.stopPropagation();
        setDeleteId(id);
        setDeleteName(name);
        setDeleteIsSystem(isSystem);
        setDeletePassword("");
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        await deleteStorageLocation(deleteId, deletePassword);
        setIsDeleting(false);
        setDeleteId(null);
        setDeleteName(null);
        setDeleteIsSystem(false);
        setDeletePassword("");
    };

    const handleEdit = (e: React.MouseEvent, loc: StorageLocation) => {
        e.stopPropagation();
        setEditingLocation(loc);
    };

    if (locations.length === 0) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-center px-4 bg-slate-50/20 rounded-[var(--radius-outer)] border border-dashed border-slate-200/60">
                <div className="w-20 h-20 bg-white rounded-[var(--radius-inner)] flex items-center justify-center mb-6 text-slate-300 shadow-sm ring-1 ring-slate-100">
                    <MapPin className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 leading-none">Места хранения не найдены</h2>
                <p className="text-slate-400 text-xs font-medium max-w-[280px] leading-relaxed">
                    Добавьте первое место хранения для систематизации учета.
                </p>
            </div>
        );
    }

    const sortedLocations = [...locations].sort((a, b) => {
        if (a.name.toLowerCase() === "производство") return -1;
        if (b.name.toLowerCase() === "производство") return 1;
        return 0;
    });

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {sortedLocations.map((loc) => {
                    const totalItemsInLoc = loc.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    const isBrak = loc.name.toLowerCase().includes("брак");
                    const isMain = loc.name.toLowerCase().includes("главный") || loc.name.toLowerCase().includes("основной") || loc.name.toLowerCase().includes("производство");

                    return (
                        <div
                            key={loc.id}
                            onClick={() => setEditingLocation(loc)}
                            className={cn(
                                "group relative flex flex-col justify-between p-6 md:p-8 transition-all duration-500 cursor-pointer overflow-hidden",
                                "rounded-[var(--radius-outer)] border h-full min-h-[280px]",
                                isMain
                                    ? "bg-slate-900 border-slate-800 shadow-2xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1"
                                    : isBrak
                                        ? "glass-panel bg-rose-50/30 border-rose-100/60 hover:border-rose-200 hover:shadow-crm-lg hover:-translate-y-1"
                                        : "glass-panel border-white/60 hover:border-white/80 hover:shadow-crm-lg hover:-translate-y-1"
                            )}
                        >
                            {/* Ambient Glows Removed */}

                            {/* --- HEADER --- */}
                            <div className="relative z-10 flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-14 h-14 rounded-[var(--radius-inner)] flex items-center justify-center backdrop-blur-sm border shadow-sm transition-transform duration-500 group-hover:scale-110",
                                        isMain
                                            ? "bg-white/10 border-white/10 text-indigo-400"
                                            : isBrak
                                                ? "bg-rose-50 border-rose-100 text-rose-500"
                                                : "bg-white/50 border-white/60 text-slate-600"
                                    )}>
                                        <Building2 className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "text-xl font-bold leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors",
                                            isMain ? "text-white group-hover:text-white" : "text-slate-900"
                                        )}>
                                            {loc.name}
                                        </h3>
                                        <span className={cn(
                                            "text-xs font-bold ",
                                            isMain ? "text-slate-400" : "text-slate-400"
                                        )}>
                                            {isBrak ? "Зона брака" : isMain ? "Основной склад" : "Локация"}
                                        </span>
                                    </div>
                                </div>
                                <div className={cn(
                                    "px-3 py-1.5 rounded-[var(--radius-inner)] text-xs font-bold tracking-wide backdrop-blur-md border shadow-sm",
                                    isMain
                                        ? "bg-white/10 border-white/10 text-white"
                                        : isBrak
                                            ? "bg-rose-50 border-rose-100 text-rose-600"
                                            : "bg-white/60 border-white/60 text-slate-600"
                                )}>
                                    {totalItemsInLoc} <span className="opacity-60 font-medium ml-1">ед.</span>
                                </div>
                            </div>

                            {/* --- BODY --- */}
                            <div className="relative z-10 space-y-3 mb-6">
                                {loc.description && (
                                    <p className={cn(
                                        "text-sm font-medium line-clamp-2 mb-4",
                                        isMain ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        {loc.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                        isMain ? "bg-white/5 border-white/5 text-slate-400" : "bg-white/50 border-white/60 text-slate-400"
                                    )}>
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className={cn(
                                        "text-sm font-bold truncate",
                                        isMain ? "text-slate-200" : "text-slate-700"
                                    )}>
                                        {loc.address || "Адрес не указан"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                                        isMain ? "bg-white/5 border-white/5 text-slate-400" : "bg-white/50 border-white/60 text-slate-400"
                                    )}>
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className={cn(
                                        "text-sm font-semibold truncate",
                                        isMain ? "text-slate-400" : "text-slate-500"
                                    )}>
                                        {loc.responsibleUser?.name || "Ответственный не назначен"}
                                    </span>
                                </div>
                            </div>

                            {/* --- FOOTER (Stats & Distribution) --- */}
                            <div className="relative z-10 mt-auto pt-4 border-t border-dashed border-slate-200/20">
                                {(() => {
                                    const grouped = loc.items?.reduce((acc: Record<string, { count: number, name: string }>, item: InventoryItem) => {
                                        if (item.quantity > 0) {
                                            const catId = item.categoryId || "other";
                                            const catName = item.categoryName || "Прочее";
                                            if (!acc[catId]) acc[catId] = { count: 0, name: catName };
                                            acc[catId].count += item.quantity;
                                        }
                                        return acc;
                                    }, {}) || {};

                                    const categoriesList = Object.values(grouped).sort((a, b) => b.count - a.count).slice(0, 4);
                                    const total = Object.values(grouped).reduce((sum, i) => sum + i.count, 0) || 1;

                                    if (categoriesList.length === 0) {
                                        return (
                                            <div className={cn("text-xs font-medium text-center py-2 opacity-50", isMain ? "text-slate-500" : "text-slate-400")}>
                                                Нет товаров
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3">
                                            {/* Visual Bar - Elegant & Thin */}
                                            <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100/10 w-full">
                                                {categoriesList.map((cat, idx) => {
                                                    const percent = (cat.count / total) * 100;
                                                    // Harmonious palettes
                                                    const colors = isMain
                                                        ? ["bg-indigo-500", "bg-indigo-400", "bg-sky-400", "bg-slate-700"]
                                                        : ["bg-slate-800", "bg-slate-400", "bg-slate-300", "bg-slate-200"];

                                                    if (isBrak) {
                                                        // Red palette for defect zone
                                                        if (idx === 0) colors[0] = "bg-rose-500";
                                                        if (idx === 1) colors[1] = "bg-rose-300";
                                                    }

                                                    return (
                                                        <div
                                                            key={idx}
                                                            style={{ width: `${percent}%` }}
                                                            className={cn("h-full", colors[idx % colors.length])}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            {/* Minimal Legend */}
                                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                                                {categoriesList.slice(0, 3).map((cat, idx) => (
                                                    <span key={idx} className={cn(
                                                        "text-[10px] font-bold tracking-wide truncate max-w-[80px]",
                                                        isMain ? "text-slate-500" : "text-slate-400"
                                                    )}>
                                                        {cat.name} <span className="opacity-50 ml-0.5">{cat.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Actions on Hover - Clean Circles */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-20">
                                <button
                                    onClick={(e) => handleEdit(e, loc)}
                                    className="w-9 h-9 flex items-center justify-center bg-white text-slate-900 rounded-[var(--radius-inner)] shadow-md hover:scale-110 active:scale-95 transition-all text-indigo-600 border border-slate-100"
                                    title="Редактировать"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                {!loc.isSystem && (
                                    <button
                                        onClick={(e) => handleDeleteClick(e, loc.id, loc.name, loc.isSystem || false)}
                                        className="w-9 h-9 flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 rounded-[var(--radius-inner)] shadow-md hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:scale-110 active:scale-95 transition-all"
                                        title="Удалить"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
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
                    <div className="relative w-full max-w-md bg-white rounded-[var(--radius-outer)] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 p-8 text-center">
                        <div className="w-20 h-20 bg-rose-50 rounded-[var(--radius-inner)] flex items-center justify-center mx-auto mb-6 text-rose-500">
                            <Trash2 className="w-10 h-10" />
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 leading-none mb-4">
                            Удалить?
                        </h2>

                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10">
                            Объект <span className="text-slate-900">&quot;{deleteName}&quot;</span> будет стерт.<br />
                            Товары останутся без локации.<br />
                            Это действие нельзя отменить.
                        </p>

                        {deleteIsSystem && (
                            <div className="mb-6 p-4 bg-rose-50 rounded-[var(--radius-inner)] border border-rose-100">
                                <div className="flex items-center gap-2 text-rose-600 mb-3">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-sm font-semibold">Системная защита</span>
                                </div>
                                <p className="text-xs font-medium text-rose-500/80 mb-4">
                                    Введите пароль администратора для подтверждения.
                                </p>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Пароль"
                                    className="w-full h-12 px-5 rounded-[18px] border-2 border-rose-100 focus:outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-500/5 transition-all font-medium text-slate-900 placeholder:text-rose-200 text-sm"
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setDeleteId(null);
                                    setDeletePassword("");
                                }}
                                className="h-14 rounded-[var(--radius-inner)] font-semibold text-sm text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting || (deleteIsSystem && !deletePassword.trim())}
                                className="h-14 bg-rose-600 hover:bg-rose-700 text-white rounded-[var(--radius-inner)] font-semibold text-sm shadow-xl shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Стирание...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-5 h-5" />
                                        Стереть объект
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
                    locations={locations}
                    location={editingLocation}
                    isOpen={!!editingLocation}
                    onClose={() => setEditingLocation(null)}
                />
            )}
        </>
    );
}
