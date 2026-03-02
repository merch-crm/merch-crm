"use client";

import { createElement } from "react";
import Link from "next/link";
import { ClipboardList, Settings2, Package, Hash, Ruler, Wrench, Printer, Shirt, Scissors } from "lucide-react";
import { StepFooter } from "./step-footer";
import { AttributeSelector } from "@/app/(main)/dashboard/warehouse/attribute-selector";
import { Category, InventoryAttribute, AttributeType, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { getCategoryIcon, getCategoryCardStyles } from "@/app/(main)/dashboard/warehouse/category-utils";
import { Input } from "@/components/ui/input";
import { UnitSelect } from "@/components/ui/unit-select";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useBasicInfoLogic } from "./basic-info/hooks/useBasicInfoLogic";
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
        categoryAttributes,
        getCodeForSlug
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

    const handleAttributeChange = (slug: string, name: string, code: string) => {
        if (["brand", "quality", "material", "size", "color"].includes(slug)) {
            // These have explicit state fields and duplicate into `attributes` for the final payload
            const currentAttrs = formData.attributes || {};
            // Resolve the label for the static dictionary
            const attrLabel = slug === 'brand' ? 'Бренд' :
                slug === 'quality' ? 'Качество' :
                    slug === 'material' ? 'Материал' :
                        slug === 'size' ? 'Размер' :
                            slug === 'color' ? 'Цвет' : name;

            const updates: Partial<ItemFormData> = { attributes: { ...currentAttrs, [attrLabel]: name } };
            if (slug === 'brand') updates.brandCode = code;
            if (slug === 'quality') updates.qualityCode = code;
            if (slug === 'material') updates.materialCode = code;
            if (slug === 'size') updates.sizeCode = code;
            if (slug === 'color') updates.attributeCode = code;

            updateFormData(updates);
        } else {
            // Generic dynamic attributes
            const currentAttrs = formData.attributes || {};
            updateFormData({
                attributes: { ...currentAttrs, [slug]: code }
            });
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                <div className="space-y-4">

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
                                <div
                                    className="w-8 h-8 xl:w-10 xl:h-10 rounded-[var(--radius)] flex items-center justify-center shadow-sm shrink-0 text-white"
                                    style={getCategoryCardStyles(displayCategory.color).icon}
                                >
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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-8 flex flex-col gap-4">

                            {/* Non-clothing basic manual fields */}
                            {!isClothing && (
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 ml-1 leading-none">
                                            <Package className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
                                            Название позиции <span className="text-rose-500">*</span>
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.itemName}
                                            onChange={(e) => updateFormData({ itemName: e.target.value })}
                                            placeholder="Например: Коробка картонная 40x40"
                                            className="w-full h-12 px-5 rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-bold text-base focus-visible:border-slate-900 focus-visible:ring-4 focus-visible:ring-slate-900/5 transition-all shadow-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700 ml-1 leading-none">
                                                <Hash className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
                                                Артикул: <span className="text-rose-500">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => updateFormData({ sku: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') })}
                                                placeholder="SKU-123"
                                                className="w-full h-11 px-5 rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-bold text-sm focus-visible:border-slate-900 transition-all font-mono shadow-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700 ml-1 leading-none">
                                                <Ruler className="w-3.5 h-3.5 inline mr-2 -mt-0.5" />
                                                Единица измерения <span className="text-rose-500">*</span>
                                            </label>
                                            <UnitSelect
                                                name="unit"
                                                value={isPackaging ? "шт." : (formData.unit || "шт.")}
                                                onChange={(val) => updateFormData({ unit: val })}
                                                options={measurementUnits.map(u => ({ id: u.id, name: u.name.toUpperCase() }))}
                                                disabled={isPackaging}
                                            />
                                        </div>
                                    </div>
                                    {categoryAttributes.length > 0 && <div className="h-px bg-slate-100 my-2" />}
                                </div>
                            )}

                            {/* Dynamic Characteristics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
                                {categoryAttributes.map((attr) => {
                                    const isFullWidth = attr.dataType === 'composition' || attr.dataType === 'color' || attr.slug === 'department';
                                    return (
                                        <div key={attr.id} className={cn(isFullWidth && "md:col-span-2")}>
                                            <AttributeSelector
                                                type={attr.slug}
                                                label={attr.name}
                                                value={(getCodeForSlug(attr.slug) as string) || ""}
                                                required={true}
                                                onChange={(name, code) => handleAttributeChange(attr.slug, name, code)}
                                                categoryId={category.id}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Additional Info for non-clothing */}
                            {(isPackaging || isConsumables) && (
                                <div className="mt-4 p-6 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-2">
                                    <div className="mb-2">
                                        <h4 className="text-base font-bold text-slate-900">Дополнительно</h4>
                                        <p className="text-xs font-bold text-slate-700 opacity-60 mt-1">Параметры и размеры</p>
                                    </div>

                                    {isPackaging && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {['width', 'height', 'depth'].map(dim => (
                                                <div key={dim} className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-700 px-1">
                                                        {dim === 'width' ? 'Ширина' : dim === 'height' ? 'Высота' : 'Глубина'}
                                                    </label>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            value={(formData[dim as keyof ItemFormData] as string) || ""}
                                                            onChange={(e) => updateFormData({ [dim]: e.target.value })}
                                                            className="w-full h-11 px-4 pr-10 rounded-[var(--radius)] border border-slate-200 bg-white text-sm font-bold focus-visible:border-amber-500 transition-all shadow-none"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300 pointer-events-none">СМ</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {isConsumables && (
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700 ml-1">
                                                <Wrench className="w-3.5 h-3.5" />
                                                Область применения
                                            </label>
                                            <Select
                                                options={[
                                                    { id: "printing", title: "Печатный цех", icon: <Printer className="w-4 h-4 opacity-50" /> },
                                                    { id: "embroidery", title: "Вышивальный цех", icon: <Shirt className="w-4 h-4 opacity-50" /> },
                                                    { id: "sewing", title: "Швейный цех", icon: <Scissors className="w-4 h-4 opacity-50" /> },
                                                ]}
                                                value={formData.department || ""}
                                                onChange={(val) => updateFormData({ department: val })}
                                                placeholder="Выберите отдел..."
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description Block */}
                            <div className="space-y-2 pt-2">
                                <div className="mb-2">
                                    <h4 className="text-base font-bold text-slate-900">Описание</h4>
                                </div>
                                <textarea
                                    value={formData.description || ""}
                                    onChange={(e) => updateFormData({ description: e.target.value })}
                                    className="w-full p-5 min-h-[120px] rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-medium text-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none shadow-sm hover:shadow-md overflow-y-auto custom-scrollbar"
                                    placeholder={isClothing ? "Особенности кроя, советы по уходу..." : "Особенности материала, советы по использованию..."}
                                />
                            </div>

                        </div>

                        {/* RIGHT COLUMN (Preview Card) */}
                        <div className="lg:col-span-4 mt-8 lg:mt-0">
                            <div className="sticky top-6">
                                <PreviewCard
                                    itemName={formData.itemName || ""}
                                    sku={formData.sku || ""}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-breakout card-breakout-bottom mt-auto">
                <StepFooter
                    onBack={onBack}
                    onNext={onNext}
                    validationError={validationError}
                />
            </div>
        </div>
    );
}
