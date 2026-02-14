"use client";

import { useEffect } from "react";
import { AlertCircle, Box, Scale, Ruler, ExternalLink, SlidersHorizontal, Package, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumSelect } from "@/components/ui/premium-select";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Category, InventoryAttribute, AttributeType, ItemFormData } from "../../../types";
import { CLOTHING_COLORS } from "../../../category-utils";
import { StepFooter } from "./step-footer";
import { Button } from "@/components/ui/button";

interface PackagingBasicInfoStepProps {
    category: Category;
    subCategories: Category[];
    measurementUnits: { id: string; name: string }[];
    dynamicAttributes: InventoryAttribute[];
    attributeTypes: AttributeType[];
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onNext: () => void;
    onBack: () => void;
    validationError?: string;
}

export function PackagingBasicInfoStep({
    category,
    subCategories,
    measurementUnits,
    dynamicAttributes,
    formData,
    updateFormData,
    onNext,
    onBack,
    validationError
}: PackagingBasicInfoStepProps) {

    // Helper to get attributes by type slug
    const getAttributesByType = (slug: string) => {
        return dynamicAttributes
            .filter(attr => attr.type === slug)
            .map(attr => ({
                id: attr.value, // Use value as ID for easier mapping
                name: attr.name,
                meta: attr.meta
            }));
    };

    const brands = getAttributesByType("brand");
    const materials = getAttributesByType("material");
    // Colors are merged from static CLOTHING_COLORS and dynamic DB colors just in case, but usually we use static logic for consistency
    // Actually let's use the standard color logic from BasicInfoStep if possible or simplified one.
    // We will stick to CLOTHING_COLORS as standard palette.

    // Calculate Name and SKU
    useEffect(() => {
        const subCat = subCategories.find(s => s.id === formData.subcategoryId);
        const subCatName = subCat?.name || category.name;

        const length = formData.depth || ""; // Длина
        const width = formData.width || "";  // Ширина
        const height = formData.height || ""; // Высота

        let dimensions = "";
        if (length && width && height) {
            dimensions = `${length}x${width}x${height}`;
        }

        const colorName = CLOTHING_COLORS.find(c => c.code === formData.attributeCode)?.name || "";
        const materialName = materials.find(m => m.id === formData.materialCode)?.name || "";

        // Format: [Подкатегория] [Д]x[Ш]x[В] [Цвет] [Материал]
        // E.g. Коробка 300x200x100 Крафт Гофрокартон
        const nameParts = [
            subCatName,
            dimensions,
            colorName,
            materialName
        ].filter(Boolean);

        const generatedName = nameParts.join(" ");

        // SKU Generation
        // PKG-{SUB}-{DIM}-{COLOR}
        // Sub prefix
        const subPrefix = subCat?.prefix || subCatName.substring(0, 3).toUpperCase();

        // Color code
        const colorCode = formData.attributeCode || "UNI";

        let generatedSku = `PKG-${subPrefix}`;
        if (dimensions) generatedSku += `-${dimensions}`;
        generatedSku += `-${colorCode}`;

        // Only update if not manually edited? For simplicity, we auto-update if name is empty or matches pattern roughly
        // But better: just update always as user asked for auto-generation.
        // We will update name and sku in form data, but allow manual override if needed (though UI might block it).
        // Let's autoset them.

        if (generatedName !== formData.itemName) {
            updateFormData({ itemName: generatedName });
        }
        if (generatedSku !== formData.sku) {
            updateFormData({ sku: generatedSku });
        }

    }, [
        formData.subcategoryId,
        formData.width,
        formData.height,
        formData.depth,
        formData.attributeCode,
        formData.materialCode,
        formData.itemName,
        formData.sku,
        subCategories,
        category.name,
        materials,
        updateFormData
    ]);


    const renderInput = (
        label: string,
        value: string | undefined,
        field: keyof ItemFormData,
        placeholder: string,
        icon?: React.ReactNode,
        suffix?: string,
        type: "text" | "number" = "text",
        className?: string
    ) => (
        <div className={cn("space-y-1.5", className)}>
            <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1">
                {icon && <span className="text-slate-400">{icon}</span>}
                {label}
            </label>
            <div className="relative">
                <Input
                    type={type}
                    value={value || ""}
                    onChange={(e) => updateFormData({ [field]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus-visible:bg-white focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/5 transition-all font-bold text-sm text-slate-900 shadow-sm placeholder:text-slate-300 placeholder:font-medium shadow-none"
                />
                {suffix && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md pointer-events-none">
                        {suffix}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 px-10 pt-10 pb-0 overflow-y-auto min-h-0 custom-scrollbar">
                <div className="max-w-[800px] mx-auto space-y-8 pb-10">

                    {/* Header */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-12 h-12 rounded-[var(--radius)] bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Упаковка</h2>
                            <p className="text-[10px] font-bold text-slate-500 opacity-60">Параметры и характеристики</p>
                        </div>
                    </div>

                    {validationError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-[var(--radius)] bg-rose-50 border border-rose-100 flex items-start gap-3 shadow-sm"
                        >
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-rose-600">Пожалуйста, проверьте данные</h4>
                                <p className="text-xs text-rose-500 mt-1 font-medium">{validationError}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Section 1: Type & Brand */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center text-[10px] font-bold">1</span>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Основное</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Тип упаковки</label>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-[14px]">
                                    <Button
                                        variant="ghost"
                                        onClick={() => updateFormData({ packagingType: "individual" })}
                                        className={cn(
                                            "h-9 flex-1 rounded-[10px] text-xs font-bold transition-all shadow-none",
                                            formData.packagingType === "individual" || !formData.packagingType
                                                ? "bg-white text-slate-900 shadow hover:bg-white"
                                                : "text-slate-500 hover:text-slate-700 hover:bg-transparent"
                                        )}
                                    >
                                        Индивидуальная
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => updateFormData({ packagingType: "transport" })}
                                        className={cn(
                                            "h-9 flex-1 rounded-[10px] text-xs font-bold transition-all shadow-none",
                                            formData.packagingType === "transport"
                                                ? "bg-white text-slate-900 shadow hover:bg-white"
                                                : "text-slate-500 hover:text-slate-700 hover:bg-transparent"
                                        )}
                                    >
                                        Транспортная
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Бренд</label>
                                <PremiumSelect
                                    label=""
                                    placeholder="Выберите бренд"
                                    options={brands.map(b => ({ id: b.id, title: b.name }))}
                                    value={formData.brandCode || ""}
                                    onChange={(val) => updateFormData({ brandCode: val })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Dimensions & Specs */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-[10px] font-bold">2</span>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Габариты и Характеристики</h3>
                        </div>

                        <div className="grid grid-cols-12 gap-4">
                            {/* Dimensions */}
                            <div className="col-span-12 md:col-span-7 grid grid-cols-3 gap-3 p-4 bg-slate-50/50 rounded-[20px] border border-slate-200/60">
                                {renderInput("Длина", formData.depth, "depth", "300", <Ruler className="w-3 h-3" />, "мм", "number")}
                                {renderInput("Ширина", formData.width, "width", "200", <Ruler className="w-3 h-3 rotate-90" />, "мм", "number")}
                                {renderInput("Высота", formData.height, "height", "100", <Box className="w-3 h-3" />, "мм", "number")}
                            </div>

                            {/* Additional Specs */}
                            <div className="col-span-12 md:col-span-5 space-y-3">
                                {renderInput("Вес (1 шт)", formData.weight as string, "weight", "50", <Scale className="w-3 h-3" />, "гр", "number")}

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Размер (поиск)</label>
                                    <PremiumSelect
                                        options={[
                                            { id: "S", title: "S - Маленький" },
                                            { id: "M", title: "M - Средний" },
                                            { id: "L", title: "L - Большой" },
                                            { id: "XL", title: "XL - Очень большой" },
                                        ]}
                                        value={formData.sizeCode || ""}
                                        onChange={(val) => updateFormData({ sizeCode: val })}
                                        placeholder="Не выбрано"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Материал</label>
                                <PremiumSelect
                                    label=""
                                    placeholder="Выберите материал"
                                    options={materials.map(m => ({ id: m.id, title: m.name }))}
                                    value={formData.materialCode || ""}
                                    onChange={(val) => updateFormData({ materialCode: val })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Цвет</label>
                                <div className="flex flex-wrap gap-2">
                                    {CLOTHING_COLORS.map(c => {
                                        const isActive = formData.attributeCode === c.code;
                                        return (
                                            <Button
                                                key={c.code}
                                                variant="ghost"
                                                onClick={() => updateFormData({ attributeCode: c.code })}
                                                className={cn(
                                                    "w-6 h-6 p-0 rounded-full shadow-sm ring-1 ring-black/5 transition-all relative flex items-center justify-center min-w-0 h-6",
                                                    isActive ? "scale-110 ring-2 ring-primary ring-offset-2 hover:bg-transparent" : "hover:bg-transparent"
                                                )}
                                                style={{ backgroundColor: c.hex }}
                                                title={c.name}
                                            >
                                                {isActive && <Check className={cn("w-3 h-3", c.code === "WHT" ? "text-slate-900" : "text-white")} strokeWidth={4} />}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Features Checkboxes */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <label className="flex items-center gap-3 p-3 rounded-[14px] border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all group">
                                <div className={cn(
                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                                    formData.features?.includes("glued_valve") ? "bg-primary border-primary" : "border-slate-300 bg-white group-hover:border-primary/50"
                                )}>
                                    {formData.features?.includes("glued_valve") && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.features?.includes("glued_valve") || false}
                                    onChange={(e) => {
                                        const feats = formData.features || [];
                                        if (e.target.checked) updateFormData({ features: [...feats, "glued_valve"] });
                                        else updateFormData({ features: feats.filter((f: string) => f !== "glued_valve") });
                                    }}
                                />
                                <span className="text-sm font-bold text-slate-700">Клеевой клапан</span>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-[14px] border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all group">
                                <div className={cn(
                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                                    formData.features?.includes("tear_tape") ? "bg-primary border-primary" : "border-slate-300 bg-white group-hover:border-primary/50"
                                )}>
                                    {formData.features?.includes("tear_tape") && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={formData.features?.includes("tear_tape") || false}
                                    onChange={(e) => {
                                        const feats = formData.features || [];
                                        if (e.target.checked) updateFormData({ features: [...feats, "tear_tape"] });
                                        else updateFormData({ features: feats.filter((f: string) => f !== "tear_tape") });
                                    }}
                                />
                                <span className="text-sm font-bold text-slate-700">Отрывная лента</span>
                            </label>
                        </div>
                    </section>

                    {/* Section 3: Logistics */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <span className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center text-[10px] font-bold">3</span>
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Закупка и Логистика</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderInput("Поставщик", formData.supplierName, "supplierName", "Название компании")}

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                    Ссылка на поставщика
                                </label>
                                <Input
                                    value={formData.supplierLink || ""}
                                    onChange={(e) => updateFormData({ supplierLink: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus-visible:bg-white focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/5 transition-all font-bold text-sm text-slate-900 shadow-sm text-blue-600 underline-offset-2 placeholder:text-slate-300 placeholder:no-underline shadow-none"
                                />
                            </div>

                            {renderInput("Мин. партия", formData.minBatch, "minBatch", "100", <SlidersHorizontal className="w-3 h-3" />, "шт", "number")}

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Ед. измерения</label>
                                <PremiumSelect
                                    label=""
                                    placeholder=""
                                    options={measurementUnits.map(u => ({ id: u.id, title: u.name }))}
                                    value={formData.unit || "шт."}
                                    onChange={(val) => updateFormData({ unit: val })}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Preview Generated Info */}
                    <div className="p-4 bg-slate-900/5 rounded-[16px] border border-slate-900/10 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Предпросмотр</span>
                            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">Авто-генерация</span>
                        </div>
                        <div>
                            <div className="text-lg font-black text-slate-900 leading-tight mb-1">{formData.itemName || "—"}</div>
                            <div className="text-xs font-mono font-bold text-slate-500">{formData.sku || "—"}</div>
                        </div>
                    </div>

                </div>
            </div>

            <StepFooter
                onBack={onBack}
                onNext={() => {
                    // Basic validation
                    if (!formData.packagingType) updateFormData({ packagingType: "individual" }); // Default
                    onNext();
                }}
                validationError={validationError}
            />
        </div>
    );
}
