"use client";

import React from "react";
import {
    Package,
    PlusCircle,
    AlertTriangle,
    Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem, ItemStock, StorageLocation } from "../../../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ItemInventorySectionProps {
    item: InventoryItem;
    stocks: ItemStock[];
    storageLocations: StorageLocation[];
    isEditing: boolean;
    editData: InventoryItem;
    onUpdateField: (field: string, value: string | number) => void;
    onAdjustStock: (locationId?: string) => void;
    onTransferStock: (fromLocationId: string) => void;
}

export function ItemInventorySection({
    item,
    stocks,
    storageLocations,
    isEditing,
    editData,
    onUpdateField,
    onAdjustStock,
    onTransferStock
}: ItemInventorySectionProps) {

    const isLowStock = item.quantity <= item.lowStockThreshold && item.quantity > item.criticalStockThreshold;
    const isCriticalStock = item.quantity <= item.criticalStockThreshold;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Summary Row */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "w-16 h-16 rounded-[20px] flex items-center justify-center transition-transform duration-500",
                        isCriticalStock ? "bg-rose-50 text-rose-500" :
                            isLowStock ? "bg-amber-50 text-amber-500" :
                                "bg-indigo-50 text-indigo-600"
                    )}>
                        <Package className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Общий остаток</span>
                            {isCriticalStock && <Badge className="bg-rose-500 text-white border-none text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter">Критически мало</Badge>}
                            {isLowStock && !isCriticalStock && <Badge className="bg-amber-500 text-white border-none text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter">Мало</Badge>}
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{item.quantity}</span>
                            <span className="text-xl font-bold text-slate-400 uppercase tracking-tight">{item.unit}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => onAdjustStock()}
                        className="bg-slate-900 hover:bg-black text-white rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Корректировка
                    </Button>
                </div>
            </div>

            {/* Thresholds in Editing Mode */}
            {isEditing && (
                <div className="bg-slate-50/50 rounded-[24px] p-8 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            Порог предупреждения (Мало)
                        </label>
                        <input
                            type="number"
                            value={editData.lowStockThreshold}
                            onChange={(e) => onUpdateField("lowStockThreshold", parseInt(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500/10 outline-none transition-all shadow-sm"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                            Критический порог (Критично)
                        </label>
                        <input
                            type="number"
                            value={editData.criticalStockThreshold}
                            onChange={(e) => onUpdateField("criticalStockThreshold", parseInt(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500/10 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            )}

            {/* Warehouse Breakdown */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <Warehouse className="w-4 h-4 text-slate-400" />
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Распределение по складам</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stocks.map((stock) => (
                        <div
                            key={stock.id}
                            className="group bg-white rounded-[20px] border border-slate-100 p-5 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <Warehouse className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{stock.storageLocation?.name || "Неизвестно"}</h4>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Локация склада</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-black text-slate-900 leading-none block">{stock.quantity}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{item.unit}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onAdjustStock(stock.storageLocationId)}
                                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tighter rounded-lg h-9"
                                >
                                    Инвентаризация
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onTransferStock(stock.storageLocationId)}
                                    className="flex-1 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-tighter rounded-lg h-9"
                                >
                                    Перемещение
                                </Button>
                            </div>
                        </div>
                    ))}

                    {stocks.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-[24px] border border-dashed border-slate-200">
                            <Package className="w-10 h-10 text-slate-200 mx-auto mb-3 opacity-50" />
                            <h4 className="text-xs font-bold text-slate-500 mb-1">Остатки на складах отсутствуют</h4>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 opacity-60">Нажмите кнопку выше для коррекции</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
