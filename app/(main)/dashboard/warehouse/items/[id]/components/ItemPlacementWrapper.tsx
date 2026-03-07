"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { StorageLocation, ItemStock, InventoryItem } from "@/app/(main)/dashboard/warehouse/types";
import { ItemWarehouseBreakdown } from "./ItemWarehouseBreakdown";
import { Printer, Download, Archive, Package, Boxes, SlidersHorizontal } from "lucide-react";
import { useItemDetail } from "../context/ItemDetailContext";
import { Input } from "@/components/ui/input";

interface ItemPlacementWrapperProps {
    item: InventoryItem;
    stocks: ItemStock[];
    storageLocations: StorageLocation[];
    isEditing: boolean;
    editData: Partial<InventoryItem>;
    setEditData: React.Dispatch<React.SetStateAction<Partial<InventoryItem>>>;
    handleStartEdit: () => void;
    className?: string;
}

export function ItemPlacementWrapper({
    item,
    stocks,
    storageLocations,
    isEditing,
    editData,
    setEditData,
    handleStartEdit,
    className
}: ItemPlacementWrapperProps) {
    const { handleDownload, handleDelete, setDialogs, setAdjustType } = useItemDetail();
    const totalQuantity = stocks.reduce((acc, s) => acc + s.quantity, 0);
    const activeWarehousesCount = stocks.filter(s => s.quantity > 0).length;

    const sortedStocks = React.useMemo(() => {
        return storageLocations
            .map(loc => {
                const stockEntry = stocks.find(s => s.storageLocationId === loc.id);
                return {
                    storageLocation: loc,
                    quantity: stockEntry?.quantity || 0,
                    storageLocationId: loc.id
                };
            })
            .sort((a, b) => b.quantity - a.quantity)
            .filter(s => s.quantity > 0);
    }, [storageLocations, stocks]);

    // Dynamic calculation based on totalQuantity vs lowStockThreshold
    const progressValue = item.lowStockThreshold
        ? Math.min(100, Math.round((totalQuantity / (item.lowStockThreshold * 3)) * 100))
        : totalQuantity > 0 ? 100 : 0;
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressValue / 100) * circumference;

    const getStockStatus = () => {
        const low = item.lowStockThreshold || 0;
        const critical = item.criticalStockThreshold || 0;

        if (totalQuantity <= 0) return { label: "Нет на складе", color: "bg-red-500", text: "text-red-600", bg: "bg-red-50" };
        if (totalQuantity <= critical) return { label: "Критично", color: "bg-red-500", text: "text-red-600", bg: "bg-red-50" };
        if (totalQuantity <= low) return { label: "Заканчивается", color: "bg-amber-500", text: "text-amber-600", bg: "bg-amber-50" };
        return { label: "В наличии", color: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50" };
    };

    const status = getStockStatus();

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-3 gap-3">
                <button
                    type="button"
                    onClick={() => setDialogs(prev => ({ ...prev, label: true }))}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2.5 py-3.5 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 group active:scale-95"
                >
                    <Printer className="w-4 h-4 text-muted-foreground group-hover:text-violet-600 transition-colors" strokeWidth={2.5} />
                    <span className="text-[11px] font-bold tracking-wider text-foreground group-hover:text-violet-700 transition-colors">Печать QR</span>
                </button>

                <button
                    type="button"
                    onClick={handleDownload}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2.5 py-3.5 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 group active:scale-95"
                >
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" strokeWidth={2.5} />
                    <span className="text-[11px] font-bold tracking-wider text-foreground group-hover:text-emerald-700 transition-colors">Скачать</span>
                </button>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2.5 py-3.5 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 group active:scale-95"
                >
                    <Archive className="w-4 h-4 text-muted-foreground group-hover:text-rose-600 transition-colors" strokeWidth={2.5} />
                    <span className="text-[11px] font-bold tracking-wider text-foreground group-hover:text-rose-700 transition-colors">Архив</span>
                </button>
            </div>

            {/* CARD 1: TOTAL STOCK */}
            <div className="crm-card rounded-[32px] bg-white shadow-sm border border-slate-100/50" style={{ padding: '32px' }}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-foreground flex items-center justify-center text-background transition-all shadow-sm">
                            <Package className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">Общий остаток</h3>
                    </div>

                    <div className={cn("px-3 py-1.5 rounded-full border border-current flex items-center gap-2", status.bg, status.text)}>
                        <div className={cn("w-2 h-2 rounded-full", status.color)} />
                        <span className="text-[11px] font-bold tracking-wider">{status.label}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-3 pt-3">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-6xl font-black text-slate-900 tracking-tighter">
                                {totalQuantity.toLocaleString('ru-RU')}
                            </span>
                            <span className="text-xl font-black text-slate-400">шт.</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400">
                            На {activeWarehousesCount} активных складах
                        </p>
                    </div>

                    {/* Circular Progress */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform">
                            <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-100"
                            />
                            <circle
                                cx="48"
                                cy="48"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={circumference}
                                style={{ strokeDashoffset }}
                                strokeLinecap="round"
                                fill="transparent"
                                className="text-primary transition-all duration-1000 ease-in-out"
                            />
                        </svg>
                        <span className="absolute text-sm font-black text-slate-900">{progressValue}%</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Min Stock */}
                    <div
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                        onDoubleClick={handleStartEdit}
                    >
                        <span className="text-[11px] font-bold tracking-wider text-slate-400 block mb-2">Мин. остаток</span>
                        <div className="flex items-baseline gap-1.5">
                            {isEditing ? (
                                <Input
                                    type="number"
                                    value={editData.lowStockThreshold || 0}
                                    onChange={(e) => setEditData(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                                    className="h-8 w-16 p-1 text-xl font-black"
                                />
                            ) : (
                                <span className="text-2xl font-black text-slate-900">{item.lowStockThreshold ?? 0}</span>
                            )}
                            <span className="text-xs font-bold text-slate-400 text-nowrap">шт.</span>
                        </div>
                    </div>

                    {/* Critical Stock */}
                    <div
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                        onDoubleClick={handleStartEdit}
                    >
                        <span className="text-[11px] font-bold tracking-wider text-slate-400 block mb-2">Крит. остаток</span>
                        <div className="flex items-baseline gap-1.5">
                            {isEditing ? (
                                <Input
                                    type="number"
                                    value={editData.criticalStockThreshold || 0}
                                    onChange={(e) => setEditData(prev => ({ ...prev, criticalStockThreshold: parseInt(e.target.value) || 0 }))}
                                    className="h-8 w-16 p-1 text-xl font-black"
                                />
                            ) : (
                                <span className="text-2xl font-black text-slate-900">{item.criticalStockThreshold ?? 0}</span>
                            )}
                            <span className="text-xs font-bold text-slate-400 text-nowrap">шт.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ADJUSTMENT ACTION */}
            <button
                type="button"
                aria-label="Корректировка остатка"
                onClick={() => setAdjustType("set")}
                className={cn(
                    "group relative flex flex-col items-start justify-between p-5",
                    "bg-gradient-to-br from-violet-500 via-violet-600 to-violet-800",
                    "rounded-[var(--radius-outer)] xl:rounded-[32px]",
                    "shadow-[0_8px_20px_-6px_rgba(139,92,246,0.4)] hover:shadow-[0_16px_30px_-8px_rgba(139,92,246,0.6)]",
                    "transition-all duration-500 ease-out active:scale-[0.96] active:translate-y-0",
                    "overflow-hidden border-none text-white cursor-pointer w-full",
                    "aspect-square xl:aspect-[3.2/1] xl:col-span-4"
                )}
            >
                {/* Thematic background icon: Boxes, stroke 1.5, low opacity (global to avoid overlap) */}
                <Boxes className="absolute top-0 right-0 w-32 h-32 text-white opacity-[0.05] -mr-8 -mt-8 -rotate-12 transition-all duration-700 ease-out group-hover:scale-90 group-hover:-translate-x-4 group-hover:translate-y-4" strokeWidth={1.5} />

                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl transition-all duration-700 ease-out group-hover:bg-white/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Subtle glass edge */}
                <div className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/20 pointer-events-none" />

                <div className="w-11 h-11 rounded-[14px] bg-white/10 backdrop-blur-md ring-1 ring-white/30 shadow-xl flex items-center justify-center text-white relative z-10 transition-all duration-500 ease-out group-hover:scale-90 group-hover:bg-white/20 group-hover:shadow-white/10">
                    <SlidersHorizontal className="w-5 h-5 drop-shadow-md" />
                </div>

                <div className="relative z-10 flex flex-col items-start w-full mt-auto">
                    <span className="text-[14px] sm:text-[15px] font-bold leading-tight text-white drop-shadow-md transition-transform duration-500 ease-out group-hover:translate-x-1 text-left">
                        Корректировка<br />остатка
                    </span>
                    <span className="text-[11px] text-white/80 font-medium opacity-0 -translate-x-4 max-h-0 group-hover:max-h-5 group-hover:opacity-100 group-hover:translate-x-1 group-hover:mt-1 transition-all duration-500 ease-out">
                        Настроить наличие
                    </span>
                </div>
            </button>

            {/* CARD 2: BREAKDOWN */}
            <div className="crm-card rounded-[32px] bg-white shadow-sm border border-slate-100/50" style={{ padding: '32px' }}>
                <ItemWarehouseBreakdown
                    stocks={sortedStocks}
                />
            </div>
        </div>
    );
}

ItemPlacementWrapper.displayName = "ItemPlacementWrapper";
