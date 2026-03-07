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
    MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, StorageLocation, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { useBranding } from "@/components/branding-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddStorageLocationDialog } from "@/app/(main)/dashboard/warehouse/add-storage-location-dialog";
import { StepFooter } from "./step-footer";

interface StockStepProps {
    category: Category;
    storageLocations: StorageLocation[];
    users: { id: string; name: string; roleName?: string }[];
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

    const selectedUnit = formData.unit || "шт.";

    return (
        <div className="flex flex-col h-full !overflow-visible">
            <div className="flex-1 !overflow-visible min-h-0 flex flex-col custom-scrollbar pr-1 overflow-y-auto">
                <div className="space-y-3 flex flex-col w-full p-8 pb-12">

                    {/* ROW 1: Остатки и лимиты & Финансы */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1px_1fr] gap-3">
                        {/* LEFT COLUMN: ОСТАТКИ */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                                    <Package className="w-6 h-6 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Остатки и лимиты</h3>
                                    <p className="text-xs font-bold text-slate-700 opacity-60">Количество и уведомления</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                {/* Quantity */}
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                <Warehouse className="w-4 h-4 text-slate-500" />
                                            </div>
                                            <span className="text-sm font-black text-slate-700">Начальный остаток</span>
                                        </div>
                                        {/* Unit Selector */}
                                        <div className="flex items-center gap-1 bg-slate-100/50 p-0.5 rounded-lg border border-slate-200/50">
                                            {["шт.", "см", "м", "гр", "кг", "мл", "л"].map((u) => (
                                                <button
                                                    key={u}
                                                    type="button"
                                                    onClick={() => updateFormData({ unit: u })}
                                                    className={cn(
                                                        "px-2 py-0.5 rounded-md text-[11px] font-black transition-all",
                                                        formData.unit === u
                                                            ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                                                            : "text-slate-400 hover:text-slate-600"
                                                    )}
                                                >
                                                    {u.toLowerCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100/80 hover:border-slate-200 transition-colors rounded-[20px] p-1.5 flex items-center w-full">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => adjustValue('quantity', -1)}
                                            className="w-12 h-12 rounded-[14px] bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95 shrink-0 p-0"
                                        >
                                            <Minus className="w-5 h-5" strokeWidth={3} />
                                        </Button>

                                        <div className="flex-1 flex justify-center items-center gap-1.5">
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={formData.quantity}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                                    updateFormData({ quantity: val });
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0") updateFormData({ quantity: "" });
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") updateFormData({ quantity: "0" });
                                                }}
                                                className="w-auto text-center text-2xl font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 h-auto shadow-none px-2"
                                                style={{ width: `${Math.max(2, (formData.quantity || "0").toString().length) * 18}px`, minWidth: '40px' }}
                                            />
                                            <span className="text-[11px] font-black text-slate-400 mt-1 select-none">
                                                {selectedUnit}
                                            </span>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => adjustValue('quantity', 1)}
                                            className="w-12 h-12 rounded-[14px] bg-white shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all active:scale-95 shrink-0 p-0"
                                        >
                                            <Plus className="w-5 h-5" strokeWidth={3} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Thresholds */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2.5">
                                        <div className="flex flex-col px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    <Bell className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="text-sm font-black text-slate-700 truncate">Предупреждение</span>
                                            </div>
                                        </div>
                                        <div className="bg-amber-50 border border-amber-200/80 hover:border-amber-300 transition-colors rounded-[18px] px-5 py-3.5 flex items-center justify-between">
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={formData.lowStockThreshold}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                                    updateFormData({ lowStockThreshold: val });
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0" || e.target.value === "10") updateFormData({ lowStockThreshold: "" });
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") updateFormData({ lowStockThreshold: "10" });
                                                }}
                                                className="flex-1 text-xl font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 h-auto shadow-none px-1"
                                            />
                                            <span className="text-xs font-bold text-amber-500/70 ml-2 shrink-0">{selectedUnit}</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 px-1 leading-tight">Пришлем уведомление, когда остаток станет меньше этого числа</p>
                                    </div>

                                    <div className="space-y-2.5">
                                        <div className="flex flex-col px-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                                    <AlertTriangle className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <span className="text-sm font-black text-slate-700 truncate">Критический лимит</span>
                                            </div>
                                        </div>
                                        <div className="bg-rose-50 border border-rose-200/80 hover:border-rose-300 transition-colors rounded-[18px] px-5 py-3.5 flex items-center justify-between">
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={formData.criticalStockThreshold}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/[^0-9.]/g, '');
                                                    updateFormData({ criticalStockThreshold: val });
                                                }}
                                                onFocus={(e) => {
                                                    if (e.target.value === "0") updateFormData({ criticalStockThreshold: "" });
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value === "") updateFormData({ criticalStockThreshold: "0" });
                                                }}
                                                className="flex-1 text-xl font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 h-auto shadow-none px-1"
                                            />
                                            <span className="text-xs font-bold text-rose-500/70 ml-2 shrink-0">{selectedUnit}</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 px-1 leading-tight">Метка дефицита и повторные алерты при достижении порога</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* DIVIDER */}
                        <div className="hidden lg:block w-px bg-slate-200/80 self-stretch" />

                        {/* RIGHT COLUMN: ФИНАНСЫ */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200 text-white shrink-0">
                                    <Banknote className="w-6 h-6" strokeWidth={2} />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight">Финансы</h3>
                                    <p className="text-xs font-bold text-slate-700 opacity-60">Стоимость позиции</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                            <Tag className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="text-sm font-black text-slate-700">Себестоимость</span>
                                        <span className="text-rose-500 font-bold">*</span>
                                    </div>
                                    <div className="relative bg-slate-50 rounded-[18px] px-5 py-4 border border-slate-100/50 hover:border-slate-200 transition-colors w-full">
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            value={formData.costPrice}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                                updateFormData({ costPrice: val });
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") updateFormData({ costPrice: "" });
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") updateFormData({ costPrice: "0" });
                                            }}
                                            className="w-full text-2xl font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 pr-8 min-w-0 h-auto shadow-none px-1"
                                        />
                                        <span className="absolute right-5 bottom-4 text-sm font-bold text-slate-300">{currencySymbol}</span>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-baseline gap-2 px-1">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 self-center">
                                            <Banknote className="w-4 h-4 text-slate-500" />
                                        </div>
                                        <span className="text-sm font-black text-slate-700">Продажа</span>
                                        <span className="text-[11px] font-bold text-slate-400 ml-1 whitespace-nowrap leading-none">(Необязательно)</span>
                                    </div>
                                    <div className="relative bg-slate-50 rounded-[18px] px-5 py-4 border border-slate-100/50 hover:border-slate-200 transition-colors w-full">
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            value={formData.sellingPrice}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                                updateFormData({ sellingPrice: val });
                                            }}
                                            onFocus={(e) => {
                                                if (e.target.value === "0") updateFormData({ sellingPrice: "" });
                                            }}
                                            onBlur={(e) => {
                                                if (e.target.value === "") updateFormData({ sellingPrice: "0" });
                                            }}
                                            className="w-full text-2xl font-black text-slate-900 bg-transparent border-none focus-visible:ring-0 outline-none p-0 pr-8 min-w-0 h-auto shadow-none px-1"
                                        />
                                        <span className="absolute right-5 bottom-4 text-sm font-bold text-slate-300">{currencySymbol}</span>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>



                    {/* DIVIDER HORIZONTAL */}
                    <div className="h-px bg-slate-200/80 w-full my-4" />

                    {/* ROW 2: Размещение */}
                    <div className="flex flex-col gap-3 w-full mt-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                                <MapPin className="w-6 h-6 text-white" strokeWidth={2} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight">Размещение</h3>
                                <p className="text-xs font-bold text-slate-700 opacity-60">Склад</p>
                            </div>
                        </div>

                        <div className="flex flex-col grow">
                            {(storageLocations || []).length === 0 ? (
                                <div className="p-6 rounded-[22px] bg-amber-50 border border-amber-100 text-amber-600 text-sm font-bold flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 shrink-0" />
                                    Сначала настройте склад.
                                </div>
                            ) : (
                                <div className="max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {(storageLocations || []).map(loc => {
                                            const isSelected = formData.storageLocationId === loc.id;
                                            const typeColors = {
                                                warehouse: {
                                                    selected: "bg-indigo-50/30 border-indigo-200 shadow-sm",
                                                    icon: isSelected ? "bg-indigo-100/50 text-indigo-600" : "bg-slate-50 border border-slate-100/50 text-slate-400",
                                                    check: "text-indigo-500"
                                                },
                                                production: {
                                                    selected: "bg-amber-50/30 border-amber-200 shadow-sm",
                                                    icon: isSelected ? "bg-amber-100/50 text-amber-600" : "bg-slate-50 border border-slate-100/50 text-slate-400",
                                                    check: "text-amber-500"
                                                },
                                                office: {
                                                    selected: "bg-emerald-50/30 border-emerald-200 shadow-sm",
                                                    icon: isSelected ? "bg-emerald-100/50 text-emerald-600" : "bg-slate-50 border border-slate-100/50 text-slate-400",
                                                    check: "text-emerald-500"
                                                }
                                            };
                                            const currentType = (loc.type as keyof typeof typeColors) || "office";
                                            const styles = typeColors[currentType];

                                            return (
                                                <Button
                                                    key={loc.id}
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => updateFormData({ storageLocationId: loc.id })}
                                                    className={cn("p-4 rounded-xl sm:rounded-[22px] text-left border transition-all duration-300 flex items-center justify-between group relative h-auto",
                                                        isSelected ? styles.selected : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3 truncate relative z-10 w-full">
                                                        <div className={cn("w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-all duration-300", styles.icon)}>
                                                            <Warehouse className="w-5 h-5" />
                                                        </div>
                                                        <div className="truncate text-left flex-1 min-w-0">
                                                            <div className="font-bold text-[13px] leading-tight truncate text-slate-900">{loc.name}</div>
                                                            <div className={cn(
                                                                "inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-black mt-1 items-center gap-1",
                                                                loc.type === "warehouse" ? "bg-indigo-50/80 text-indigo-500" :
                                                                    loc.type === "production" ? "bg-amber-50/80 text-amber-600" :
                                                                        "bg-emerald-50/80 text-emerald-600"
                                                            )}>
                                                                {loc.type === "warehouse" ? "склад" :
                                                                    loc.type === "production" ? "производство" :
                                                                        "офис"}
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <Check className={cn("w-4 h-4", styles.check)} strokeWidth={4} />
                                                        )}
                                                    </div>
                                                </Button>
                                            );
                                        })}
                                        <AddStorageLocationDialog
                                            users={users}
                                            trigger={
                                                <div className="p-4 rounded-xl sm:rounded-[22px] border border-dashed border-slate-200 bg-slate-50/30 text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 flex items-center gap-3 h-[72px] group cursor-pointer">
                                                    <div className="w-10 h-10 rounded-[12px] border border-dashed border-slate-200 flex items-center justify-center shrink-0 group-hover:border-primary/50 transition-colors">
                                                        <Plus className="w-5 h-5" />
                                                    </div>
                                                    <div className="font-black text-sm text-slate-400 group-hover:text-primary tracking-tight">Новый склад</div>
                                                </div>
                                            }
                                        />
                                    </div>
                                </div>
                            )}
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
        </div >
    );
}
