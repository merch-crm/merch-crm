"use client";

import Link from "next/link";
import { ClipboardList, Settings2, Ruler, Wrench, Printer, Shirt, Scissors } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { StepFooter } from "./step-footer";
import { AttributeSelector } from "@/app/(main)/dashboard/warehouse/attribute-selector";
import { Category, InventoryAttribute, AttributeType, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useBasicInfoLogic } from "./basic-info/hooks/useBasicInfoLogic";


interface BasicInfoStepProps {
    category: Category;
    subCategories: Category[];
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
            <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
                <div className="flex flex-col min-h-full pb-10 pl-8 pr-[26px] pt-10">

                    {/* Preview Header Block (Split Utility Variant) */}
                    <div className="relative mb-6 bg-white rounded-[24px] p-6 lg:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-stretch gap-3 group hover:border-indigo-100 transition-colors">
                        <div className="absolute top-6 left-6 lg:top-7 lg:left-7 flex items-center gap-2">
                            <div className="relative flex items-center justify-center w-4 h-4 rounded-full bg-indigo-50">
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 rounded-full bg-indigo-400"
                                />
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            </div>
                            <span className="text-xs font-bold text-indigo-600/80 tracking-wider">Превью</span>
                        </div>

                        <div className="md:w-[55%] pt-8 flex flex-col justify-center gap-2">
                            <div className="text-[20px] lg:text-[22px] font-black text-slate-900 leading-[1.3] tracking-tight min-h-[1.3em]">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={formData.itemName || "empty"}
                                        initial={{ opacity: 0, y: 2 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -2 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {formData.itemName || <span className="text-slate-300 italic text-[18px] lg:text-[20px] font-bold">Название позиции...</span>}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            <div className="inline-flex self-start">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={formData.sku || "empty-sku"}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-[12px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-100/50 tracking-wide break-all"
                                    >
                                        {formData.sku || "—"}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="hidden md:block w-px bg-gradient-to-b from-slate-50 via-slate-200 to-slate-50 shrink-0" />

                        <div className="md:w-[45%] flex flex-col justify-center pt-2 md:pt-0 gap-2 min-w-0">
                            {(() => {
                                const filteredEntries = Object.entries(formData.attributes || {}).map(([key, value]) => {
                                    if (!value || typeof value !== 'string') return null;
                                    if (/^[a-f0-9-]{36}$/.test(value) || /^[a-f0-9-]{36}$/.test(key)) return null;

                                    const type = attributeTypes?.find(t => t.slug === key);
                                    if (!type) return null;

                                    const attr = dynamicAttributes?.find(a => a.type === key && a.value === value);
                                    let displayValue = attr?.name || value;

                                    // Страна всегда с большой буквы
                                    const isCountry = type.slug === 'country' || type.name.toLowerCase().includes('страна');
                                    if (isCountry && displayValue) {
                                        displayValue = displayValue.charAt(0).toUpperCase() + displayValue.slice(1);
                                    }

                                    const label = type.name === "Единица измерения" ? "Ед. измерения" : type.name;

                                    return {
                                        label,
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
                                        <div className="flex flex-col gap-2 opacity-50 w-full pt-8 md:pt-0">
                                            {[100, 70, 80].map((w, i) => (
                                                <div key={i} className="flex justify-between items-center w-full">
                                                    <div className="h-[12px] rounded bg-slate-200 animate-pulse w-10 shrink-0" />
                                                    <div className="h-px flex-1 mx-3 border-b border-dashed border-slate-200" />
                                                    <div className="h-[14px] rounded bg-slate-200 animate-pulse shrink-0" style={{ width: `${w}px` }} />
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }

                                return (
                                    <div className="w-full grid grid-cols-2 gap-x-2 gap-y-2 pt-4 md:pt-0">
                                        {filteredEntries.map((chip) => (
                                            <div key={chip.slug} className="flex justify-between items-center group/chip w-full overflow-hidden gap-1 hover:bg-slate-50/50 px-1.5 py-0.5 rounded transition-colors">
                                                <span className="text-xs font-bold text-slate-500 whitespace-nowrap shrink-0 max-w-[50%] truncate pr-1" title={chip.label}>{chip.label}</span>
                                                <div className="h-px flex-1 min-w-[8px] border-b border-dashed border-slate-200 group-hover/chip:border-slate-300 transition-colors self-center mt-1" />
                                                <span className="text-[12px] font-bold text-slate-900 truncate shrink-0 max-w-[50%] pl-1 text-right" title={chip.displayValue}>{chip.displayValue}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
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

                    <div className="flex-1 flex flex-col pt-6 min-h-0">
                        <div className="flex-1 flex flex-col gap-3">



                            <div>
                                {categoryAttributes.length > 0 ? (
                                    <div className="crm-card bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-200/80 rounded-[24px] p-6 lg:p-8 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 grid-flow-row-dense w-full">
                                            {categoryAttributes.map((attr) => {
                                                const isFullWidth = attr.dataType === 'color';
                                                return (
                                                    <div key={attr.id} className={cn(isFullWidth && "md:col-span-3 w-full")}>
                                                        <AttributeSelector
                                                            type={attr.slug}
                                                            label={attr.name}
                                                            value={(getCodeForSlug(attr.slug, attr.name) as string) || ""}
                                                            onChange={(optionName, code) => handleAttributeChange(attr.slug, attr.name, code, optionName)}
                                                            categoryId={attr.categoryId || category.id}
                                                            initialAttributeType={attr}
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
                                <div className="crm-card bg-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-200/80 rounded-[20px] p-6 lg:p-8 space-y-3">
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
                                            <div className="grid grid-cols-3 gap-2">
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
