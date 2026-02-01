"use client";

import React from "react";
import {
    Sparkles,
    Fingerprint,
    Box,
    Ruler,
    Droplets,
    Search,
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
            "brand": { icon: Fingerprint },
            "material": { icon: Box },
            "size": { icon: Ruler },
            "color": { icon: Droplets },
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
        val !== "" &&
        val !== null &&
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
    ].filter(p => isEditing || p.code);

    // Filter dynamic entries to avoid duplicates
    const skuTechnicalSlugs = skuParams.map(p => p.slug);
    const skuLabels = ["Бренд", "Качество", "Материал", "Размер", "Цвет"];

    const nonSkuDynamicEntries = dynamicEntries.filter(([key]) => {
        if (skuTechnicalSlugs.includes(key)) return false;
        if (skuLabels.includes(key)) return false;
        const type = attributeTypes.find(t => t.slug === key || t.name === key);
        if (type && skuTechnicalSlugs.includes(type.slug)) return false;
        return true;
    });

    const allParams = [...skuParams.map(p => ({ ...p, isSku: true })), ...nonSkuDynamicEntries.map(([slug, value]) => ({
        label: attributeTypes.find(t => t.slug === slug)?.name || slug,
        slug,
        code: value,
        isSku: false
    }))];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Parameters Grid */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {allParams.map((param) => {
                        const attrLabel = getAttrLabel(param.slug, param.code as string | number | null);
                        const hexColor = getColorHex(attrLabel);
                        const config = getParamConfig(param.slug, hexColor);
                        const Icon = config.icon;

                        return (
                            <div key={param.slug} className="group bg-slate-50 rounded-[var(--radius-inner)] p-4 border border-slate-200 transition-all hover:shadow-crm-md flex items-center justify-start gap-4 text-left">
                                {/* 3D-like Icon/Color Container */}
                                <div
                                    className={cn(
                                        "w-11 h-11 shrink-0 flex items-center justify-center relative transition-all duration-500",
                                        param.slug === 'color' ? "rounded-full" : "rounded-[var(--radius-inner)]",
                                        !config.customHex ? "bg-slate-100 text-slate-500" : "text-white"
                                    )}
                                    style={config.customHex ? {
                                        backgroundColor: config.customHex,
                                        boxShadow: `0 4px 12px ${config.customHex}40`,
                                        border: attrLabel.toLowerCase().includes('белый') || attrLabel.toLowerCase().includes('молочный')
                                            ? '2px solid #fff'
                                            : '2px solid rgba(255,255,255,0.7)',
                                        outline: '1px solid rgba(0,0,0,0.05)'
                                    } : undefined}
                                >
                                    {param.slug === 'color' && config.customHex ? (
                                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                                            <div className={cn(
                                                "absolute inset-0 rounded-full",
                                                isLightColor(config.customHex) ? "shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]" : "shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"
                                            )} />
                                            <Icon className={cn(
                                                "w-5 h-5 transition-colors duration-500",
                                                isLightColor(config.customHex) ? "text-slate-900/40" : "text-white/60"
                                            )} />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-white/40 rounded-[var(--radius-inner)]" />
                                            <Icon className="w-5 h-5 relative z-10" />
                                        </>
                                    )}
                                </div>

                                <div className="space-y-0.5 min-w-0">
                                    <span className="block text-xs font-bold text-slate-400 transition-colors group-hover:text-slate-500 mb-1 uppercase tracking-wide">
                                        {param.label}
                                    </span>
                                    <div className="min-w-0">
                                        {isEditing ? (
                                            <PremiumSelect
                                                value={(param.code as string) || ""}
                                                onChange={(val) => {
                                                    onUpdateAttribute(param.slug, val);
                                                    if (param.slug === 'quality') {
                                                        onUpdateField('qualityCode', val);
                                                    } else if (param.isSku) {
                                                        const map: Record<string, string> = {
                                                            'brand': 'brandCode',
                                                            'material': 'materialCode',
                                                            'size': 'sizeCode',
                                                            'color': 'attributeCode'
                                                        };
                                                        if (map[param.slug]) onUpdateField(map[param.slug], val);
                                                    }
                                                }}
                                                options={param.slug === 'quality'
                                                    ? CLOTHING_QUALITIES.map(q => ({
                                                        id: q.code,
                                                        title: q.name,
                                                    }))
                                                    : allAttributes
                                                        .filter(a => a.type === param.slug)
                                                        .map(attr => {
                                                            // For colors: first check meta.hex from DB, then fallback to name mapping
                                                            let colorHex: string | undefined = undefined;
                                                            if (param.slug === 'color') {
                                                                // Robust meta parsing (meta can be object or JSON string)
                                                                let meta: unknown = attr.meta;
                                                                if (typeof meta === 'string') {
                                                                    try { meta = JSON.parse(meta); } catch { meta = {}; }
                                                                }
                                                                const typedMeta = meta as { hex?: string } | null;
                                                                colorHex = typedMeta?.hex || getColorHex(attr.name) || undefined;
                                                            }
                                                            return {
                                                                id: attr.value,
                                                                title: attr.name,
                                                                color: colorHex
                                                            };
                                                        })
                                                }
                                                placeholder="—"
                                                compact={true}
                                            />
                                        ) : (
                                            <div
                                                className="text-lg font-bold text-slate-900 leading-tight group-hover:text-black transition-colors overflow-hidden text-ellipsis cursor-pointer"
                                                onDoubleClick={onEdit}
                                            >
                                                {attrLabel}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}
