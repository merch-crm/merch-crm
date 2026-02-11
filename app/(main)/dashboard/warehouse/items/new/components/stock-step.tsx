"use client";

import {
    AlertTriangle,
    Warehouse,
    Plus,
    Minus,
    Check,
    Tag,
    Banknote
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, StorageLocation, ItemFormData } from "../../../types";
import { AddStorageLocationDialog } from "../../../add-storage-location-dialog";
import { StepFooter } from "./step-footer";
import { PremiumSelect } from "@/components/ui/premium-select";
import { useBranding } from "@/components/branding-provider";

interface StockStepProps {
    category: Category;
    storageLocations: StorageLocation[];
    users: { id: string; name: string }[];
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onNext: () => void;
    onBack: () => void;
    validationError: string;
    isSubmitting: boolean;
}

export function StockStep({
    storageLocations,
    users,
    formData,
    updateFormData,
    onNext,
    onBack,
    validationError,
    isSubmitting
}: StockStepProps) {
    const { currencySymbol } = useBranding();

    const adjustValue = (field: keyof ItemFormData, delta: number) => {
        const value = formData[field];
        if (typeof value !== 'string' && typeof value !== 'number') return;

        const current = parseInt(value.toString() || "0") || 0;
        updateFormData({ [field]: Math.max(0, current + delta).toString() });
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 px-4 sm:px-10 pt-6 sm:pt-10 pb-6 overflow-hidden min-h-0 flex flex-col">
                <div className="max-w-[1400px] mx-auto space-y-4 flex-1 flex flex-col min-h-0 w-full">
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                            <Warehouse className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Складской учет</h2>
                            <p className="text-[10px] font-bold text-slate-700 opacity-60">Укажите место хранения и начальные остатки позиции</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 sm:gap-6 flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-8 pt-2 pb-6 -mx-4 sm:-mx-8">
                        {/* FIRST ROW */}
                        {/* BENTO BLOCK 1: MAIN QUANTITY */}
                        <div className="col-span-12 md:col-span-5 xl:col-span-5 crm-card !p-6 !rounded-[28px] hover:shadow-md transition-all duration-300 flex flex-col items-start text-left">
                            <div className="mb-6">
                                <h3 className="text-base font-bold text-slate-900">Количество</h3>
                                <p className="text-[10px] font-bold text-slate-700 opacity-60 mt-1">Укажите начальный остаток</p>
                            </div>

                            <div className="w-full">
                                <div className="flex items-stretch gap-2 transition-all duration-300 group/widget w-full">
                                    <div className="flex-1 bg-slate-50 rounded-[22px] px-6 py-3 border border-slate-100 flex flex-col items-start gap-1">
                                        <div className="flex items-baseline gap-1">
                                            <input
                                                type="number"
                                                value={formData.quantity || "0"}
                                                onChange={(e) => updateFormData({ quantity: e.target.value })}
                                                className="text-4xl font-black text-slate-900 bg-transparent border-none focus:ring-0 outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                style={{ width: `${Math.max(1, (formData.quantity || "0").toString().length) * 22}px`, minWidth: '40px' }}
                                            />
                                            <span className="text-sm font-black text-primary uppercase tracking-[0.15em] mb-1.5 shrink-0">
                                                {formData.unit}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-40 group-hover/widget:opacity-100 transition-opacity">
                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Текущий остаток</span>
                                        </div>
                                    </div>

                                    <div className="w-16 flex flex-col gap-1">
                                        <button
                                            type="button"
                                            onClick={() => adjustValue('quantity', 1)}
                                            className="flex-1 rounded-[20px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all active:scale-95 group/plus"
                                        >
                                            <Plus className="w-5 h-5 transition-transform group-hover/plus:scale-110" strokeWidth={3} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => adjustValue('quantity', -1)}
                                            className="flex-1 rounded-[20px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50 transition-all active:scale-95 group/minus"
                                        >
                                            <Minus className="w-5 h-5 transition-transform group-hover/minus:scale-110" strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BENTO BLOCK 2: FINANCIALS */}
                        <div className="col-span-12 md:col-span-7 xl:col-span-7 crm-card !p-6 !rounded-[28px] hover:shadow-md transition-all duration-300 flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-base font-bold text-slate-900">Финансы</h3>
                                <p className="text-[10px] font-bold text-slate-700 opacity-60 mt-1">Себестоимость и цена продажи</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-50 -translate-x-1/2 hidden sm:block" />

                                <div className="space-y-3 min-w-0">
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center text-violet-500">
                                                <Tag className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Себестоимость</span>
                                        </div>
                                        <div className="relative bg-slate-50 rounded-xl px-4 py-3 border border-slate-100/50 hover:border-slate-200 transition-colors w-full">
                                            <input
                                                type="number"
                                                value={formData.costPrice || "0"}
                                                onChange={(e) => updateFormData({ costPrice: e.target.value })}
                                                className="w-full text-2xl font-black text-slate-900 bg-transparent border-none focus:ring-0 outline-none p-0 pr-8 min-w-0"
                                            />
                                            <span className="absolute right-4 bottom-3 text-sm font-bold text-slate-300">{currencySymbol}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 min-w-0">
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                                                <Banknote className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Цена продажи</span>
                                        </div>
                                        <div className="relative bg-slate-50 rounded-xl px-4 py-3 border border-slate-100/50 hover:border-slate-200 transition-colors w-full">
                                            <input
                                                type="number"
                                                value={formData.sellingPrice || "0"}
                                                onChange={(e) => updateFormData({ sellingPrice: e.target.value })}
                                                className="w-full text-2xl font-black text-slate-900 bg-transparent border-none focus:ring-0 outline-none p-0 pr-8 min-w-0"
                                            />
                                            <span className="absolute right-4 bottom-3 text-sm font-bold text-slate-300">{currencySymbol}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECOND ROW */}
                        <div className="col-span-12 md:col-span-5 xl:col-span-5 flex flex-col gap-6">
                            {/* BENTO BLOCK 3: THRESHOLDS */}
                            <div className="crm-card !p-6 !rounded-[28px] hover:shadow-md transition-all duration-300 flex flex-col gap-5 shrink-0">
                                <div className="mb-6">
                                    <h3 className="text-base font-bold text-slate-900">Уведомления</h3>
                                    <p className="text-[10px] font-bold text-slate-700 opacity-60 mt-1">Настройка лимитов</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-50 -translate-x-1/2 hidden sm:block" />

                                    <div className="space-y-3 min-w-0">
                                        <div className="flex flex-col">
                                            <div className="text-[28px] font-black text-slate-900 flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100/50 w-full">
                                                <input
                                                    type="number"
                                                    value={formData.lowStockThreshold || "10"}
                                                    onChange={(e) => updateFormData({ lowStockThreshold: e.target.value })}
                                                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none p-0 text-slate-900 min-w-0"
                                                />
                                                <span className="text-[12px] text-slate-700 font-bold uppercase tracking-widest shrink-0">{formData.unit}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-tight mt-2 px-0.5">Предупреждение</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 min-w-0">
                                        <div className="flex flex-col">
                                            <div className="text-[28px] font-black text-slate-900 flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100/50 w-full">
                                                <input
                                                    type="number"
                                                    value={formData.criticalStockThreshold || "0"}
                                                    onChange={(e) => updateFormData({ criticalStockThreshold: e.target.value })}
                                                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none p-0 text-slate-900 min-w-0"
                                                />
                                                <span className="text-[12px] text-slate-700 font-bold uppercase tracking-widest shrink-0">{formData.unit}</span>
                                            </div>
                                            <span className="text-[9px] font-black text-rose-500 uppercase tracking-tight mt-2 px-0.5">Критический лимит</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BENTO BLOCK 4: RESPONSIBLE PERSON */}
                            <div className="crm-card !p-6 !rounded-[28px] hover:shadow-md transition-all duration-300 flex flex-col gap-4 flex-1">
                                <div className="mb-6">
                                    <h3 className="text-base font-bold text-slate-900">Ответственный</h3>
                                    <p className="text-[10px] font-bold text-slate-700 opacity-60 mt-1">Кто создал позицию</p>
                                </div>

                                <PremiumSelect
                                    options={users.map(u => ({ id: u.id, title: u.name }))}
                                    value={(formData.responsibleUserId as string) || ""}
                                    onChange={(val) => updateFormData({ responsibleUserId: val })}
                                    placeholder="Выберите сотрудника..."
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* STORAGE LOCATIONS CARD */}
                        <div className="col-span-12 md:col-span-7 xl:col-span-7 crm-card !p-0 !rounded-[28px] shadow-sm flex flex-col min-h-0">
                            <div className="p-6 pb-2">
                                <h3 className="text-base font-bold text-slate-900">Размещение товара</h3>
                                <p className="text-[10px] font-bold text-slate-700 opacity-60 mt-1">Выберите склад для хранения</p>
                            </div>

                            <div className="flex-1 flex flex-col px-6 pb-6 pt-0">
                                <div className="px-4 pt-1 pb-1 -mx-4">
                                    {storageLocations.length === 0 ? (
                                        <div className="p-6 rounded-[var(--radius)] bg-amber-50 border border-amber-100 text-amber-600 text-[11px] font-bold  flex items-center gap-3">
                                            <AlertTriangle className="w-5 h-5 shrink-0" />
                                            Склады не найдены. Сначала настройте склад.
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {storageLocations.map(loc => (
                                                <button
                                                    key={loc.id}
                                                    type="button"
                                                    onClick={() => updateFormData({ storageLocationId: loc.id })}
                                                    className={cn(
                                                        "p-3.5 rounded-[20px] text-left border transition-all duration-300 flex items-center justify-between group relative",
                                                        formData.storageLocationId === loc.id
                                                            ? "bg-primary border-primary text-white shadow-md shadow-black/10"
                                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:shadow-md"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 truncate relative z-10">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-300",
                                                            formData.storageLocationId === loc.id ? "bg-white/10" : "bg-slate-100 border border-slate-200/50"
                                                        )}>
                                                            <Warehouse className={cn("w-5 h-5", formData.storageLocationId === loc.id ? "text-white" : "text-slate-400")} />
                                                        </div>
                                                        <div className="truncate">
                                                            <div className="font-bold text-sm leading-tight truncate px-0.5">{loc.name}</div>
                                                            <div className={cn("text-[9px] font-black mt-0.5 uppercase tracking-wider opacity-60 px-0.5", formData.storageLocationId === loc.id ? "text-white/80" : "text-slate-700")}>
                                                                Склад активен
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {formData.storageLocationId === loc.id && (
                                                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg relative z-10">
                                                            <Check className="w-3.5 h-3.5 text-primary" strokeWidth={4} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                            <AddStorageLocationDialog
                                                users={users}
                                                trigger={
                                                    <div className="p-3.5 rounded-[20px] border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 flex items-center gap-3 h-[74px] group cursor-pointer">
                                                        <div className="w-10 h-10 rounded-[14px] bg-white flex items-center justify-center shrink-0 border-2 border-dashed border-slate-200 group-hover:border-primary/30 group-hover:bg-white shadow-sm transition-all text-slate-400 group-hover:text-primary">
                                                            <Plus className="w-5 h-5" />
                                                        </div>
                                                        <div className="font-black text-[11px] uppercase tracking-widest text-slate-400 group-hover:text-primary">Добавить новый склад</div>
                                                    </div>
                                                }
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StepFooter
                onBack={onBack}
                onNext={onNext}
                nextLabel="Далее"
                isNextDisabled={!formData.storageLocationId}
                isSubmitting={isSubmitting}
                validationError={validationError}
            />
        </div>
    );
}
