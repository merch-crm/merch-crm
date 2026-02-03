"use client";

import { useEffect, createElement } from "react";
import Link from "next/link";
import { Package, Hash, Ruler, Info, Wrench, ClipboardList, Printer, Shirt, Scissors, Settings2 } from "lucide-react";
import { UnitSelect } from "@/components/ui/unit-select";
import { cn } from "@/lib/utils";
import { PremiumSelect } from "@/components/ui/premium-select";
import { StepFooter } from "./step-footer";
import { AttributeSelector } from "../../../attribute-selector";
import { Category } from "../../../types";
import { InventoryAttribute, AttributeType, ItemFormData } from "../../../types";
import { getCategoryIcon, getColorStyles, ICONS, getIconNameFromName } from "../../../category-utils";



interface MeasurementUnit {
    id: string;
    name: string;
}

// Fallback UNIT_OPTIONS removed, using measurementUnits prop instead

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
    const isClothing = category.name.toLowerCase().includes("одежда");
    const isPackaging = category.name.toLowerCase().includes("упаковка");
    const isConsumables = category.name.toLowerCase().includes("расходники");

    const customTypes = attributeTypes.filter(t => {
        if (["brand", "quality", "material", "size", "color"].includes(t.slug)) return false;
        return !t.categoryId ||
            t.categoryId === category.id ||
            (formData.subcategoryId && t.categoryId === formData.subcategoryId);
    });

    const compositionType = customTypes.find(t => t.slug === 'composition' || t.name.toLowerCase() === 'состав');
    const remainingCustomTypes = customTypes.filter(t => t.id !== compositionType?.id);

    const transliterate = (text: string) => {
        const map: Record<string, string> = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
            'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
            'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };
        return text.split('').map(char => {
            const lowChar = char.toLowerCase();
            const res = map[lowChar] || lowChar;
            return char === char.toUpperCase() ? res.toUpperCase() : res;
        }).join('');
    };

    // Автогенерация SKU и названия для одежды
    useEffect(() => {
        if (isClothing) {
            // Ищем артикул выбранной подкатегории или текущей категории
            let prefix = category.prefix;

            if (formData.subcategoryId) {
                const subCat = subCategories.find(c => c.id === formData.subcategoryId);
                if (subCat?.prefix) prefix = subCat.prefix;
            }

            // SKU Generation
            const shouldShowInSku = (type: string, code?: string) => {
                if (!code) return false;
                const attr = dynamicAttributes.find(a => a.type === type && a.value === code);
                return (attr?.meta as { showInSku?: boolean })?.showInSku ?? true;
            };

            const skuParts: string[] = [];
            if (prefix) skuParts.push(prefix);

            if (shouldShowInSku('brand', formData.brandCode)) skuParts.push(formData.brandCode!);
            if (shouldShowInSku('quality', formData.qualityCode)) skuParts.push(formData.qualityCode!);
            if (shouldShowInSku('material', formData.materialCode)) skuParts.push(formData.materialCode!);
            if (shouldShowInSku('color', formData.attributeCode)) skuParts.push(formData.attributeCode!);
            if (shouldShowInSku('size', formData.sizeCode)) skuParts.push(formData.sizeCode!);

            // Add custom attributes to SKU
            customTypes.forEach((type: AttributeType) => {
                const code = formData.attributes?.[type.slug];
                if (code && shouldShowInSku(type.slug, code)) {
                    skuParts.push(code);
                }
            });

            const generatedSku = transliterate(skuParts.join("-").toUpperCase());

            // Avoid infinite loop: only update if changed
            if (generatedSku !== formData.sku) {
                updateFormData({ sku: generatedSku });
            }

            const activeCat = formData.subcategoryId ? subCategories.find(c => c.id === formData.subcategoryId) : category;
            const targetGender = activeCat?.gender || "masculine";

            // Try to find singular name from category data or icon label fallback
            const iconName = activeCat?.icon || (activeCat?.name ? getIconNameFromName(activeCat.name) : null);
            const iconLabel = iconName ? ICONS.find(i => i.name === iconName)?.label : null;

            const getSingularName = (name: string) => {
                const n = name.toLowerCase();
                if (n.includes("футболк")) return "Футболка";
                if (n.includes("худи")) return "Худи";
                if (n.includes("лонгслив")) return "Лонгслив";
                if (n.includes("свитшот")) return "Свитшот";
                if (n.includes("толстовк")) return "Толстовка";
                if (n.includes("куртк")) return "Куртка";
                if (n.includes("бомбер")) return "Бомбер";
                if (n.includes("шорт")) return "Шорты";
                if (n.includes("штан") || n.includes("брюк")) return "Штаны";
                if (n.includes("кепк")) return "Кепка";
                if (n.includes("шапк")) return "Шапка";
                if (n.includes("поло")) return "Поло";
                return name;
            };

            const baseName = activeCat?.singularName || iconLabel || (activeCat?.name ? getSingularName(activeCat.name) : "");

            // Item Name Generation
            const getAttrName = (type: string, code?: string) => {
                const attr = dynamicAttributes.find(a => a.type === type && a.value === code);
                if (!attr) return code;

                // Robust meta parsing
                let meta: unknown = attr.meta;
                if (typeof meta === 'string') {
                    try { meta = JSON.parse(meta); } catch { meta = {}; }
                } else if (!meta) {
                    meta = {};
                }

                const typedMeta = meta as { showInName?: boolean; fem?: string; neut?: string };

                // Check visibility
                if (typedMeta?.showInName === false) return null;

                if (targetGender === "feminine" && typedMeta?.fem) return typedMeta.fem;
                if (targetGender === "neuter" && typedMeta?.neut) return typedMeta.neut;

                return attr.name;
            };

            const brandName = getAttrName("brand", formData.brandCode);
            const colorName = getAttrName("color", formData.attributeCode);
            const sizeName = getAttrName("size", formData.sizeCode);
            const qualityName = getAttrName("quality", formData.qualityCode);
            const materialName = getAttrName("material", formData.materialCode);

            const nameParts = [
                baseName,
                brandName,
                materialName,
                qualityName,
                colorName,
                sizeName
            ].filter(Boolean);

            // Add Custom Attributes to Name
            customTypes.forEach((type: AttributeType) => {
                const code = formData.attributes?.[type.slug];
                if (code) {
                    const name = getAttrName(type.slug, code);
                    if (name) nameParts.push(name);
                }
            });

            const generatedName = nameParts.join(" ");

            // Only auto-update name if it's currently empty or was previously auto-generated
            // For now, we'll just update it to keep it in sync for the preview
            if (generatedName && generatedName !== formData.itemName) {
                updateFormData({ itemName: generatedName });
            }
        }
    }, [
        isClothing,
        category.prefix,
        category.name,
        formData.subcategoryId,
        formData.brandCode,
        formData.qualityCode,
        formData.materialCode,
        formData.attributeCode,
        formData.sizeCode,
        subCategories,
        dynamicAttributes,
        formData.attributes,
        attributeTypes,
        category,
        customTypes,
        formData.itemName,
        formData.sku,
        updateFormData
    ]);

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 p-8 overflow-y-auto min-h-0">
                <div className="max-w-6xl mx-auto space-y-7">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                                <ClipboardList className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 ">Основная информация</h2>
                                <p className="text-[11px] text-slate-500 font-bold  opacity-60">Заполните ключевые характеристики вашей позиции</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-[var(--radius)] border border-slate-200/50 shadow-sm">
                                {(() => {
                                    const sub = subCategories.find(s => s.id === formData.subcategoryId);
                                    const displayCategory = sub || category;

                                    return (
                                        <>
                                            <div className={cn("w-10 h-10 rounded-[var(--radius)] flex items-center justify-center border shadow-sm shrink-0", getColorStyles(displayCategory.color))}>
                                                {createElement(getCategoryIcon(displayCategory), { className: "w-5 h-5" })}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[9px] font-bold text-slate-400 leading-none mb-1">{category.name}</div>
                                                <div className="text-sm font-bold text-slate-900 leading-none">{sub ? sub.name : "Общая"}</div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            <Link
                                href="/dashboard/warehouse/characteristics"
                                className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-[var(--radius)] border border-slate-200/50 shadow-sm hover:bg-slate-100/50 transition-all active:scale-95 group"
                            >
                                <div className="w-10 h-10 rounded-[var(--radius)] bg-white flex items-center justify-center border border-slate-200 shadow-sm group-hover:border-slate-900 transition-colors">
                                    <Settings2 className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
                                </div>
                                <div className="text-left pr-2">
                                    <div className="text-[9px] font-bold text-slate-400 leading-none mb-1">Перейти в</div>
                                    <div className="text-sm font-bold text-slate-900 leading-none whitespace-nowrap line-height-tight">Характеристики</div>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {isClothing ? (
                        <>
                            {/* Row 1: Main Attributes & Preview */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                                <div className="lg:col-span-8 space-y-6">
                                    {/* Brand & Quality Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <AttributeSelector
                                            type="brand"
                                            value={formData.brandCode || ""}
                                            onChange={(name, code) => {
                                                const currentAttrs = formData.attributes || {};
                                                updateFormData({
                                                    brandCode: code,
                                                    attributes: { ...currentAttrs, "Бренд": name }
                                                });
                                            }}
                                        />

                                        <AttributeSelector
                                            type="quality"
                                            value={formData.qualityCode || ""}
                                            onChange={(name, code) => {
                                                const currentAttrs = formData.attributes || {};
                                                updateFormData({
                                                    qualityCode: code,
                                                    attributes: { ...currentAttrs, "Качество": name }
                                                });
                                            }}
                                            onCodeChange={(code) => updateFormData({ qualityCode: code })}
                                        />
                                    </div>

                                    {/* Material & Size Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <AttributeSelector
                                            type="material"
                                            value={formData.materialCode || ""}
                                            onChange={(name, code) => {
                                                const currentAttrs = formData.attributes || {};
                                                updateFormData({
                                                    materialCode: code,
                                                    attributes: { ...currentAttrs, "Материал": name }
                                                });
                                            }}
                                            allowCustom={true}
                                        />

                                        <AttributeSelector
                                            type="size"
                                            value={formData.sizeCode || ""}
                                            onChange={(name, code) => {
                                                const currentAttrs = formData.attributes || {};
                                                updateFormData({
                                                    sizeCode: code,
                                                    attributes: { ...currentAttrs, "Размер": name }
                                                });
                                            }}
                                            onCodeChange={(code) => updateFormData({ sizeCode: code })}
                                            allowCustom={true}
                                        />
                                    </div>

                                    {compositionType && (
                                        <div className="space-y-6">
                                            <AttributeSelector
                                                type={compositionType.slug}
                                                label={compositionType.name}
                                                value={formData.attributes?.[compositionType.slug] || ""}
                                                onChange={(name, code) => {
                                                    const currentAttrs = formData.attributes || {};
                                                    updateFormData({
                                                        attributes: { ...currentAttrs, [compositionType.slug]: code }
                                                    });
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="lg:col-span-4">
                                    <div className="p-6 bg-white rounded-[var(--radius)] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-500 ml-1">Превью позиции</label>
                                            <div className="px-2 py-0.5 bg-emerald-500 rounded-full text-[9px] font-bold text-white">Auto</div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="text-xl font-bold leading-tight text-slate-900">
                                                {formData.itemName || 'Название будет здесь'}
                                            </div>

                                            <div className="h-px bg-slate-100" />

                                            <div className="space-y-1">
                                                <div className="text-[9px] font-bold text-slate-400 ">Артикул (SKU)</div>
                                                <div className="text-lg font-mono font-bold  break-all text-slate-900">
                                                    {formData.sku || '---'}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[10px] text-slate-400 font-bold  leading-relaxed opacity-60">
                                            Генерация данных в реальном времени
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Aligned Color & Description */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                                <div className="lg:col-span-8">
                                    <AttributeSelector
                                        type="color"
                                        value={formData.attributeCode || ""}
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
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-xs font-semibold text-slate-900">Описание</label>
                                        </div>
                                        <textarea
                                            value={formData.description || ""}
                                            onChange={(e) => updateFormData({ description: e.target.value })}
                                            className="w-full h-[94px] p-5 rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-medium text-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none shadow-inner overflow-y-auto custom-scrollbar"
                                            placeholder="Особенности кроя, советы по уходу..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Custom Attributes (Conditional) */}
                            {remainingCustomTypes.length > 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                                    <div className="lg:col-span-8 space-y-7">
                                        <div className="space-y-8">
                                            {remainingCustomTypes.map((type: AttributeType) => (
                                                <div key={type.id} className="space-y-6">
                                                    <div className="h-px bg-slate-100" />
                                                    <AttributeSelector
                                                        type={type.slug}
                                                        label={type.name}
                                                        value={formData.attributes?.[type.slug] || ""}
                                                        onChange={(name, code) => {
                                                            const currentAttrs = formData.attributes || {};
                                                            updateFormData({
                                                                attributes: { ...currentAttrs, [type.slug]: code }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-4" />
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Non-clothing rows */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                                <div className="lg:col-span-8">
                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            <label className="text-sm font-bold text-slate-500 ml-1">
                                                <Package className="w-3.5 h-3.5" />
                                                Название позиции
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.itemName}
                                                onChange={(e) => updateFormData({ itemName: e.target.value })}
                                                placeholder="Например: Коробка картонная 40x40"
                                                className="w-full h-12 px-5 rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-bold text-base focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-sm font-bold text-slate-500 ml-1">
                                                    <Hash className="w-3.5 h-3.5" />
                                                    Артикул (SKU)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.sku}
                                                    onChange={(e) => updateFormData({ sku: e.target.value.toUpperCase() })}
                                                    placeholder="SKU-123"
                                                    className="w-full h-11 px-5 rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-bold text-sm focus:border-slate-900 transition-all outline-none font-mono"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-sm font-bold text-slate-500 ml-1">
                                                    <Ruler className="w-3.5 h-3.5" />
                                                    Единица измерения
                                                </label>
                                                <UnitSelect
                                                    name="unit"
                                                    value={isClothing || isPackaging ? "шт." : (formData.unit || "шт.")}
                                                    onChange={(val) => updateFormData({ unit: val })}
                                                    options={measurementUnits.map(u => ({ id: u.id, name: u.name.toUpperCase() }))}
                                                    disabled={isClothing || isPackaging}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-4" />
                            </div>

                            {/* Aligned Row for non-clothing: Description */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                                <div className="lg:col-span-8" />
                                <div className="lg:col-span-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-xs font-semibold text-slate-900">Описание</label>
                                        </div>
                                        <textarea
                                            value={formData.description || ""}
                                            onChange={(e) => updateFormData({ description: e.target.value })}
                                            className="w-full h-[94px] p-5 rounded-[var(--radius)] border border-slate-200 bg-white text-slate-900 font-medium text-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none shadow-inner overflow-y-auto custom-scrollbar"
                                            placeholder="Особенности кроя, советы по уходу..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Row for non-clothing */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                                <div className="lg:col-span-8">
                                    {/* Custom Attributes for non-clothing */}
                                    {remainingCustomTypes.length > 0 && (
                                        <div className="space-y-8 pt-4">
                                            {remainingCustomTypes.map((type: AttributeType) => (
                                                <div key={type.id} className="space-y-6">
                                                    <div className="h-px bg-slate-100" />
                                                    <AttributeSelector
                                                        type={type.slug}
                                                        label={type.name}
                                                        value={formData.attributes?.[type.slug] || ""}
                                                        onChange={(name, code) => {
                                                            const currentAttrs = formData.attributes || {};
                                                            updateFormData({
                                                                attributes: { ...currentAttrs, [type.slug]: code }
                                                            });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Additional Info (Department/Packing) */}
                                    {(isPackaging || isConsumables) && (
                                        <div className="mt-8 p-6 bg-slate-50 rounded-[var(--radius)] border border-slate-200 space-y-6">
                                            <h4 className="text-xs font-bold text-slate-900 ">Дополнительные параметры</h4>

                                            {isPackaging && (
                                                <div className="grid grid-cols-3 gap-4">
                                                    {['width', 'height', 'depth'].map(dim => (
                                                        <div key={dim} className="space-y-2">
                                                            <label className="text-[10px] font-bold text-slate-900 px-1">
                                                                {dim === 'width' ? 'Ширина' : dim === 'height' ? 'Высота' : 'Глубина'}
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    value={(formData[dim] as string) || ""}
                                                                    onChange={(e) => updateFormData({ [dim]: e.target.value })}
                                                                    className="w-full h-11 px-4 pr-10 rounded-[var(--radius)] border border-slate-200 bg-white text-sm font-bold focus:border-amber-500 outline-none transition-all"
                                                                />
                                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">СМ</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {isConsumables && (
                                                <div className="space-y-4">
                                                    <label className="text-sm font-bold text-slate-500 ml-1">
                                                        <Wrench className="w-3.5 h-3.5" />
                                                        Область применения
                                                    </label>
                                                    <PremiumSelect
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
