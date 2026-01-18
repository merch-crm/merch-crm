"use client";

import React from "react";
import {
    LayoutGrid,
    Scale,
    AlignLeft,
    Plus,
    ChevronDown,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryItem, Category, AttributeType, InventoryAttribute } from "../../../types";
import { Badge } from "@/components/ui/badge";

interface ItemGeneralInfoProps {
    item: InventoryItem;
    isEditing: boolean;
    categories: Category[];
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    measurementUnits: any[];
    editData: any;
    onUpdateField: (field: string, value: any) => void;
    onUpdateAttribute: (key: string, value: string) => void;
}

export function ItemGeneralInfo({
    item,
    isEditing,
    categories,
    attributeTypes,
    allAttributes,
    measurementUnits,
    editData,
    onUpdateField,
    onUpdateAttribute
}: ItemGeneralInfoProps) {
    // Filter attribute types applicable to this item's category
    const relevantAttributeTypes = attributeTypes.filter(type =>
        !type.categoryId || type.categoryId === (isEditing ? editData.categoryId : item.categoryId)
    );

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Description Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Описание изделия</h3>
                </div>

                <div className="bg-slate-50/50 rounded-[20px] p-6 border border-slate-100">
                    {isEditing ? (
                        <textarea
                            value={editData.description || ""}
                            onChange={(e) => onUpdateField("description", e.target.value)}
                            placeholder="Опишите особенности, материалы или правила ухода..."
                            className="w-full min-h-[120px] bg-white border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none shadow-sm font-medium"
                        />
                    ) : (
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {item.description || "Описание отсутствует"}
                        </p>
                    )}
                </div>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Category & Unit */}
                <div className="space-y-8">


                    {/* Unit */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Scale className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Единица измерения</span>
                        </div>
                        {isEditing ? (
                            <div className="grid grid-cols-3 gap-2">
                                {measurementUnits.map(unit => (
                                    <button
                                        key={unit.id}
                                        onClick={() => onUpdateField("unit", unit.name)}
                                        className={cn(
                                            "py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                                            editData.unit === unit.name
                                                ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                        )}
                                    >
                                        {unit.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.unit}</p>
                        )}
                    </div>
                </div>

                {/* Dynamic Attributes */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Характеристики</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 bg-slate-50/50 rounded-[20px] p-6 border border-slate-100">
                        {relevantAttributeTypes.map(type => {
                            const currentValue = isEditing
                                ? (editData.attributes[type.slug] || "")
                                : (item.attributes?.[type.slug] || "");

                            const attrOptions = allAttributes.filter(a => a.type === type.slug);
                            const selectedAttr = attrOptions.find(a => a.value === currentValue);

                            return (
                                <div key={type.id} className="group/attr">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1">{type.name}</label>
                                    {isEditing ? (
                                        <select
                                            value={currentValue as string}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                onUpdateAttribute(type.slug, val);

                                                // Sync with SKU codes
                                                if (type.slug === 'quality') onUpdateField('qualityCode', val);
                                                if (type.slug === 'color') onUpdateField('attributeCode', val);
                                                if (type.slug === 'size') onUpdateField('sizeCode', val);
                                                if (type.slug === 'material') onUpdateField('materialCode', val);
                                                if (type.slug === 'brand') onUpdateField('brandCode', val);
                                            }}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                                        >
                                            <option value="">—</option>
                                            {attrOptions.map(attr => (
                                                <option key={attr.id} value={attr.value}>{attr.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-xs font-bold text-slate-900">
                                            {selectedAttr ? selectedAttr.name : (currentValue || "—")}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                        {relevantAttributeTypes.length === 0 && (
                            <div className="col-span-full py-4 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Нет характеристик</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
