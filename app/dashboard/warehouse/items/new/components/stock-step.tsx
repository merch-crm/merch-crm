"use client";

import { MapPin, AlertTriangle, CheckCircle2, Box, Shirt, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "../../../inventory-client";
import { StorageLocation } from "../../../storage-locations-tab";
import { ItemFormData } from "../../../types";

interface StockStepProps {
    category: Category;
    storageLocations: StorageLocation[];
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onSubmit: () => void;
    onBack: () => void;
    validationError: string;
    isSubmitting: boolean;
}

export function StockStep({
    category,
    storageLocations,
    formData,
    updateFormData,
    onSubmit,
    onBack,
    validationError,
    isSubmitting
}: StockStepProps) {

    // Quick helpers for visual hints
    // Quick helpers for visual hints
    const itemTotal = parseInt(formData.quantity || "0") || 0;
    const lowStock = parseInt(formData.lowStockThreshold || "10") || 10;
    const critStock = parseInt(formData.criticalStockThreshold || "0") || 0;

    let statusColor = "text-emerald-500";
    let statusText = "В наличии";

    if (itemTotal <= critStock) {
        statusColor = "text-rose-500";
        statusText = "Критический остаток";
    } else if (itemTotal <= lowStock) {
        statusColor = "text-amber-500";
        statusText = "Заканчивается";
    }

    return (
        <div className="flex flex-col min-h-full">
            <div className="flex-1 p-8 lg:p-12">
                <div className="max-w-5xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Складской учет</h2>
                            <p className="text-slate-500 font-medium mt-1">Укажите место хранения и начальные остатки позиции</p>
                        </div>
                    </div>

                    {/* Final Name Confirmation (for clothing) */}
                    {category.name.toLowerCase().includes("одежда") && (
                        <div className="p-8 bg-indigo-600 rounded-[14px] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                <Shirt className="w-32 h-32" />
                            </div>
                            <div className="relative z-10 space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-indigo-200 uppercase tracking-widest leading-none">
                                    Подтвердите финальное название
                                </label>
                                <input
                                    type="text"
                                    value={formData.itemName}
                                    onChange={(e) => updateFormData({ itemName: e.target.value })}
                                    placeholder="Например: Футболка Muse Wear Premium Белый XL"
                                    className="w-full bg-transparent border-0 p-0 text-white font-black text-3xl focus:ring-0 placeholder:text-indigo-300 transition-all"
                                />
                                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-100 uppercase tracking-wider bg-white/10 w-fit px-3 py-1.5 rounded-[14px] backdrop-blur-sm border border-white/10">
                                    <Info className="w-3.5 h-3.5" />
                                    Это название будет отображаться во всех цехах и отчетах
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Storage Selection */}
                        <div className="lg:col-span-7 space-y-8">
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Основной склад для хранения
                                </label>

                                {storageLocations.length === 0 ? (
                                    <div className="p-6 rounded-[14px] bg-amber-50 border border-amber-100 text-amber-600 text-[11px] font-black uppercase tracking-wider flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        Склады не найдены. Сначала настройте склад.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {storageLocations.map(loc => (
                                            <button
                                                key={loc.id}
                                                type="button"
                                                onClick={() => updateFormData({ storageLocationId: loc.id })}
                                                className={cn(
                                                    "p-5 rounded-[14px] text-left border transition-all flex items-center justify-between group",
                                                    formData.storageLocationId === loc.id
                                                        ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.01]"
                                                        : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:shadow-md"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-[14px] flex items-center justify-center transition-colors",
                                                        formData.storageLocationId === loc.id ? "bg-white/10" : "bg-slate-50"
                                                    )}>
                                                        <Box className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-base">{loc.name}</div>
                                                        <div className={cn("text-[9px] font-black uppercase tracking-widest opacity-40", formData.storageLocationId === loc.id ? "text-white" : "text-slate-900")}>
                                                            Доступно для размещения
                                                        </div>
                                                    </div>
                                                </div>
                                                {formData.storageLocationId === loc.id && (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quantity and Thresholds */}
                        <div className="lg:col-span-5 space-y-10">
                            <div className="p-8 bg-white rounded-[14px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10">
                                {/* Quantity */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Текущий остаток</label>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-[14px]",
                                            statusColor === "text-emerald-500" ? "bg-emerald-50 text-emerald-600" :
                                                statusColor === "text-rose-500" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                        )}>
                                            {statusText}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.quantity || "0"}
                                            onChange={(e) => updateFormData({ quantity: e.target.value })}
                                            className="w-full h-20 px-8 rounded-[14px] border border-slate-100 bg-slate-50/50 text-4xl font-black text-slate-900 focus:border-emerald-500 transition-all outline-none shadow-inner"
                                        />
                                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-slate-300 uppercase">
                                            {formData.unit}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100" />

                                {/* Thresholds */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-1">Уведомление</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.lowStockThreshold || "10"}
                                                onChange={(e) => updateFormData({ lowStockThreshold: e.target.value })}
                                                className="w-full h-12 px-5 rounded-[14px] border border-slate-100 bg-slate-50/50 font-black text-slate-900 focus:border-amber-500 transition-all outline-none"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase">{formData.unit}</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-tight">Заказать новую партию</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">Критично</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.criticalStockThreshold || "0"}
                                                onChange={(e) => updateFormData({ criticalStockThreshold: e.target.value })}
                                                className="w-full h-12 px-5 rounded-[14px] border border-slate-100 bg-slate-50/50 font-black text-slate-900 focus:border-rose-500 transition-all outline-none"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300 uppercase">{formData.unit}</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-tight">Остановить продажи</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-6 z-30">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={onBack}
                        disabled={isSubmitting}
                        className="px-6 h-12 rounded-[14px] text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Назад
                    </button>

                    <div className="flex items-center gap-6">
                        {validationError && (
                            <div className="flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-2 rounded-[14px] border border-rose-100 animate-in fade-in slide-in-from-right-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">{validationError}</span>
                            </div>
                        )}
                        <button
                            onClick={onSubmit}
                            disabled={isSubmitting || !formData.storageLocationId}
                            className="px-8 h-12 bg-slate-900 text-white rounded-[14px] font-black text-[13px] tracking-widest uppercase hover:bg-black shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Создание...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    Создать позицию
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


