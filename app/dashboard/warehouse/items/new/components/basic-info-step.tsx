"use client";

import { useEffect } from "react";
import { Package, Hash, Ruler, Info, Wrench } from "lucide-react";
import { UnitSelect } from "@/components/ui/unit-select";
import { AttributeSelector } from "../../../attribute-selector";
import { Category } from "../../../inventory-client";
import { InventoryAttribute, AttributeType, ItemFormData } from "../../../types";



interface MeasurementUnit {
    id: string;
    name: string;
}

// Measurement units for non-clothing items
const UNIT_OPTIONS = [
    { id: "kg", name: "КГ" },
    { id: "l", name: "Л" },
    { id: "m", name: "М" },
    { id: "pogm", name: "ПОГ.М" },
    { id: "upak", name: "УПАК" },
    { id: "sht", name: "ШТ" },
];

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
    attributeTypes = []
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
            // Ищем префикс выбранной подкатегории или текущей категории
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
            const baseName = activeCat?.singularName || activeCat?.name || "";

            // Item Name Generation
            const getAttrName = (type: string, code?: string) => {
                const attr = dynamicAttributes.find(a => a.type === type && a.value === code);
                // Check visibility
                if (attr && (attr.meta as { showInName?: boolean })?.showInName === false) return null;

                if (attr) {
                    const meta = attr.meta as { fem?: string; neut?: string } | null;
                    if (targetGender === "feminine" && meta?.fem) return meta.fem;
                    if (targetGender === "neuter" && meta?.neut) return meta.neut;
                    return attr.name;
                }

                return code;
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
        <div className="flex flex-col min-h-0 h-full overflow-hidden">
            <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Основная информация</h2>
                            <p className="text-slate-500 text-xs font-medium mt-1">Заполните ключевые характеристики вашей позиции</p>
                        </div>
                        <div className="hidden md:flex flex-col items-end">
                            <div className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-1 opacity-40">Категория</div>
                            <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-600 border border-slate-200/60 uppercase tracking-wider">
                                {category.name} {formData.subcategoryId && " / " + subCategories.find(s => s.id === formData.subcategoryId)?.name}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Attributes / Main Info */}
                        <div className="lg:col-span-8 space-y-8">
                            {isClothing ? (
                                <div className="space-y-6">
                                    {/* Brand & Quality Group */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <AttributeSelector
                                            type="brand"
                                            value={formData.brandCode || ""}
                                            onChange={(name, code) => updateFormData({ brandCode: code })}
                                        />

                                        <AttributeSelector
                                            type="quality"
                                            value={formData.qualityCode || ""}
                                            onChange={(name, code) => updateFormData({ qualityCode: code })}
                                            onCodeChange={(code) => updateFormData({ qualityCode: code })}
                                        />
                                    </div>

                                    {/* Material selection */}
                                    <AttributeSelector
                                        type="material"
                                        value={formData.materialCode || ""}
                                        onChange={(name, code) => updateFormData({ materialCode: code })}
                                        allowCustom={true}
                                    />

                                    <AttributeSelector
                                        type="size"
                                        value={formData.sizeCode || ""}
                                        onChange={(name, code) => updateFormData({ sizeCode: code })}
                                        onCodeChange={(code) => updateFormData({ sizeCode: code })}
                                        allowCustom={true}
                                    />

                                    <div className="h-px bg-slate-100" />

                                    <AttributeSelector
                                        type="color"
                                        value={formData.attributeCode || ""}
                                        onChange={(name, code) => updateFormData({ attributeCode: code })}
                                        onCodeChange={(code) => updateFormData({ attributeCode: code })}
                                        allowCustom={true}
                                    />

                                    {/* Custom / Dynamic Attributes */}
                                    {customTypes.length > 0 && (
                                        <div className="space-y-8">
                                            {customTypes.map((type: AttributeType) => (
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
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">
                                            <Package className="w-3.5 h-3.5" />
                                            Название позиции
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.itemName}
                                            onChange={(e) => updateFormData({ itemName: e.target.value })}
                                            placeholder="Например: Коробка картонная 40x40"
                                            className="w-full h-12 px-5 rounded-[14px] border border-slate-200 bg-white text-slate-900 font-bold text-base focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">
                                                <Hash className="w-3.5 h-3.5" />
                                                Артикул (SKU)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => updateFormData({ sku: e.target.value.toUpperCase() })}
                                                placeholder="SKU-123"
                                                className="w-full h-11 px-5 rounded-[14px] border border-slate-200 bg-white text-slate-900 font-bold text-sm focus:border-slate-900 transition-all outline-none uppercase font-mono"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">
                                                <Ruler className="w-3.5 h-3.5" />
                                                Единица измерения
                                            </label>
                                            <UnitSelect
                                                name="unit"
                                                value={formData.unit || "sht"}
                                                onChange={(val) => updateFormData({ unit: val })}
                                                options={UNIT_OPTIONS}
                                            />
                                        </div>
                                    </div>

                                    {/* Custom Attributes for non-clothing */}
                                    {customTypes.length > 0 && (
                                        <div className="space-y-8 pt-4">
                                            {customTypes.map((type: AttributeType) => (
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
                                </div>
                            )}

                            {/* Additional Info (Department/Packing) */}
                            {(isPackaging || isConsumables) && (
                                <div className="p-6 bg-slate-50 rounded-[14px] border border-slate-100 space-y-6">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Дополнительные параметры</h4>

                                    {isPackaging && (
                                        <div className="grid grid-cols-3 gap-4">
                                            {['width', 'height', 'depth'].map(dim => (
                                                <div key={dim} className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">
                                                        {dim === 'width' ? 'Ширина' : dim === 'height' ? 'Высота' : 'Глубина'}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={(formData[dim] as string) || ""}
                                                            onChange={(e) => updateFormData({ [dim]: e.target.value })}
                                                            className="w-full h-11 px-4 pr-10 rounded-[14px] border border-slate-200 bg-white text-sm font-bold focus:border-amber-500 outline-none transition-all"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">СМ</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {isConsumables && (
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">
                                                <Wrench className="w-3.5 h-3.5" />
                                                Область применения
                                            </label>
                                            <select
                                                value={formData.department || ""}
                                                onChange={(e) => updateFormData({ department: e.target.value })}
                                                className="w-full h-12 px-5 rounded-[14px] border border-slate-200 bg-white text-sm font-bold focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="">Выберите отдел...</option>
                                                <option value="printing">Печатный цех</option>
                                                <option value="embroidery">Вышивальный цех</option>
                                                <option value="sewing">Швейный цех</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Sidebar - SKU Preview & Description */}
                        <div className="lg:col-span-4 space-y-8">
                            {isClothing && (
                                <div className="p-6 bg-white rounded-[20px] border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Превью позиции</label>
                                        <div className="px-2 py-0.5 bg-emerald-500 rounded-full text-[9px] font-black uppercase text-white">Auto</div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="text-xl font-black leading-tight text-slate-900">
                                            {formData.itemName || 'Название будет здесь'}
                                        </div>

                                        <div className="h-px bg-slate-100" />

                                        <div className="space-y-1">
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Артикул (SKU)</div>
                                            <div className="text-lg font-mono font-black tracking-wider break-all text-slate-900 uppercase">
                                                {formData.sku || '---'}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed opacity-60">
                                        Генерация данных в реальном времени
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] px-1">
                                    <Info className="w-4 h-4" />
                                    Описание
                                </label>
                                <textarea
                                    value={formData.description || ""}
                                    onChange={(e) => updateFormData({ description: e.target.value })}
                                    className="w-full h-[180px] p-5 rounded-[20px] border border-slate-200 bg-white text-slate-900 font-medium text-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none shadow-inner"
                                    placeholder="Особенности кроя, советы по уходу..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 z-30">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="px-6 h-11 rounded-[14px] text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Назад
                    </button>
                    <div className="flex items-center gap-6">
                        {validationError && (
                            <div className="hidden sm:flex items-center gap-2 text-rose-500 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 animate-in fade-in slide-in-from-right-4">
                                <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">{validationError}</span>
                            </div>
                        )}
                        <button
                            onClick={onNext}
                            className="px-8 h-11 bg-slate-900 text-white rounded-[16px] font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-lg shadow-slate-200/50 transition-all active:scale-95 flex items-center gap-2"
                        >
                            Далее
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
