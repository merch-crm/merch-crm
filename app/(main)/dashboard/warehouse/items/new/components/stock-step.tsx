"use client";

import {
    AlertTriangle,
    Warehouse,
    Plus,
    Minus,
    Check,
    Tag,
    Banknote,
    Package,
    Bell,
    User,
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, StorageLocation, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { Select } from "@/components/ui/select";
import { useBranding } from "@/components/branding-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddStorageLocationDialog } from "@/app/(main)/dashboard/warehouse/add-storage-location-dialog";
import { StepFooter } from "./step-footer";

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
        if (!formData) return;
        const value = formData[field];
        if (typeof value !== 'string' && typeof value !== 'number') return;

        const current = parseInt(value.toString() || "0") || 0;
        updateFormData({ [field]: Math.max(0, current + delta).toString() });
    };

    return (
        <div className="flex flex-col h-full !overflow-visible">
            <div className="flex-1 !overflow-visible min-h-0 flex flex-col">
                <div className="space-y-1 flex flex-col min-h-0 w-full px-6 pt-3">
                    <div className="flex items-center gap-3 shrink-0 mb-1">
                        <div className="w-10 h-10 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                            <Warehouse className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Складской учет</h2>
                            <p className="text-xs font-bold text-slate-700 opacity-60 tracking-tight">Место хранения и начальные остатки</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0 overflow-y-auto custom-scrollbar pb-0">
                        {/* LEFT COLUMN */}
                        <div className="flex flex-col gap-2 pr-6">
                            {/* BENTO BLOCK 1: MAIN QUANTITY */}
                            <div className="crm-card !rounded-[24px] !p-5 transition-all duration-300 flex flex-col items-start text-left">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                        <Package className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight">Количество</h3>
                                        <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-tight">Начальный остаток</p>
                                    </div>
                                </div>

                                <div className="w-full">
                                    <div className="flex items-stretch gap-2 transition-all duration-300 group/widget w-full">
                                        <div className="flex-1 bg-slate-50 rounded-[18px] px-5 py-2.5 border border-slate-100 flex flex-col items-start gap-1">
                                            <div className="flex items-baseline gap-1">
                                                <Input
                                                    type="number"
                                                    value={formData.quantity || "0"}
                                                    onChange={(e) => updateFormData({ quantity: e.target.value })}
                                                    className="text-3xl font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-auto shadow-none"
                                                    style={{ width: `${Math.max(1, (formData.quantity || "0").toString().length) * 18}px`, minWidth: '32px' }}
                                                />
                                                <span className="text-[11px] font-black text-primary tracking-[0.1em] mb-1.5 shrink-0">
                                                    шт
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 opacity-40 group-hover/widget:opacity-100 transition-opacity">
                                                <div className="w-1 h-1 rounded-full bg-primary" />
                                                <span className="text-xs font-black text-slate-700">Текущий остаток</span>
                                            </div>
                                        </div>

                                        <div className="w-14 flex flex-col gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => adjustValue('quantity', 1)}
                                                className="flex-1 rounded-[16px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 transition-all active:scale-95 h-auto p-0"
                                            >
                                                <Plus className="w-4 h-4" strokeWidth={3} />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => adjustValue('quantity', -1)}
                                                className="flex-1 rounded-[16px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all active:scale-95 h-auto p-0"
                                            >
                                                <Minus className="w-4 h-4" strokeWidth={3} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BENTO BLOCK 3: THRESHOLDS */}
                            <div className="crm-card !rounded-[24px] !p-5 transition-all duration-300 flex flex-col gap-2 shrink-0">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                        <Bell className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight">Уведомления</h3>
                                        <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-tight">Лимиты</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2.5 relative">
                                    <div className="space-y-2 min-w-0">
                                        <div className="flex flex-col">
                                            <div className="bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100/50 w-full flex items-center gap-1.5">
                                                <Input
                                                    type="number"
                                                    value={formData.lowStockThreshold || "10"}
                                                    onChange={(e) => updateFormData({ lowStockThreshold: e.target.value })}
                                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 outline-none p-0 text-slate-900 min-w-0 h-auto shadow-none text-xl font-black"
                                                />
                                                <span className="text-xs text-slate-700 font-bold shrink-0">шт</span>
                                            </div>
                                            <span className="text-xs font-black text-amber-500 mt-1.5 px-0.5">Предупреждение</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 min-w-0">
                                        <div className="flex flex-col">
                                            <div className="bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100/50 w-full flex items-center gap-1.5">
                                                <Input
                                                    type="number"
                                                    value={formData.criticalStockThreshold || "0"}
                                                    onChange={(e) => updateFormData({ criticalStockThreshold: e.target.value })}
                                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 outline-none p-0 text-slate-900 min-w-0 h-auto shadow-none text-xl font-black"
                                                />
                                                <span className="text-xs text-slate-700 font-bold shrink-0">шт</span>
                                            </div>
                                            <span className="text-xs font-black text-rose-500 mt-1.5 px-0.5">Критический лимит</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* BENTO BLOCK 4: RESPONSIBLE PERSON */}
                            <div className="crm-card !rounded-[24px] !p-5 transition-all duration-300 flex flex-col gap-2">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                        <User className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight">Ответственный</h3>
                                        <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-tight">Создатель</p>
                                    </div>
                                </div>

                                <Select
                                    options={(users || []).map(u => ({ id: u.id, title: u.name }))}
                                    value={(formData.responsibleUserId as string) || ""}
                                    onChange={(val) => updateFormData({ responsibleUserId: val })}
                                    placeholder="Сотрудник..."
                                    className="w-full text-sm h-9"
                                />
                            </div>
                        </div>

                        {/* VERTICAL DIVIDER */}
                        <div className="hidden md:block w-px bg-slate-100 self-stretch my-2" />

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-2 pl-6">
                            {/* BENTO BLOCK 2: FINANCIALS */}
                            <div className="crm-card !rounded-[24px] !p-5 transition-all duration-300 flex flex-col">
                                <div className="flex items-center gap-2.5 mb-3">
                                    <div className="w-8 h-8 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                        <Banknote className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-sm font-bold text-slate-800 leading-tight">Финансы</h3>
                                        <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-tight">Стоимость</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 relative">
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Tag className="w-3 h-3 text-violet-400" />
                                                <span className="text-xs font-black text-slate-700">Себестоимость</span>
                                            </div>
                                            <div className="relative bg-slate-50 rounded-xl px-3 py-2 border border-slate-100/50 hover:border-slate-200 transition-colors w-full">
                                                <Input
                                                    type="number"
                                                    value={formData.costPrice || "0"}
                                                    onChange={(e) => updateFormData({ costPrice: e.target.value })}
                                                    className="w-full text-lg font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 pr-6 min-w-0 h-auto shadow-none"
                                                />
                                                <span className="absolute right-3 bottom-2 text-xs font-bold text-slate-300">{currencySymbol}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <Banknote className="w-3 h-3 text-emerald-400" />
                                                <span className="text-xs font-black text-slate-700">Продажа</span>
                                            </div>
                                            <div className="relative bg-slate-50 rounded-xl px-3 py-2 border border-slate-100/50 hover:border-slate-200 transition-colors w-full">
                                                <Input
                                                    type="number"
                                                    value={formData.sellingPrice || "0"}
                                                    onChange={(e) => updateFormData({ sellingPrice: e.target.value })}
                                                    className="w-full text-lg font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 pr-6 min-w-0 h-auto shadow-none"
                                                />
                                                <span className="absolute right-3 bottom-2 text-xs font-bold text-slate-300">{currencySymbol}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STORAGE LOCATIONS CARD */}
                            <div className="crm-card !p-0 !rounded-[24px] shadow-sm flex flex-col min-h-0">
                                <div className="p-5 pb-2">
                                    <div className="flex items-center gap-2.5 mb-2">
                                        <div className="w-8 h-8 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                            <MapPin className="w-4 h-4" strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-bold text-slate-800 leading-tight">Размещение</h3>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-tight">Склад</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col px-5 pb-5 pt-0">
                                    <div className="px-3 pt-1 pb-1 -mx-3">
                                        {(storageLocations || []).length === 0 ? (
                                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 text-xs font-bold flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                                Сначала настройте склад.
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {(storageLocations || []).map(loc => (
                                                    <Button
                                                        key={loc.id}
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => updateFormData({ storageLocationId: loc.id })}
                                                        className={cn("p-2.5 rounded-[16px] text-left border transition-all duration-300 flex items-center justify-between group relative h-auto",
                                                            formData.storageLocationId === loc.id
                                                                ? "bg-primary/5 border-primary text-primary shadow-sm"
                                                                : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2 truncate relative z-10 w-full">
                                                            <div className={cn("w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 transition-all duration-300",
                                                                formData.storageLocationId === loc.id ? "bg-primary/10" : "bg-slate-50 border border-slate-100/50"
                                                            )}>
                                                                <Warehouse className={cn("w-4 h-4", formData.storageLocationId === loc.id ? "text-primary" : "text-slate-400")} />
                                                            </div>
                                                            <div className="truncate text-left flex-1 min-w-0">
                                                                <div className="font-bold text-[11px] leading-tight truncate">{loc.name}</div>
                                                            </div>
                                                            {formData.storageLocationId === loc.id && (
                                                                <Check className="w-3 h-3 text-primary" strokeWidth={4} />
                                                            )}
                                                        </div>
                                                    </Button>
                                                ))}
                                                <AddStorageLocationDialog
                                                    users={users}
                                                    trigger={
                                                        <div className="p-2.5 rounded-[16px] border border-dashed border-slate-200 bg-slate-50/30 text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 flex items-center gap-2 h-[46px] group cursor-pointer">
                                                            <Plus className="w-3.5 h-3.5" />
                                                            <div className="font-black text-xs text-slate-400 group-hover:text-primary tracking-tight">Новый склад</div>
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
            </div>

            <div className="shrink-0">
                <StepFooter
                    onBack={onBack}
                    onNext={onNext}
                    nextLabel="Далее"
                    isNextDisabled={!formData.storageLocationId}
                    isSubmitting={isSubmitting}
                    validationError={validationError}
                />
            </div>
        </div>
    );
}
