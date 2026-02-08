"use client";

import React from "react";
import {
    Package,
    PlusCircle,

    Warehouse,
    ArrowRightLeft,
    TrendingDown,
    Map
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem, ItemStock } from "../../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ItemInventorySectionProps {
    item: InventoryItem;
    stocks: ItemStock[];

    isEditing: boolean;
    editData: InventoryItem;
    onUpdateField: (field: string, value: string | number) => void;
    onAdjustStock: (locationId?: string) => void;
    onTransferStock: (fromLocationId: string) => void;
}

export function ItemInventorySection({
    item,
    stocks,

    isEditing,
    editData,
    onUpdateField,
    onAdjustStock,
    onTransferStock
}: ItemInventorySectionProps) {

    const isLowStock = item.quantity <= item.lowStockThreshold && item.quantity > item.criticalStockThreshold;
    const isCriticalStock = item.quantity <= item.criticalStockThreshold;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            {/* Stock Performance Summary */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className={cn(
                    "flex-1 p-6 sm:p-8 rounded-2xl border relative overflow-hidden group transition-all duration-700",
                    isCriticalStock ? "bg-rose-50 border-rose-100" :
                        isLowStock ? "bg-amber-50 border-amber-100" :
                            "bg-primary border-transparent shadow-lg"
                )}>
                    {/* Decorative element */}
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-black/5 rounded-full blur-3xl group-hover:bg-black/10 transition-colors" />

                    <div className="relative space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/20">
                                <Package className="w-6 h-6" />
                            </div>
                            {isCriticalStock && <Badge className="bg-rose-600 text-white rounded-2xl font-bold text-[10px] px-4">Критический остаток</Badge>}
                            {isLowStock && !isCriticalStock && <Badge className="bg-amber-600 text-white rounded-2xl font-bold text-[10px] px-4">Низкий запас</Badge>}
                        </div>

                        <div>
                            <p className={cn("text-[12px] font-bold", isLowStock || isCriticalStock ? "text-slate-500" : "text-white/60")}>Доступный остаток</p>
                            <div className="flex items-baseline gap-2">
                                <span className={cn("text-5xl font-bold tabular-nums leading-none", isLowStock || isCriticalStock ? "text-slate-900" : "text-white")}>
                                    {item.quantity}
                                </span>
                                <span className={cn("text-xl font-bold", isLowStock || isCriticalStock ? "text-slate-400" : "text-white/30")}>{item.unit || "шт"}</span>
                            </div>
                        </div>

                        <div className={cn("pt-6 border-t", isLowStock || isCriticalStock ? "border-black/5" : "border-white/10")}>
                            <Button
                                onClick={() => onAdjustStock()}
                                className={cn("rounded-2xl px-8 h-11 text-[13px] font-bold transition-all shadow-md active:scale-95 border-none",
                                    isLowStock || isCriticalStock ? "bg-slate-900 text-white hover:bg-black" : "bg-white text-primary hover:bg-slate-50")}
                            >
                                <PlusCircle className="w-4 h-4 mr-3" />
                                Инвентаризация
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-[300px] lg:w-[400px] bg-slate-900 p-6 sm:p-8 rounded-2xl text-white flex flex-col justify-between group overflow-hidden relative border border-white/5 shadow-xl">
                    {/* Decorative flow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative space-y-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-rose-400" />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500">Система оповещений</span>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-primary/60">Лимит предупреждения</p>
                                <p className="text-2xl font-bold">{item.lowStockThreshold} {item.unit || "шт"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-rose-500/60">Критический лимит</p>
                                <p className="text-2xl font-bold">{item.criticalStockThreshold} {item.unit || "шт"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-8">
                        <Button
                            variant="outline"
                            className="w-full h-11 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-[13px]"
                            onClick={() => onUpdateField("lowStockThreshold", 10)} // Example, usually triggers editing
                        >
                            Настроить пороги
                        </Button>
                    </div>
                </div>
            </div>

            {/* Thresholds Editing Mode (if needed) */}
            {isEditing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <label className="text-sm font-bold text-slate-700 ml-1">Лимит предупреждения</label>
                        <input
                            type="number"
                            value={editData.lowStockThreshold}
                            onChange={(e) => onUpdateField("lowStockThreshold", parseInt(e.target.value))}
                            className="w-full text-2xl font-bold bg-slate-50 border-none outline-none p-4 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all"
                        />
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <label className="text-sm font-bold text-slate-700 ml-1">Критический лимит</label>
                        <input
                            type="number"
                            value={editData.criticalStockThreshold}
                            onChange={(e) => onUpdateField("criticalStockThreshold", parseInt(e.target.value))}
                            className="w-full text-2xl font-bold bg-slate-50 border-none outline-none p-4 rounded-2xl focus:ring-4 focus:ring-rose-500/10 transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Warehouse Breakdown */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Map className="w-4 h-4 text-primary" />
                        <h4 className="text-[11px] font-bold text-slate-400">Геолокация запасов</h4>
                    </div>
                    <Badge className="bg-slate-900 text-white rounded-2xl font-bold text-[10px] px-3">
                        {stocks.length} локаций
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stocks.map((stock) => (
                        <div
                            key={stock.id}
                            className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-11 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                                    <Warehouse className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-bold text-slate-950 leading-none">
                                        {stock.storageLocation?.name || "Global Store"}
                                    </h4>

                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-slate-950 tabular-nums leading-none">{stock.quantity}</span>
                                    <span className="text-[11px] font-bold text-slate-400">{item.unit || "шт"}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onAdjustStock(stock.storageLocationId)}
                                        className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-slate-400"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onTransferStock(stock.storageLocationId)}
                                        className="p-3 bg-slate-50 rounded-2xl hover:bg-primary hover:text-white transition-all text-slate-400"
                                    >
                                        <ArrowRightLeft className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {stocks.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                            <PlusCircle className="w-16 h-16 text-slate-300 mx-auto mb-6 transition-transform hover:rotate-90 cursor-pointer" onClick={() => onAdjustStock()} />
                            <h4 className="text-xl font-bold text-slate-400  mb-2">Регистр пуст</h4>
                            <p className="text-[12px] font-medium text-slate-300">Нажмите для инициализации стока</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
