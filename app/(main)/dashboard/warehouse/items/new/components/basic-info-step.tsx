"use client";

import { createElement } from "react";
import Link from "next/link";
import { ClipboardList, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepFooter } from "./step-footer";
import { AttributeSelector } from "@/app/(main)/dashboard/warehouse/attribute-selector";
import { Category, InventoryAttribute, AttributeType, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { getCategoryIcon, getColorStyles } from "@/app/(main)/dashboard/warehouse/category-utils";

import { useBasicInfoLogic } from "./basic-info/hooks/useBasicInfoLogic";
import { ClothingFields } from "./basic-info/clothing-fields";
import { NonClothingFields } from "./basic-info/non-clothing-fields";
import { PreviewCard } from "./basic-info/preview-card";

interface MeasurementUnit {
    id: string;
    name: string;
}

interface BasicInfoStepProps {
    category: Category;
    subCategories: Category[];
    measurementUnits: MeasurementUnit[];
    dynamicAttributes: InventoryAttribute[];
    attributeTypes: AttributeType[];
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onNext: () => void;
    onBack: () => void;
    validationError: string;
}

export function BasicInfoStep({
    category,
    subCategories,
    formData,
    updateFormData,
    onNext,
    onBack,
    validationError,
    dynamicAttributes,
    attributeTypes = [],
    measurementUnits
}: BasicInfoStepProps) {

    const {
        isClothing,
        isPackaging,
        isConsumables,
        compositionType,
        remainingCustomTypes
    } = useBasicInfoLogic({
        category,
        subCategories,
        formData,
        updateFormData,
        attributeTypes,
        dynamicAttributes
    });

    const activeSubCategory = subCategories.find(s => s.id === formData.subcategoryId);
    const displayCategory = activeSubCategory || category;

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 px-4 sm:px-10 pt-6 sm:pt-10 pb-6 sm:pb-10 overflow-y-auto min-h-0">
                <div className="max-w-6xl mx-auto space-y-4">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                                <ClipboardList className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 ">Основная информация</h2>
                                <p className="text-xs font-bold text-slate-700 opacity-60 mt-1">Заполните ключевые характеристики вашей позиции</p>
                            </div>
                        </div>

                        <div className="hidden sm:flex items-center gap-2 xl:gap-3">
                            <div className="flex items-center gap-2 xl:gap-3 bg-slate-50 px-2.5 py-1.5 xl:px-4 xl:py-2 rounded-[var(--radius)] border border-slate-200/50 shadow-sm">
                                <div className={cn("w-8 h-8 xl:w-10 xl:h-10 rounded-[var(--radius)] flex items-center justify-center border shadow-sm shrink-0", getColorStyles(displayCategory.color))}>
                                    {createElement(getCategoryIcon(displayCategory), { className: "w-4 h-4 xl:w-5 xl:h-5" })}
                                </div>
                                <div className="text-left">
                                    <div className="text-xs xl:text-xs font-bold text-slate-700 leading-none mb-0.5 xl:mb-1">{category.name}</div>
                                    <div className="text-xs xl:text-sm font-bold text-slate-900 leading-none">{activeSubCategory ? activeSubCategory.name : "Общая"}</div>
                                </div>
                            </div>

                            <Link
                                href="/dashboard/warehouse/characteristics"
                                className="flex items-center gap-2 xl:gap-3 bg-slate-50 px-2.5 py-1.5 xl:px-4 xl:py-2 rounded-[var(--radius)] border border-slate-200/50 shadow-sm hover:bg-slate-100/50 transition-all active:scale-95 group"
                            >
                                <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-[var(--radius)] bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-slate-900 transition-colors">
                                    <Settings2 className="w-4 h-4 xl:w-5 xl:h-5 text-slate-400 group-hover:text-slate-900" />
                                </div>
                                <div className="text-left pr-1 xl:pr-2">
                                    <div className="text-xs xl:text-xs font-bold text-slate-700 leading-none mb-0.5 xl:mb-1 hidden xl:block">Перейти в</div>
                                    <div className="text-xs xl:text-sm font-bold text-slate-900 leading-none whitespace-nowrap line-height-tight">Характеристики</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {isClothing ? (
                        <>
                            {/* Row 1: Clothing Attributes & Preview */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                                <div className="lg:col-span-8">
                                    <ClothingFields
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        compositionType={compositionType}
                                        remainingCustomTypes={remainingCustomTypes}
                                    />
                                </div>

                                <div className="lg:col-span-4">
                                    <div className="sticky top-6">
                                        <PreviewCard
                                            itemName={formData.itemName || ""}
                                            sku={formData.sku || ""}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Color & Description */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                                <div className="lg:col-span-8">
                                    <AttributeSelector
                                        type="color"
                                        value={formData.attributeCode || ""}
                                        required={true}
                                        onChange={(name, code) => {
                                            const currentAttrs = formData.attributes || {};
                                            updateFormData({
                                                attributeCode: code,
                                                attributes: { ...currentAttrs, "Цвет": name }
                                            });
                                        }}
                                        onCodeChange={(code) => updateFormData({ attributeCode: code })}
                                        allowCustom={true}
                                    />
                                </div>
                                <div className="lg:col-span-4">
                                    <div className="space-y-2 h-full flex flex-col">
                                        <div className="mb-2">
                                            <h4 className="text-base font-bold text-slate-900">Описание</h4>
                                        </div>
                                        <textarea
                                            value={formData.description || ""}
                                            onChange={(e) => updateFormData({ description: e.target.value })}
                                            className="w-full flex-1 p-5 min-h-[120px] rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-medium text-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none shadow-sm hover:shadow-md overflow-y-auto custom-scrollbar"
                                            placeholder="Особенности кроя, советы по уходу..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Row 1: Non-clothing fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                                <div className="lg:col-span-8">
                                    <NonClothingFields
                                        formData={formData}
                                        updateFormData={updateFormData}
                                        isPackaging={isPackaging}
                                        isConsumables={isConsumables}
                                        measurementUnits={measurementUnits}
                                        remainingCustomTypes={remainingCustomTypes}
                                    />
                                </div>
                                <div className="lg:col-span-4" />
                            </div>

                            {/* Row 2: Non-clothing Description */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-3">
                                <div className="lg:col-span-8">
                                    <div className="space-y-2">
                                        <div className="mb-2">
                                            <h4 className="text-base font-bold text-slate-900">Описание</h4>
                                        </div>
                                        <textarea
                                            value={formData.description || ""}
                                            onChange={(e) => updateFormData({ description: e.target.value })}
                                            className="w-full h-[120px] p-5 rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-medium text-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none shadow-sm hover:shadow-md overflow-y-auto custom-scrollbar"
                                            placeholder="Особенности материала, советы по использованию..."
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-4" />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <StepFooter
                onBack={onBack}
                onNext={onNext}
                validationError={validationError}
            />
        </div>
    );
}
