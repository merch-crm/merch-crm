"use client";

import { useState } from "react";
import { CheckCircle2, Info, Pencil, Check, Shirt, Tag, Star, Layers, Ruler, Component, Banknote, AlertCircle, Package, Warehouse } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Category, ItemFormData, StorageLocation, InventoryAttribute, AttributeType } from "../../../types";
import { StepFooter } from "./step-footer";
import { getCategoryIcon, getColorStyles, CLOTHING_COLORS } from "../../../category-utils";
import { createElement } from "react";



interface SummaryStepProps {
    category: Category;
    subCategories: Category[];
    storageLocations: StorageLocation[];
    dynamicAttributes: InventoryAttribute[];
    attributeTypes: AttributeType[];
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onSubmit: () => void;
    onBack: () => void;
    validationError: string;
    isSubmitting: boolean;
}

export function SummaryStep({
    category,
    subCategories,
    storageLocations,
    dynamicAttributes,
    // attributeTypes, // unused
    formData,
    updateFormData,
    onSubmit,
    onBack,
    validationError,
    isSubmitting
}: SummaryStepProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const sub = subCategories.find(s => s.id === formData.subcategoryId);
    const location = storageLocations.find(l => l.id === formData.storageLocationId);

    // ThumbSettings type definition was unused after we stopped using thumbSettings for logic here, so we remove the variable
    // const thumbSettings = (formData.thumbSettings as ThumbSettings) || { zoom: 1, x: 0, y: 0 };

    const getAttrName = (type: string, value: string) => {
        const attr = dynamicAttributes.find(a => a.type === type && a.value === value);
        return attr ? attr.name : value;
    };

    // Find selected color for dynamic background
    const selectedColor = CLOTHING_COLORS.find(c => c.code === formData.attributeCode);
    const accentColor = selectedColor?.hex;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 px-10 pt-10 pb-0 overflow-y-auto min-h-0 custom-scrollbar">
                <div className="max-w-[1400px] mx-auto space-y-4 pb-10">
                    {/* Header */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Проверка данных</h2>
                            <p className="text-[10px] font-bold text-slate-500 opacity-60">Убедитесь, что вся информация указана верно перед созданием</p>
                        </div>
                    </div>

                    {/* Light Feedback / Name Banner */}
                    <div
                        className="p-8 rounded-[24px] text-slate-900 shadow-sm border relative overflow-hidden group shrink-0 transition-all duration-500"
                        style={{
                            backgroundColor: accentColor ? `${accentColor}08` : '#f8fafc', // Very subtle tint
                            borderColor: accentColor ? `${accentColor}20` : '#e2e8f0'
                        }}
                    >
                        {/* Dynamic background gradient blob */}
                        {accentColor ? (
                            <div
                                className="absolute -right-20 -top-20 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none transition-all duration-700 opacity-15"
                                style={{ backgroundColor: accentColor }}
                            />
                        ) : (
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white rounded-full blur-3xl pointer-events-none opacity-60" />
                        )}

                        <div className="relative z-10 flex items-center justify-between gap-8">
                            <div className="space-y-2 flex-1">
                                <label className="text-[10px] font-bold text-slate-500 ml-1 leading-none uppercase tracking-wider opacity-70">
                                    Подтвердите финальное название
                                </label>
                                <div className="flex items-center gap-4 group/name relative">
                                    {isEditingName ? (
                                        <div className="w-full flex items-center bg-white -mx-4 rounded-[var(--radius)] border border-slate-200 transition-all focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100 pr-2 shadow-sm">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={formData.itemName}
                                                onChange={(e) => updateFormData({ itemName: e.target.value })}
                                                onBlur={() => setIsEditingName(false)}
                                                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                                                className="w-full bg-transparent px-4 py-2 text-slate-900 font-bold text-3xl focus:ring-0 placeholder:text-slate-300 outline-none"
                                            />
                                            <button
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => setIsEditingName(false)}
                                                className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-900 hover:bg-emerald-500 hover:text-white transition-all shrink-0 active:scale-95"
                                            >
                                                <Check className="w-5 h-5" strokeWidth={3} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setIsEditingName(true)}
                                            className="flex items-center gap-4 cursor-pointer hover:opacity-70 transition-all"
                                        >
                                            <h3 className="text-3xl font-black text-slate-900 leading-tight">
                                                {formData.itemName || 'Без названия'}
                                            </h3>
                                            <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center transition-all hover:border-slate-400 hover:shadow-md shadow-sm text-slate-400 hover:text-slate-900">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {formData.sku && (
                                    <div className="text-[11px] font-bold text-slate-500 -mt-1 opacity-80 font-mono bg-slate-200/50 px-2 py-0.5 rounded w-fit">
                                        {formData.sku}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-white w-fit px-4 py-2 rounded-full border border-slate-200 shadow-sm mt-3">
                                    <Info className="w-3.5 h-3.5 text-slate-400" />
                                    Это название будет отображаться во всех складах, отчетах и на этикетках
                                </div>
                            </div>
                            <div className="w-36 h-36 rounded-[28px] bg-white p-1 border border-slate-200 shrink-0 shadow-sm relative transition-all duration-700 group-hover:scale-105 group-hover:rotate-1 group-hover:shadow-md">
                                {formData.imagePreview ? (
                                    <Image
                                        src={formData.imagePreview}
                                        alt=""
                                        fill
                                        className="object-cover rounded-[24px]"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Shirt className="w-12 h-12 text-slate-900" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                        <div className="lg:col-span-8 flex">
                            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex-1">
                                <div className="mb-6">
                                    <h4 className="text-xl font-bold text-slate-900">Характеристики</h4>
                                    <p className="text-[10px] font-bold text-slate-500 opacity-60 mt-1">Основные параметры позиции</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Category */}
                                    <div className="col-span-2 p-4 rounded-[20px] bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:border-slate-200 transition-all">
                                        <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center border shadow-sm transition-transform group-hover:scale-105", getColorStyles(category.color))}>
                                            {createElement(getCategoryIcon(category), { className: "w-6 h-6", strokeWidth: 2.5 })}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Категория</div>
                                            <div className="text-lg font-bold text-slate-900 leading-none">{category.name}</div>
                                        </div>
                                    </div>

                                    {/* Subcategory */}
                                    <div className="col-span-1 p-4 rounded-[20px] bg-slate-50 border border-slate-100 flex flex-col justify-center gap-1 group hover:border-slate-200 transition-all relative overflow-hidden">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Подкатегория</div>
                                        <div className="text-lg font-bold text-slate-900 z-10">{sub?.name || "—"}</div>
                                        {createElement(getCategoryIcon(sub || category), { className: "absolute -right-2 -bottom-2 w-16 h-16 text-slate-200/50 rotate-12 pointer-events-none" })}
                                    </div>

                                    {/* Attributes Cards */}
                                    <div className="p-4 rounded-[20px] bg-slate-50 border border-slate-100 flex flex-col gap-3 group hover:border-slate-200 transition-all relative overflow-hidden">
                                        <div className="flex items-center justify-between z-10">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Бренд</span>
                                            <Tag className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                        <div className="text-base font-bold text-slate-900 z-10 truncate">{formData.brandCode ? getAttrName("brand", formData.brandCode) : "—"}</div>
                                    </div>

                                    <div className="p-4 rounded-[20px] bg-slate-50 border border-slate-100 flex flex-col gap-3 group hover:border-slate-200 transition-all relative overflow-hidden">
                                        <div className="flex items-center justify-between z-10">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Качество</span>
                                            <Star className="w-4 h-4 text-slate-300 group-hover:text-amber-400 transition-colors" />
                                        </div>
                                        <div className="text-base font-bold text-slate-900 z-10 truncate">{formData.qualityCode ? getAttrName("quality", formData.qualityCode) : "—"}</div>
                                    </div>

                                    <div className="p-4 rounded-[20px] bg-slate-50 border border-slate-100 flex flex-col gap-3 group hover:border-slate-200 transition-all relative overflow-hidden">
                                        <div className="flex items-center justify-between z-10">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Материал</span>
                                            <Layers className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                        </div>
                                        <div className="text-base font-bold text-slate-900 z-10 truncate">{formData.materialCode ? getAttrName("material", formData.materialCode) : "—"}</div>
                                    </div>

                                    <div className="p-4 rounded-[20px] bg-slate-50 border border-slate-100 flex flex-col gap-3 group hover:border-slate-200 transition-all relative overflow-hidden">
                                        <div className="flex items-center justify-between z-10">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Цвет</span>
                                            <div className="w-3 h-3 rounded-full shadow-sm ring-1 ring-slate-100" style={{ backgroundColor: accentColor || '#cbd5e1' }} />
                                        </div>
                                        <div className="text-base font-bold text-slate-900 z-10 truncate">{formData.attributeCode ? getAttrName("color", formData.attributeCode) : "—"}</div>
                                        {accentColor && <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundColor: accentColor }} />}
                                    </div>

                                    <div className="p-4 rounded-[20px] bg-slate-50 border border-slate-100 flex flex-col gap-3 group hover:border-slate-200 transition-all relative overflow-hidden">
                                        <div className="flex items-center justify-between z-10">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Размер</span>
                                            <Ruler className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
                                        </div>
                                        <div className="text-base font-bold text-slate-900 z-10 truncate">{formData.sizeCode ? getAttrName("size", formData.sizeCode) : "—"}</div>
                                    </div>

                                </div>

                                {formData.description && (
                                    <div className="mt-4 p-5 rounded-[20px] bg-slate-50 border border-slate-100 relative overflow-hidden group hover:border-slate-200 transition-all">
                                        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <Info className="w-3 h-3" />
                                            Описание
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                                            &quot;{formData.description}&quot;
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Inventory + Finance */}
                        <div className="lg:col-span-4 flex">
                            <div className="bg-white rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all duration-300 text-slate-900 border border-slate-200 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h4 className="text-xl font-bold text-slate-900">Склад и финансы</h4>
                                    <p className="text-[10px] font-bold text-slate-500 opacity-60 mt-1">Остатки и стоимость</p>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    {/* Main content wrapper */}
                                    <div className="flex-1 flex flex-col justify-between gap-3">
                                        {/* Warehouse - full width */}
                                        <div className="p-4 rounded-[16px] bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:border-slate-200 transition-all">
                                            <div className="w-10 h-10 rounded-[12px] bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-500 transition-all">
                                                <Warehouse className="w-5 h-5" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Склад</div>
                                                <div className="text-base font-bold text-slate-900 leading-none">{location?.name || "—"}</div>
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="p-4 rounded-[16px] bg-emerald-50/50 border border-emerald-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                                            <div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Остаток</div>
                                                <div className="text-xl font-black text-emerald-500 leading-none">
                                                    {formData.quantity}<span className="text-xs text-slate-400 font-bold opacity-60 ml-0.5">{formData.unit}</span>
                                                </div>
                                            </div>
                                            <Package className="w-5 h-5 text-emerald-400" />
                                        </div>

                                        {/* Finance Row */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-4 rounded-[16px] bg-slate-50 border border-slate-100 group hover:border-slate-200 transition-all">
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Себестоимость</div>
                                                <div className="text-base font-bold text-slate-900 leading-none">
                                                    {formData.costPrice}<span className="text-xs text-slate-400 ml-0.5">₽</span>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-[16px] bg-indigo-50/50 border border-indigo-100 group hover:border-indigo-200 transition-all">
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Продажа</div>
                                                <div className="text-base font-bold text-indigo-500 leading-none">
                                                    {formData.sellingPrice}<span className="text-xs text-indigo-300 ml-0.5">₽</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thresholds - pushed to bottom */}
                                    <div className="mt-auto pt-3 grid grid-cols-2 gap-3">
                                        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                                <AlertCircle className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Мин.</div>
                                                <div className="text-xs font-bold text-slate-900">{formData.lowStockThreshold} {formData.unit}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                            <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                                <AlertCircle className="w-3 h-3" />
                                            </div>
                                            <div>
                                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Крит.</div>
                                                <div className="text-xs font-bold text-slate-900">{formData.criticalStockThreshold} {formData.unit}</div>
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
                isSubmitting={isSubmitting}
                validationError={validationError}
                nextIcon={<CheckCircle2 className="w-5 h-5 text-white" />}
                className="bg-white/80 backdrop-blur-md border-t border-slate-200"
            />
        </div>
    );
}
