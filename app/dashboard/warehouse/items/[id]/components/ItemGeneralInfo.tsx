"use client";

import React from "react";
import {
    Scale,
    Zap,
    Tag,
    X,
    Sparkles,
    Fingerprint,
    Box,
    Ruler,
    Droplets,
    Search,
    MoreHorizontal,
} from "lucide-react";
import { QualityDropdown } from "../../../quality-dropdown";
import { InventoryItem, AttributeType, InventoryAttribute } from "../../../types";
import { Session } from "@/lib/auth";
import { UnitSelect } from "@/components/ui/unit-select";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ItemGeneralInfoProps {
    item: InventoryItem;
    isEditing: boolean;
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    // measurementUnits: MeasurementUnit[]; // unused
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
    // measurementUnits,
    editData,
    onUpdateField,
    onUpdateAttribute,
    user,
    totalStock,
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
        };
        const lowerLabel = label.toLowerCase();
        for (const [key, hex] of Object.entries(colors)) {
            if (lowerLabel.includes(key)) return hex;
        }
        return null;
    };

    // Param mapping for Clean Minimal style
    const getParamConfig = (slug: string, hexColor?: string | null): { icon: React.ElementType, gradient: string, customHex?: string } => {
        const configs: Record<string, { icon: React.ElementType, gradient: string }> = {
            "quality": { icon: Sparkles, gradient: "from-slate-400 to-slate-600" },
            "brand": { icon: Fingerprint, gradient: "from-slate-400 to-slate-600" },
            "material": { icon: Box, gradient: "from-slate-400 to-slate-600" },
            "size": { icon: Ruler, gradient: "from-slate-400 to-slate-600" },
            "color": { icon: Droplets, gradient: "from-slate-400 to-slate-600" },
        };

        const config = configs[slug] || { icon: Search, gradient: "from-slate-300 to-slate-500" };

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

    const isAdmin = user?.roleName === 'Администратор' || user?.roleName === 'Руководство';
    const totalValue = totalStock * (item.costPrice || 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Parameters Grid */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allParams.map((param) => {
                        const attrLabel = getAttrLabel(param.slug, param.code as string | number | null);
                        const hexColor = getColorHex(attrLabel);
                        const config = getParamConfig(param.slug, hexColor);
                        const Icon = config.icon;

                        return (
                            <div key={param.slug} className="group bg-slate-50 rounded-2xl p-4 border border-slate-100 transition-all hover:border-primary/60 hover:ring-1 hover:ring-primary/10 flex items-center justify-start gap-4 text-left">
                                {/* 3D-like Icon/Color Container */}
                                <div
                                    className={cn(
                                        "w-10 h-10 shrink-0 flex items-center justify-center relative transition-all duration-500 group-hover:scale-110",
                                        param.slug === 'color' ? "rounded-full" : "rounded-xl",
                                        !config.customHex ? "bg-slate-100 text-slate-500" : "text-white"
                                    )}
                                    style={config.customHex ? {
                                        backgroundColor: config.customHex,
                                        boxShadow: `0 4px 12px ${config.customHex}40`,
                                        border: attrLabel.toLowerCase().includes('белый') ? '1px solid #e2e8f0' : 'none'
                                    } : undefined}
                                >
                                    {param.slug === 'color' && config.customHex ? (
                                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                                            <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]" />
                                            <Icon className="w-5 h-5 text-slate-900/20" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-white/40 rounded-xl" />
                                            <Icon className="w-5 h-5 relative z-10" />
                                        </>
                                    )}
                                </div>

                                <div className="space-y-0.5 min-w-0">
                                    <div className="min-w-0">
                                        {isEditing ? (
                                            param.slug === 'quality' ? (
                                                <QualityDropdown
                                                    value={param.code as string || ""}
                                                    onChange={(name: string, code: string) => {
                                                        onUpdateAttribute(param.slug, code);
                                                        onUpdateField('qualityCode', code);
                                                    }}
                                                    compact={true}
                                                    className="w-full"
                                                />
                                            ) : (
                                                <select
                                                    value={(param.code as string) || ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        onUpdateAttribute(param.slug, val);
                                                        if (param.isSku) {
                                                            const map: Record<string, string> = {
                                                                'brand': 'brandCode',
                                                                'material': 'materialCode',
                                                                'size': 'sizeCode',
                                                                'color': 'attributeCode'
                                                            };
                                                            if (map[param.slug]) onUpdateField(map[param.slug], val);
                                                        }
                                                    }}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[14px] font-bold text-slate-900 focus:bg-white focus:border-primary outline-none appearance-none transition-all"
                                                >
                                                    <option value="">—</option>
                                                    {allAttributes.filter(a => a.type === param.slug).map(attr => (
                                                        <option key={attr.id} value={attr.value}>{attr.name}</option>
                                                    ))}
                                                </select>
                                            )
                                        ) : (
                                            <div
                                                className="text-lg font-bold text-slate-900 tracking-tight leading-tight group-hover:text-black transition-colors overflow-hidden text-ellipsis cursor-pointer"
                                                onDoubleClick={onEdit}
                                            >
                                                {attrLabel}
                                            </div>
                                        )}
                                    </div>
                                    <span className="block text-[11px] font-medium text-slate-400 transition-colors group-hover:text-slate-500 uppercase tracking-wider">
                                        {param.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
