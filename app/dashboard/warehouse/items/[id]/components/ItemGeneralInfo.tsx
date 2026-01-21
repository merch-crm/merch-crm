"use client";

import React from "react";
import {
    Scale,
    Zap,
    Tag,
    CheckCircle2,
    FileText,
    ArrowUpRight
} from "lucide-react";
import { InventoryItem, AttributeType, InventoryAttribute } from "../../../types";

interface ItemGeneralInfoProps {
    item: InventoryItem;
    isEditing: boolean;
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    // measurementUnits: MeasurementUnit[]; // unused
    editData: InventoryItem;
    onUpdateField: (field: string, value: string | number | null) => void;
    onUpdateAttribute: (key: string, value: string) => void;
}

export function ItemGeneralInfo({
    item,
    isEditing,
    attributeTypes,
    allAttributes,
    // measurementUnits,
    editData,
    onUpdateField,
    onUpdateAttribute
}: ItemGeneralInfoProps) {

    // Helper to get descriptive name for a code
    const getAttrLabel = (typeSlug: string, value: string | number | null | undefined) => {
        if (!value) return "—";
        const attr = allAttributes.find(a => a.type === typeSlug && a.value === value);
        return attr ? attr.name : value;
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
        { label: "Цвет/Атрибут", slug: "color", code: isEditing ? editData.attributeCode : item.attributeCode },
    ].filter(p => isEditing || p.code);

    // Filter dynamic entries to avoid duplicates
    const skuTechnicalSlugs = skuParams.map(p => p.slug);
    const skuLabels = ["Бренд", "Качество", "Материал", "Размер", "Цвет", "Цвет/Атрибут"];

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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Top Stats Row (FinTech Inspired) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[18px] border border-slate-200 shadow-sm space-y-4 ring-1 ring-slate-100 hover:ring-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <Scale className="w-5 h-5 text-indigo-600" />
                        <ArrowUpRight className="w-4 h-4 text-slate-300" />
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-slate-500">Формат учета</p>
                        <p className="text-3xl font-bold text-slate-900">{item.unit || "шт"}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[18px] border border-slate-200 shadow-sm space-y-4 group">
                    <div className="flex items-center justify-between font-bold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-900 transition-colors">Статус</span>
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-slate-400">Система</p>
                        <p className="text-2xl font-bold text-slate-950">Активно</p>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[18px] border border-white/5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <Zap className="w-5 h-5 text-indigo-400" />
                        <div className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white">Global</div>
                    </div>
                    <div>
                        <p className="text-[12px] font-medium text-white/40">Свойства</p>
                        <p className="text-2xl font-bold text-white">{allParams.length} параметров</p>
                    </div>
                </div>
            </div>

            {/* Description Area */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <h4 className="text-[12px] font-bold text-slate-400">Описание изделия</h4>
                    </div>
                </div>

                <div className="bg-slate-50/50 rounded-[18px] p-8 border border-slate-200/50">
                    {isEditing ? (
                        <textarea
                            value={editData.description || ""}
                            onChange={(e) => onUpdateField("description", e.target.value)}
                            placeholder="Правила ухода, состав, особенности..."
                            className="w-full min-h-[140px] bg-white rounded-[18px] p-6 border border-slate-200 text-slate-900 font-semibold text-sm focus:border-indigo-500 outline-none transition-all shadow-inner"
                        />
                    ) : (
                        <p className="text-base font-medium text-slate-700 leading-relaxed max-w-4xl">
                            {item.description || "Описание этой позиции еще не заполнено менеджером."}
                        </p>
                    )}
                </div>
            </div>

            {/* Parameters Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-2">
                    <Tag className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-[12px] font-bold text-slate-400">Техническая спецификация</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {allParams.map((param) => (
                        <div key={param.slug} className="bg-white p-6 rounded-[18px] border border-slate-100 shadow-sm transition-all hover:shadow-md group">
                            <div className="flex items-center gap-2 mb-4">
                                {param.isSku ? (
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                ) : (
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                )}
                                <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-900 transition-colors">{param.label}</span>
                            </div>

                            {isEditing ? (
                                <select
                                    value={(param.code as string) || ""}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        onUpdateAttribute(param.slug, val);
                                        if (param.isSku) {
                                            const map: Record<string, string> = {
                                                'quality': 'qualityCode',
                                                'brand': 'brandCode',
                                                'material': 'materialCode',
                                                'size': 'sizeCode',
                                                'color': 'attributeCode'
                                            };
                                            if (map[param.slug]) onUpdateField(map[param.slug], val);
                                        }
                                    }}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[18px] px-3 py-2 text-[12px] font-semibold text-slate-950 focus:border-indigo-500 outline-none appearance-none"
                                >
                                    <option value="">—</option>
                                    {allAttributes.filter(a => a.type === param.slug).map(attr => (
                                        <option key={attr.id} value={attr.value}>{attr.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="text-sm font-bold text-slate-900 truncate">
                                    {getAttrLabel(param.slug, param.code as string | number | null | undefined)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
