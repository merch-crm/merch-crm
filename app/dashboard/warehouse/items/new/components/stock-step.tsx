"use client";

import { useState } from "react";
import {
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Box,
    Shirt,
    Info,
    Warehouse,
    Pencil,
    Plus,
    Minus,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, StorageLocation, ItemFormData } from "../../../types";
import { AddStorageLocationDialog } from "../../../add-storage-location-dialog";
import { StepFooter } from "./step-footer";

interface StockStepProps {
    category: Category;
    storageLocations: StorageLocation[];
    users: { id: string; name: string }[];
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
    users,
    formData,
    updateFormData,
    onSubmit,
    onBack,
    validationError,
    isSubmitting
}: StockStepProps) {
    const [isEditingName, setIsEditingName] = useState(false);

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

    const adjustValue = (field: keyof ItemFormData, delta: number) => {
        const value = formData[field];
        if (typeof value !== 'string' && typeof value !== 'number') return;

        const current = parseInt(value.toString() || "0") || 0;
        updateFormData({ [field]: Math.max(0, current + delta).toString() });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 px-10 pt-10 pb-0 overflow-hidden min-h-0 flex flex-col">
                <div className="max-w-6xl mx-auto space-y-6 flex-1 flex flex-col min-h-0 w-full">
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                            <Warehouse className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Складской учет</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400 opacity-60">Укажите место хранения и начальные остатки позиции</p>
                        </div>
                    </div>

                    {category.name.toLowerCase().includes("одежда") && (
                        <div className="p-5 bg-indigo-600 rounded-[14px] text-white shadow-xl shadow-indigo-200 relative overflow-hidden group shrink-0">
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                            <div className="relative z-10 flex items-center justify-between gap-8">
                                <div className="space-y-3 flex-1">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-indigo-200 uppercase tracking-[0.12em] leading-none">
                                        Подтвердите финальное название
                                    </label>
                                    <div className="flex items-center gap-4 group/name relative">
                                        {isEditingName ? (
                                            <div className="w-full flex items-center bg-white/10 -mx-4 rounded-[14px] border border-white/20 transition-all focus-within:bg-white/20 pr-2">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={formData.itemName}
                                                    onChange={(e) => updateFormData({ itemName: e.target.value })}
                                                    onBlur={() => setIsEditingName(false)}
                                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                                    className="w-full bg-transparent px-4 py-1.5 text-white font-black text-2xl focus:ring-0 placeholder:text-indigo-300 outline-none"
                                                />
                                                <button
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    onClick={() => setIsEditingName(false)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-emerald-500 hover:text-white transition-all shrink-0 active:scale-95"
                                                >
                                                    <Check className="w-4 h-4" strokeWidth={3} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setIsEditingName(true)}
                                                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-all"
                                            >
                                                <h3 className="text-2xl font-black text-white leading-tight">
                                                    {formData.itemName || 'Без названия'}
                                                </h3>
                                                <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all hover:bg-white/20">
                                                    <Pencil className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {formData.sku && (
                                        <div className="text-[10px] font-black text-indigo-200/60 uppercase tracking-widest -mt-1">
                                            Арт. {formData.sku}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[9px] font-bold text-indigo-100 uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-[14px] backdrop-blur-sm border border-white/10">
                                        <Info className="w-3 h-3" />
                                        Это название будет отображаться во всех складах и отчетах
                                    </div>
                                </div>
                                <div className="w-24 h-24 rounded-2xl bg-white/10 p-1.5 backdrop-blur-sm border border-white/20 shrink-0 shadow-2xl relative transition-all duration-500 group-hover:scale-105 group-hover:rotate-2">
                                    {formData.imagePreview ? (
                                        <img
                                            src={formData.imagePreview}
                                            alt=""
                                            className="w-full h-full object-cover rounded-[10px] shadow-inner"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center opacity-40">
                                            <Shirt className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 flex-1 min-h-0">
                        <div className="lg:col-span-7 space-y-4 flex flex-col min-h-0">
                            <div className="space-y-3 flex-1 flex flex-col min-h-0">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] px-1 shrink-0">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Основной склад для хранения
                                </label>

                                {storageLocations.length === 0 ? (
                                    <div className="p-6 rounded-[14px] bg-amber-50 border border-amber-100 text-amber-600 text-[11px] font-black uppercase tracking-wider flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 shrink-0" />
                                        Склады не найдены. Сначала настройте склад.
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                                        <div className="grid grid-cols-2 gap-2 pb-4">
                                            {storageLocations.map(loc => (
                                                <button
                                                    key={loc.id}
                                                    type="button"
                                                    onClick={() => updateFormData({ storageLocationId: loc.id })}
                                                    className={cn(
                                                        "p-4 rounded-[14px] text-left border transition-all flex items-center justify-between group",
                                                        formData.storageLocationId === loc.id
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-[1.01]"
                                                            : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:shadow-md"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 truncate">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-colors",
                                                            formData.storageLocationId === loc.id ? "bg-white/10" : "bg-slate-50"
                                                        )}>
                                                            <Box className="w-5 h-5" />
                                                        </div>
                                                        <div className="truncate">
                                                            <div className="font-black text-sm truncate">{loc.name}</div>
                                                            <div className={cn("text-[8px] font-black uppercase tracking-widest opacity-40 truncate", formData.storageLocationId === loc.id ? "text-white" : "text-slate-900")}>
                                                                Доступно
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {formData.storageLocationId === loc.id && (
                                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                                                            <CheckCircle2 className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                            <AddStorageLocationDialog
                                                users={users}
                                                trigger={
                                                    <div className="p-4 rounded-[14px] border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all flex items-center gap-3 h-[72px] group cursor-pointer">
                                                        <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center shrink-0 border-2 border-dashed border-slate-200 group-hover:border-indigo-200 group-hover:bg-white shadow-sm transition-all text-slate-400 group-hover:text-indigo-600">
                                                            <Plus className="w-5 h-5" />
                                                        </div>
                                                        <div className="font-black text-sm text-slate-400 group-hover:text-indigo-600">Создать склад</div>
                                                    </div>
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-12 xl:col-span-5 pb-4 flex flex-col min-h-0">
                            <div className="bg-white rounded-[14px] border border-slate-100 shadow-xl shadow-slate-200/50 h-full flex flex-col min-h-0 overflow-hidden">
                                <div className="p-5 space-y-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.12em] flex items-center gap-2">
                                                <Box className="w-3.5 h-3.5" />
                                                Текущий остаток
                                            </label>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase px-2.5 py-1 rounded-[14px] leading-none",
                                                statusColor === "text-emerald-500" ? "bg-emerald-50 text-emerald-600" :
                                                    statusColor === "text-rose-500" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                                            )}>
                                                {statusText}
                                            </span>
                                        </div>
                                        <div className="relative group/input">
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.quantity || "0"}
                                                onChange={(e) => updateFormData({ quantity: e.target.value })}
                                                className="w-full h-12 px-5 pr-32 rounded-[14px] border border-slate-100 bg-slate-50/50 text-xl font-black text-slate-900 focus:border-emerald-500 transition-all outline-none shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <div className="absolute right-3 inset-y-0 flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-400">
                                                    {formData.unit}
                                                </span>
                                                <div className="flex flex-col border-l border-slate-200/60 pl-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustValue('quantity', 1)}
                                                        className="w-7 h-4 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all active:scale-95"
                                                    >
                                                        <Plus className="w-3 h-3" strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => adjustValue('quantity', -1)}
                                                        className="w-7 h-4 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-95"
                                                    >
                                                        <Minus className="w-3 h-3" strokeWidth={3} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                                            Порог остатков
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-amber-500 uppercase tracking-[0.12em] px-1 flex items-center gap-2">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    Уведомление
                                                </label>
                                                <div className="relative group/input">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.lowStockThreshold || "10"}
                                                        onChange={(e) => updateFormData({ lowStockThreshold: e.target.value })}
                                                        className="w-full h-11 px-5 pr-24 rounded-[14px] border border-slate-100 bg-slate-50/50 font-black text-slate-900 focus:border-amber-500 transition-all outline-none shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <div className="absolute right-3 inset-y-0 flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-slate-400">{formData.unit}</span>
                                                        <div className="flex flex-col border-l border-slate-200/60 pl-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => adjustValue('lowStockThreshold', 1)}
                                                                className="w-7 h-3.5 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-all active:scale-95"
                                                            >
                                                                <Plus className="w-2.5 h-2.5" strokeWidth={3} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => adjustValue('lowStockThreshold', -1)}
                                                                className="w-7 h-3.5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-95"
                                                            >
                                                                <Minus className="w-2.5 h-2.5" strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-tight">Заказать новую партию</p>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.12em] px-1 flex items-center gap-2">
                                                    <AlertTriangle className="w-3.5 h-3.5" />
                                                    Критично
                                                </label>
                                                <div className="relative group/input">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.criticalStockThreshold || "0"}
                                                        onChange={(e) => updateFormData({ criticalStockThreshold: e.target.value })}
                                                        className="w-full h-11 px-5 pr-24 rounded-[14px] border border-slate-100 bg-slate-50/50 font-black text-slate-900 focus:border-rose-500 transition-all outline-none shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <div className="absolute right-3 inset-y-0 flex items-center gap-3">
                                                        <span className="text-[10px] font-bold text-slate-400">{formData.unit}</span>
                                                        <div className="flex flex-col border-l border-slate-200/60 pl-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => adjustValue('criticalStockThreshold', 1)}
                                                                className="w-7 h-3.5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-95"
                                                            >
                                                                <Plus className="w-2.5 h-2.5" strokeWidth={3} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => adjustValue('criticalStockThreshold', -1)}
                                                                className="w-7 h-3.5 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all active:scale-95"
                                                            >
                                                                <Minus className="w-2.5 h-2.5" strokeWidth={3} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-tight">Остановить продажи</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StepFooter
                onBack={onBack}
                onNext={onSubmit}
                nextLabel="Создать позицию"
                isNextDisabled={!formData.storageLocationId}
                isSubmitting={isSubmitting}
                validationError={validationError}
                nextIcon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            />
        </div>
    );
}

