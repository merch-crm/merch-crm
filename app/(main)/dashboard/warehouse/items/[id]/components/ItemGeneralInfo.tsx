"use client";

import React from "react";
import {
    Sparkles,
    BadgeCheck,
    Shirt,
    Layers,
    Ruler,
    Droplets,
    Search,
    Pencil,
    Plus,
    X,
} from "lucide-react";
import { CLOTHING_QUALITIES } from "../../../category-utils";
import { PremiumSelect } from "@/components/ui/premium-select";
import { InventoryItem, AttributeType, InventoryAttribute } from "../../../types";
import { Session } from "@/lib/auth";
import { cn } from "@/lib/utils";

interface ItemGeneralInfoProps {
    item: InventoryItem;
    isEditing: boolean;
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    editData: InventoryItem;
    onUpdateField: (field: string, value: string | number | null | boolean | Record<string, unknown>) => void;
    onUpdateAttribute: (key: string, value: string) => void;
    onRemoveAttribute?: (key: string) => void;
    user: Session | null;
    totalStock: number;
    onEdit?: () => void;
}

export function ItemGeneralInfo({
    item,
    isEditing,
    attributeTypes,
    allAttributes,
    editData,
    onUpdateField,
    onUpdateAttribute,
    onRemoveAttribute,
    onEdit
}: ItemGeneralInfoProps) {
    // Helper to get descriptive name for a code
    const getAttrLabel = (typeSlug: string, value: string | number | null | undefined): string => {
        if (!value) return "—";
        const attr = allAttributes.find(a => a.type === typeSlug && a.value === value);
        return attr ? attr.name : String(value);
    };

    // Color mapping for visual indicator
    const getColorHex = (label: string) => {
        const colors: Record<string, string> = {
            "шоколад": "#3E2A24",
            "черный": "#020617",
            "белый": "#FFFFFF",
            "красный": "#E11D48",
            "синий": "#2563EB",
            "зеленый": "#16A34A",
            "желтый": "#EAB308",
            "серый": "#64748B",
            "розовый": "#DB2777",
            "оранжевый": "#EA580C",
            "фиолетовый": "#9333EA",
            "бежевый": "#D6D3D1",
            "хаки": "#454B1B",
            "бордовый": "#7F1D1D",
            "мята": "#4ADE80",
            "голубой": "#38BDF8",
            "песочный": "#C2B280",
            "оливка": "#808000",
            "горчица": "#EAB308",
            "графит": "#334155",
            "антрацит": "#1E293B",
            "бирюза": "#0D9488",
            "индиго": "#4F46E5",
            "баблгам": "#FF69B4",
            "молочный": "#FFFAF0",
            "кремовый": "#FFFDD0",
            "слоновая": "#FFFFF0",
            "коричневый": "#8B4513",
            "марсала": "#955251",
            "коралл": "#FF7F50",
            "лаванда": "#E6E6FA",
            "сирень": "#C8A2C8",
            "терракот": "#E2725B",
            "пудра": "#F5E6E3",
            "капучино": "#A67B5B",
            "карамель": "#FFD59A",
            "персик": "#FFCBA4",
            "малина": "#E30B5C",
            "вишня": "#DE3163",
            "изумруд": "#50C878",
            "морская волна": "#008B8B",
            "небесный": "#87CEEB",
            "сапфир": "#0F52BA",
            "лимон": "#FFF44F",
            "мокко": "#4A3728",
        };
        const lowerLabel = label.toLowerCase();
        for (const [key, hex] of Object.entries(colors)) {
            if (lowerLabel.includes(key)) return hex;
        }
        return null;
    };

    const isLightColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.65;
    };

    // Param mapping for Clean Minimal style
    const getParamConfig = (slug: string, hexColor?: string | null): { icon: React.ElementType, customHex?: string } => {
        const configs: Record<string, { icon: React.ElementType }> = {
            "quality": { icon: Sparkles },
            "brand": { icon: BadgeCheck },
            "material": { icon: Shirt },
            "size": { icon: Ruler },
            "color": { icon: Droplets },
            "composition": { icon: Layers },
        };

        const config = configs[slug] || { icon: Search };

        if (slug === 'color' && hexColor) {
            return { ...config, customHex: hexColor };
        }

        return config;
    };

    // Filter dynamic attributes
    const dynamicAttributeValues = isEditing ? editData.attributes : (item.attributes || {});
    const dynamicEntries = Object.entries(dynamicAttributeValues).filter(([key, val]) =>
        val !== undefined &&
        val !== null &&
        (isEditing || val !== "") && // Show empty values while editing
        typeof val !== 'object' &&
        key !== 'thumbnailSettings'
    );

    // Core SKU parameters
    const skuParams = [
        { label: "Качество", slug: "quality", code: isEditing ? editData.qualityCode : item.qualityCode },
        { label: "Бренд", slug: "brand", code: isEditing ? editData.brandCode : item.brandCode },
        { label: "Материал", slug: "material", code: isEditing ? editData.materialCode : item.materialCode },
        { label: "Размер", slug: "size", code: isEditing ? editData.sizeCode : item.sizeCode },
        { label: "Цвет", slug: "color", code: isEditing ? editData.attributeCode : item.attributeCode },
    ].filter(p => p.code !== null); // Only filter out explicitly null (removed) values

    // Filter dynamic entries to avoid duplicates
    // List of all reserved SKU slugs that should NEVER appear as dynamic attributes
    const reservedSkuSlugs = ["brand", "quality", "material", "size", "color"];
    const skuLabels = ["Бренд", "Качество", "Материал", "Размер", "Цвет"];

    const nonSkuDynamicEntries = dynamicEntries.filter(([key]) => {
        // Always exclude reserved slugs from dynamic attributes
        if (reservedSkuSlugs.includes(key)) return false;
        if (skuLabels.includes(key)) return false;

        const type = attributeTypes.find(t => t.slug === key || t.name === key);
        if (type && reservedSkuSlugs.includes(type.slug)) return false;

        return true;
    });

    const allParams = [...skuParams.map(p => ({ ...p, isSku: true })), ...nonSkuDynamicEntries.map(([slug, value]) => ({
        label: attributeTypes.find(t => t.slug === slug)?.name || slug,
        slug,
        code: value,
        isSku: false
    }))];

    const total = allParams.length;
    const isDense = total > 10;

    return (
        <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {isDense ? (
                /* Dense List Layout (> 10 items) */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-2 overflow-y-auto custom-scrollbar pr-2 h-full">
                    {allParams.map((param) => {
                        const attrLabel = getAttrLabel(param.slug, param.code as string | number | null);
                        const hexColor = getColorHex(attrLabel);
                        const config = getParamConfig(param.slug, hexColor);
                        const Icon = config.icon;

                        return (
                            <div
                                key={param.slug}
                                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                            >
                                <div
                                    className={cn(
                                        "w-8 h-8 shrink-0 flex items-center justify-center relative rounded-lg",
                                        !config.customHex ? "bg-slate-100 text-slate-400" : "text-white"
                                    )}
                                    style={config.customHex ? {
                                        backgroundColor: config.customHex,
                                        border: attrLabel.toLowerCase().includes('белый') ? '1px solid #e2e8f0' : 'none'
                                    } : undefined}
                                >
                                    <Icon className={cn(
                                        "w-4 h-4 z-10",
                                        config.customHex && isLightColor(config.customHex) ? "text-slate-900/40" : ""
                                    )} />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1 leading-tight">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-normal truncate">
                                        {param.label}
                                    </span>
                                    <div className="text-sm font-bold text-slate-700 truncate">
                                        {isEditing ? (
                                            <PremiumSelect
                                                value={(param.code as string) || ""}
                                                onChange={(val) => {
                                                    onUpdateAttribute(param.slug, val);
                                                    if (param.slug === 'quality') onUpdateField('qualityCode', val);
                                                    else if (param.isSku) {
                                                        const map: Record<string, string> = {
                                                            'brand': 'brandCode', 'material': 'materialCode',
                                                            'size': 'sizeCode', 'color': 'attributeCode'
                                                        };
                                                        if (map[param.slug]) onUpdateField(map[param.slug], val);
                                                    }
                                                }}
                                                options={param.slug === 'quality'
                                                    ? CLOTHING_QUALITIES.map(q => ({ id: q.code, title: q.name }))
                                                    : allAttributes
                                                        .filter(a => a.type === param.slug)
                                                        .map(attr => ({
                                                            id: attr.value,
                                                            title: attr.name,
                                                            color: param.slug === 'color' ? (getColorHex(attr.name) || undefined) : undefined
                                                        }))
                                                }
                                                placeholder="—"
                                                compact={true}
                                            />
                                        ) : (
                                            <span onDoubleClick={onEdit} className="cursor-pointer">
                                                {attrLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Elite CRM Polish - Gray Compact Edition (Matching Stock Alerts) */
                <div className="grid grid-cols-6 gap-3 flex-1 h-full overflow-y-auto custom-scrollbar px-1 pb-1">
                    {allParams.map((param, idx) => {
                        const attrLabel = getAttrLabel(param.slug, param.code as string | number | null);
                        const hexColor = getColorHex(attrLabel);
                        const config = getParamConfig(param.slug, hexColor);
                        const Icon = config.icon;

                        // XL Logic (4 cols for row-span-1 density or 3 cols)
                        // With row-span-1, we might want it even denser. 
                        // Let's stick to the current col counts but make items smaller.
                        const xlRemainder = total % 3;
                        let xlSpan = "xl:col-span-2";
                        if (xlRemainder === 1 && idx === total - 1) {
                            xlSpan = "xl:col-span-6";
                        } else if (xlRemainder === 2 && idx >= total - 2) {
                            xlSpan = "xl:col-span-3";
                        }

                        // MD Logic (2 cols base = spans of 3)
                        const mdRemainder = total % 2;
                        let mdSpan = "md:col-span-3";
                        if (mdRemainder === 1 && idx === total - 1) {
                            mdSpan = "md:col-span-6";
                        }

                        const colorVariants: Record<string, { light: string, solid: string, rgb: string }> = {
                            quality: { light: "bg-violet-100", solid: "bg-violet-500", rgb: "139, 92, 246" },
                            brand: { light: "bg-blue-100", solid: "bg-blue-500", rgb: "59, 130, 246" },
                            material: { light: "bg-emerald-100", solid: "bg-emerald-500", rgb: "16, 185, 129" },
                            size: { light: "bg-amber-100", solid: "bg-amber-500", rgb: "245, 158, 11" },
                            color: { light: "bg-rose-100", solid: "bg-rose-500", rgb: "244, 63, 94" },
                        };
                        const variant = colorVariants[param.slug] || { light: "bg-slate-100", solid: "bg-slate-400", rgb: "148, 163, 184" };
                        const iconColor = config.customHex ? "" : variant.solid.replace('bg-', 'text-');

                        return (
                            <div
                                key={param.slug}
                                className={cn(
                                    "group bg-[#f8fafc] rounded-2xl p-5 border border-slate-200 transition-all flex flex-col justify-between min-h-[110px] h-full relative overflow-hidden col-span-6",
                                    mdSpan,
                                    xlSpan,
                                    "hover:bg-white hover:border-slate-300"
                                )}
                            >

                                {/* Header: Icon & Label Row */}
                                <div className="flex items-center justify-between relative z-10 mb-2">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
                                                !config.customHex ? variant.light : (isLightColor(config.customHex) ? "bg-slate-100/80 border border-slate-200/50" : "")
                                            )}
                                            style={config.customHex && !isLightColor(config.customHex) ? {
                                                backgroundColor: config.customHex + '15', // very light bg for custom colors
                                                border: `1px solid ${config.customHex}30`
                                            } : undefined}
                                        >
                                            <Icon
                                                className={cn(
                                                    "w-4 h-4 transition-transform",
                                                    !config.customHex ? iconColor : (isLightColor(config.customHex) ? "text-slate-500" : "")
                                                )}
                                                style={config.customHex && !isLightColor(config.customHex) ? { color: config.customHex } : undefined}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-normal">
                                            {param.label}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        {isEditing && onRemoveAttribute && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    onRemoveAttribute(param.slug);
                                                }}
                                                className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all transform active:scale-95 shadow-sm"
                                                title="Удалить характеристику"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                        {!isEditing && onEdit && (
                                            <button
                                                onClick={onEdit}
                                                className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 hover:bg-slate-900 hover:text-white transition-all transform active:scale-95 shadow-sm"
                                            >
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Watermark Background Icon */}
                                <Icon className={cn(
                                    "absolute -right-4 -bottom-4 w-32 h-32 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 pointer-events-none z-0",
                                    !config.customHex ? [iconColor, "opacity-[0.03]"] : (isLightColor(config.customHex) ? "text-slate-900 opacity-[0.05]" : "opacity-[0.04]")
                                )} style={config.customHex && !isLightColor(config.customHex) ? { color: config.customHex } : undefined} />

                                {/* Value: Bottom Aligned */}
                                <div className="relative z-10 flex-1 flex flex-col justify-end">
                                    {isEditing ? (
                                        <div className="mt-1">
                                            <PremiumSelect
                                                value={(param.code as string) || ""}
                                                onChange={(val) => {
                                                    onUpdateAttribute(param.slug, val);
                                                    if (param.slug === 'quality') onUpdateField('qualityCode', val);
                                                    else if (param.isSku) {
                                                        const map: Record<string, string> = {
                                                            'brand': 'brandCode', 'material': 'materialCode',
                                                            'size': 'sizeCode', 'color': 'attributeCode'
                                                        };
                                                        if (map[param.slug]) onUpdateField(map[param.slug], val);
                                                    }
                                                }}
                                                options={param.slug === 'quality'
                                                    ? CLOTHING_QUALITIES.map(q => ({ id: q.code, title: q.name }))
                                                    : allAttributes
                                                        .filter(a => a.type === param.slug)
                                                        .map(attr => ({
                                                            id: attr.value,
                                                            title: attr.name,
                                                            color: param.slug === 'color' ? (getColorHex(attr.name) || undefined) : undefined
                                                        }))
                                                }
                                                placeholder="—"
                                                compact={true}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <h2
                                                className="text-xl xl:text-2xl font-black text-slate-900 leading-tight tracking-tight break-words cursor-pointer transition-colors group-hover:text-primary"
                                                onDoubleClick={onEdit}
                                            >
                                                {attrLabel}
                                            </h2>
                                            {/* Technical SKU Fragment */}
                                            <span className="text-[10px] font-bold text-slate-400/70 mt-0.5 font-mono uppercase tracking-wider">
                                                Арт.: {param.code || '—'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Add Characteristic Tile */}
                    {isEditing && (
                        <div
                            className={cn(
                                "group bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-200 transition-all flex flex-col items-center justify-center min-h-[110px] relative col-span-6 md:col-span-3 xl:col-span-2 hover:border-primary/50 hover:bg-primary/5"
                            )}
                        >
                            <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors pointer-events-none">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wide">
                                    Добавить
                                    <span className="ml-1 opacity-50">
                                        ({
                                            // Count available options (System + Dynamic)
                                            (() => {
                                                const systemSkuTypes = [
                                                    { slug: "brand", name: "Бренд" },
                                                    { slug: "quality", name: "Качество" },
                                                    { slug: "material", name: "Материал" },
                                                    { slug: "size", name: "Размер" },
                                                    { slug: "color", name: "Цвет" }
                                                ];
                                                const allOptions = [...systemSkuTypes, ...attributeTypes];
                                                // Deduplicate by slug
                                                const uniqueOptions = Array.from(new Map(allOptions.map(item => [item.slug, item])).values());

                                                return uniqueOptions.filter(t => !allParams.find(p => p.slug === t.slug)).length;
                                            })()
                                        })
                                    </span>
                                </span>
                            </div>
                            <PremiumSelect
                                value=""
                                onChange={(slug) => {
                                    if (slug) {
                                        onUpdateAttribute(slug, "");
                                    }
                                }}
                                className="absolute inset-0 w-full h-full z-10"
                                options={(() => {
                                    const systemSkuTypes = [
                                        { slug: "brand", name: "Бренд" },
                                        { slug: "quality", name: "Качество" },
                                        { slug: "material", name: "Материал" },
                                        { slug: "size", name: "Размер" },
                                        { slug: "color", name: "Цвет" }
                                    ];
                                    const allOptions = [...systemSkuTypes, ...attributeTypes];
                                    const uniqueOptions = Array.from(new Map(allOptions.map(item => [item.slug, item])).values());

                                    return uniqueOptions
                                        .filter(type => {
                                            const existingSlugs = allParams.map(p => p.slug);
                                            return !existingSlugs.includes(type.slug);
                                        })
                                        .map(type => ({
                                            id: type.slug,
                                            title: type.name
                                        }));
                                })()}
                                placeholder="Выберите тип..."
                                compact={true}
                                triggerClassName="w-full h-full opacity-0 hover:bg-transparent border-none p-0 cursor-pointer"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
