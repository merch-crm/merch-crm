"use client";

import Link from "next/link";
import { ClipboardList, Settings2, Ruler, Wrench, Printer, Shirt, Scissors } from "lucide-react";
import { StepFooter } from "./step-footer";
import { AttributeSelector } from "@/app/(main)/dashboard/warehouse/attribute-selector";
import { Category, InventoryAttribute, AttributeType, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { Input } from "@/components/ui/input";
import { UnitSelect } from "@/components/ui/unit-select";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useBasicInfoLogic } from "./basic-info/hooks/useBasicInfoLogic";

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
    updateFormData: (updates: Partial<ItemFormData> | ((prev: ItemFormData) => Partial<ItemFormData>)) => void;
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


    const handleAttributeChange = (slug: string, typeName: string, code: string, _optionName: string) => {
        const normalizedSlug = slug.toLowerCase().trim();
        const normalizedTypeName = typeName.toLowerCase().trim();

        updateFormData((prev: ItemFormData) => {
            const currentAttrs = prev.attributes || {};

            // Determine which field to update (canonical slug)
            const effectiveSlug = (normalizedSlug === 'brand' || normalizedTypeName.includes('бренд')) ? 'brand' :
                (normalizedSlug === 'quality' || normalizedTypeName.includes('качество')) ? 'quality' :
                    (normalizedSlug === 'material' || normalizedTypeName.includes('материал')) ? 'material' :
                        (normalizedSlug === 'size' || normalizedTypeName.includes('размер')) ? 'size' :
                            (normalizedSlug === 'color' || normalizedTypeName.includes('цвет')) ? 'color' :
                                (normalizedSlug === 'unit' || normalizedTypeName.includes('единица измерения')) ? 'unit' : normalizedSlug;

            // Update both the specific field AND the attributes pool (by slug)
            const updates: Partial<ItemFormData> = {
                attributes: {
                    ...currentAttrs,
                    [slug]: code             // For getCodeForSlug to keep dropdown state
                }
            };

            if (effectiveSlug === 'brand') updates.brandCode = code;
            if (effectiveSlug === 'quality') updates.qualityCode = code;
            if (effectiveSlug === 'material') updates.materialCode = code;
            if (effectiveSlug === 'size') updates.sizeCode = code;
            if (effectiveSlug === 'color') updates.attributeCode = code;
            if (effectiveSlug === 'unit') updates.unit = code;

            return updates;
        });
    };

    return (
        <div className="flex flex-col h-full min-h-0 !overflow-visible">
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar mr-[8px]">
                <div className="flex flex-col min-h-full pb-10 pl-[var(--radius-padding)] pr-[8px] pt-[var(--radius-padding)]">

                    {/* Preview Header Block (Styled Reference) */}
                    <div className="relative mb-6 rounded-[12px] md:rounded-[16px] bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_4px_-1px_rgba(0,0,0,0.02)] border border-slate-200/60 transition-all overflow-hidden">
                        {/* Subtle Top Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500" />

                        <div className="p-5 md:p-6 flex flex-col xl:flex-row xl:items-start justify-between gap-3">
                            {/* Left Column: Title & SKU */}
                            <div className="flex flex-col gap-2 xl:w-[45%] shrink-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-violet-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                    </div>
                                    <div className="text-xs font-black text-slate-400/90 tracking-[0.05em] leading-none">
                                        Превью позиции
                                    </div>
                                </div>
                                <div className="text-lg md:text-[22px] font-black text-slate-900 leading-[1.2] tracking-tight">
                                    {formData.itemName || <span className="text-slate-300 italic text-lg font-bold">Название позиции...</span>}
                                </div>
                                <div className="inline-flex self-start mt-0.5">
                                    <div className="text-xs font-mono font-bold text-indigo-500/90 tracking-wider break-all bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                                        {formData.sku || "—"}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Chips Grid */}
                            <div className="flex flex-wrap flex-1 gap-2 xl:justify-end items-start content-start pt-1">
                                {(() => {
                                    const filteredEntries = Object.entries(formData.attributes || {}).map(([key, value]) => {
                                        if (!value || typeof value !== 'string') return null;
                                        if (/^[a-f0-9-]{36}$/.test(value) || /^[a-f0-9-]{36}$/.test(key)) return null;

                                        // Resolve Type
                                        const type = attributeTypes?.find(t => t.slug === key);
                                        if (!type) return null; // Only show attributes that have a corresponding type

                                        // Resolve Value Name
                                        const attr = dynamicAttributes?.find(a => a.type === key && a.value === value);
                                        const displayValue = attr?.name || value;

                                        return {
                                            label: type.name,
                                            displayValue,
                                            slug: key,
                                            sortOrder: type.sortOrder || 0,
                                            showInName: type.showInName !== false
                                        };
                                    }).filter((chip): chip is NonNullable<typeof chip> => {
                                        if (!chip) return false;
                                        if (!chip.showInName) return false;

                                        const lowerSlug = chip.slug.toLowerCase();
                                        if (lowerSlug.endsWith('code')) return false;
                                        if (["unit", "thumbnailsettings"].includes(lowerSlug)) return false;

                                        return true;
                                    }).sort((a, b) => a.sortOrder - b.sortOrder);

                                    if (filteredEntries.length === 0) {
                                        return (
                                            <div className="flex gap-2 opacity-50">
                                                {[70, 90, 60, 80].map((w, i) => (
                                                    <div key={i} className="h-[28px] rounded-[10px] bg-slate-100 animate-pulse" style={{ width: `${w}px` }} />
                                                ))}
                                            </div>
                                        );
                                    }

                                    return filteredEntries.map((chip) => (
                                        <div
                                            key={chip.slug}
                                            className="inline-flex items-baseline gap-1.5 bg-white border border-slate-200/80 rounded-[10px] sm:rounded-[12px] px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] transition-all"
                                        >
                                            <span className="text-xs font-black text-slate-400/80 tracking-wide">{chip.label}</span>
                                            <span className="text-xs sm:text-[13px] font-bold text-slate-800">{chip.displayValue}</span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                                <ClipboardList className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Основная информация</h2>
                                <p className="text-xs font-bold text-slate-700 opacity-60 mt-1">Заполните ключевые характеристики вашей позиции</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col pt-2 min-h-0">
                        <div className="flex-1 flex flex-col gap-3">



                            <div>
                                {categoryAttributes.length > 0 ? (
                                    <div className="crm-card bg-white shadow-sm border-slate-100 rounded-[20px] p-6 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-3 grid-flow-row-dense">
                                            {/* Unified Unit Select - Only show if not already in category attributes map to avoid duplicates */}
                                            {(!categoryAttributes.some(a => a.slug === 'unit' || a.name.toLowerCase().includes('единица измерения'))) && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-slate-900 ml-1">Единица измерения</label>
                                                    <UnitSelect
                                                        options={measurementUnits}
                                                        value={formData.unit || "шт."}
                                                        onChange={(val) => updateFormData({ unit: val })}
                                                    />
                                                </div>
                                            )}
                                            {categoryAttributes.map((attr) => {
                                                const isFullWidth = attr.dataType === 'color';
                                                return (
                                                    <div key={attr.id} className={cn(isFullWidth && "md:col-span-2")}>
                                                        <AttributeSelector
                                                            type={attr.slug}
                                                            label={attr.name}
                                                            value={(getCodeForSlug(attr.slug, attr.name) as string) || ""}
                                                            onChange={(optionName, code) => handleAttributeChange(attr.slug, attr.name, code, optionName)}
                                                            categoryId={attr.categoryId || category.id}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    !isClothing && (
                                        <div className="flex-1 flex items-center justify-center py-10">
                                            <div className="crm-card bg-white shadow-sm border-slate-100 rounded-[24px] p-10 flex flex-col items-center text-center space-y-3 overflow-hidden relative group max-w-2xl w-full">
                                                <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="relative w-24 h-24 flex items-center justify-center">
                                                    <div className="absolute inset-0 bg-indigo-50 rounded-[32px] rotate-6 group-hover:rotate-12 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-white border border-indigo-100 rounded-[32px] shadow-sm transform group-hover:scale-105 transition-transform duration-500" />
                                                    <Settings2 className="w-10 h-10 text-indigo-500 relative transform group-hover:-rotate-12 transition-transform duration-500" />
                                                </div>

                                                <div className="relative space-y-2 max-w-sm">
                                                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">Характеристики еще не заданы</h4>
                                                    <p className="text-sm font-medium text-slate-500 leading-relaxed px-4">
                                                        Для этой категории пока не настроены дополнительные поля.
                                                        Вы можете добавить их в настройках, чтобы сделать описание позиций более детальным.
                                                    </p>
                                                </div>

                                                <Link
                                                    href="/dashboard/warehouse/characteristics"
                                                    className="relative flex items-center gap-2 px-6 h-12 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm shadow-sm hover:border-slate-400 hover:bg-slate-50 transition-all active:scale-95"
                                                >
                                                    <Settings2 className="w-4 h-4" />
                                                    Настроить характеристики
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* Дополнительно */}
                            {(isPackaging || isConsumables) && (
                                <div className="crm-card bg-white shadow-sm border-slate-100 rounded-[20px] p-6 space-y-3">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-white shrink-0">
                                            {isPackaging ? <Ruler className="w-5 h-5 stroke-[2.5]" /> : <Wrench className="w-5 h-5 stroke-[2.5]" />}
                                        </div>
                                        <div>
                                            <h4 className="text-[17px] font-bold text-slate-900 leading-tight">Технические параметры</h4>
                                            <p className="text-xs font-medium text-slate-500 mt-0.5">Размеры и назначение</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {isPackaging && (
                                            <div className="grid grid-cols-3 gap-3">
                                                {['width', 'height', 'depth'].map(dim => (
                                                    <div key={dim} className="space-y-2">
                                                        <label className="text-[13px] font-bold text-slate-500 ml-1">
                                                            {dim === 'width' ? 'Ширина' : dim === 'height' ? 'Высота' : 'Глубина'}
                                                        </label>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                value={(formData[dim as keyof ItemFormData] as string) || ""}
                                                                onChange={(e) => updateFormData({ [dim]: e.target.value })}
                                                                className="w-full h-11 px-4 pr-10 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-bold focus-visible:border-slate-300 transition-all shadow-none"
                                                                placeholder="0"
                                                            />
                                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 pointer-events-none">СМ</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {isConsumables && (
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-bold text-slate-500 ml-1">Область применения</label>
                                                <Select
                                                    options={[
                                                        { id: "printing", title: "Печатный цех", icon: <Printer className="w-4 h-4 opacity-50" /> },
                                                        { id: "embroidery", title: "Вышивальный цех", icon: <Shirt className="w-4 h-4 opacity-50" /> },
                                                        { id: "sewing", title: "Швейный цех", icon: <Scissors className="w-4 h-4 opacity-50" /> },
                                                    ]}
                                                    value={formData.department || ""}
                                                    onChange={(val) => updateFormData({ department: val })}
                                                    placeholder="Выберите отдел..."
                                                    className="h-12 rounded-2xl border-slate-100 bg-slate-50/50"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto shrink-0">
                <StepFooter
                    onBack={onBack}
                    onNext={onNext}
                    validationError={validationError}
                />
            </div>
        </div>
    );
}
