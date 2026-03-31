"use client";

import React from "react";
import {
    Pencil,
    Plus,
    X,
    LayoutGrid,
} from "lucide-react";
import { getColorHex, getParamConfig } from "./item-ui-utils";
import { CLOTHING_QUALITIES } from "@/app/(main)/dashboard/warehouse/category-utils";
import { Select } from "@/components/ui/select";
import { InventoryItem, AttributeType, InventoryAttribute } from "@/app/(main)/dashboard/warehouse/types";
import type { Session } from "@/lib/session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ItemDataProps {
    item: InventoryItem;
    editData: InventoryItem;
    attributeTypes: AttributeType[];
    allAttributes: InventoryAttribute[];
    totalStock: number;
    user: Session | null;
}

interface ItemActionProps {
    isEditing: boolean;
    onUpdateField: (field: string, value: string | number | null | boolean | Record<string, unknown>) => void;
    onUpdateAttribute: (key: string, value: string) => void;
    onRemoveAttribute?: (key: string) => void;
    onEdit?: () => void;
}

interface ItemGeneralInfoProps extends ItemDataProps, ItemActionProps { }

export const ItemGeneralInfo = React.memo(({
    item,
    isEditing,
    attributeTypes,
    allAttributes,
    editData,
    onUpdateField,
    onUpdateAttribute,
    onRemoveAttribute,
    onEdit
}: ItemGeneralInfoProps) => {
    // Helper to get descriptive name for a code
    const getAttrLabel = (typeSlug: string, value: string | number | null | undefined): string => {
        if (!value) return "—";
        const attr = allAttributes.find(a => a.type === typeSlug && a.value === value);
        let label = attr ? attr.name : String(value);

        // Страна всегда с большой буквы
        if (typeSlug === 'country' && label && label !== '—') {
            label = label.charAt(0).toUpperCase() + label.slice(1);
        }

        return label;
    };



    // Filter attribute types by current item category or its parent
    // We show attribute types that belong to this category, its parent, OR are general (no categoryId)
    const getParentCategoryId = (): string | null => {
        if (!item.category) return null;
        if (typeof item.category === 'object') {
            if ('parentId' in item.category && item.category.parentId) {
                return String(item.category.parentId);
            }
            if ('parent' in item.category && item.category.parent && typeof item.category.parent === 'object' && 'id' in item.category.parent) {
                return String(item.category.parent.id);
            }
        }
        return null;
    };

    const parentCategoryId = getParentCategoryId();

    const categoryAttributeTypes = attributeTypes.filter(t =>
        !t.categoryId ||
        t.categoryId === item.categoryId ||
        (parentCategoryId && t.categoryId === parentCategoryId)
    );

    // Get value for a given slug from either JSON attributes or legacy fields
    const getAttributeValue = (slug: string, sourceItem: InventoryItem): string | number | boolean | null | undefined => {
        // Map common slugs to legacy fields
        const legacyMap: Record<string, keyof InventoryItem> = {
            'quality': 'qualityCode',
            'brand': 'brandCode',
            'material': 'materialCode',
            'size': 'sizeCode',
            'color': 'attributeCode'
        };

        const legacyField = legacyMap[slug];
        if (legacyField && sourceItem[legacyField] !== undefined) {
            return sourceItem[legacyField] as string | number | boolean | null | undefined;
        }

        return sourceItem.attributes?.[slug];
    };

    // Build params array based on available category attribute types
    const dataSource = isEditing ? editData : item;

    // Create an array of ALL possible parameters for this category
    const allParams = categoryAttributeTypes.map(type => {
        const code = getAttributeValue(type.slug, dataSource);

        // Check if it's one of the legacy SKU fields
        const legacyMap: Record<string, string> = {
            'quality': 'qualityCode',
            'brand': 'brandCode',
            'material': 'materialCode',
            'size': 'sizeCode',
            'color': 'attributeCode'
        };
        const isSku = Object.keys(legacyMap).includes(type.slug);

        return {
            label: type.name,
            slug: type.slug,
            code: code,
            isSku: isSku,
            dataType: type.dataType
        };
    }).filter(param => {
        // In view mode, only show filled fields.
        const hasData = param.code !== undefined && param.code !== null && param.code !== "" && param.code !== "—";
        if (!isEditing) return hasData;

        // In edit mode, show if it has data OR if it was explicitly added (code is "")
        // But hide if it's strictly the "—" placeholder or null.
        return hasData || param.code === "";
    });

    const total = allParams.length;


    if (total === 0 && !isEditing) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full animate-in fade-in duration-500">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <LayoutGrid className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <h4 className="text-sm font-bold text-muted-foreground">Характеристики не указаны</h4>
                <p className="text-xs text-muted-foreground/60 mt-1 max-w-[200px]">
                    Добавьте характеристики в режиме редактирования
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={onEdit}
                    className="mt-4 h-9 rounded-xl font-bold"
                >
                    <Pencil className="w-3 h-3 mr-2" />
                    Редактировать
                </Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-1000">
            {/* Characteristics Grid */}
            <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                {allParams.map((param) => {
                    const attrLabel = getAttrLabel(param.slug, param.code as string | number | null);
                    const hexColor = getColorHex(attrLabel);

                    // Logic for dividers: every row (2 items) has a border-bottom
                    // We can use border-b on all and then handle the last row if needed, 
                    // or just use a simple grid with padding-y and border-b.
                    return (
                        <div
                            key={param.slug}
                            className={cn(
                                "flex flex-col gap-1.5 group min-w-0"
                            )}
                        >
                            {(() => {
                                const { icon } = getParamConfig(param.slug, hexColor, param.label, param.dataType);
                                const ParamIcon = icon as React.ComponentType<{ className?: string }>;
                                return (
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#8a99a8]">
                                        <ParamIcon className="w-3 h-3 shrink-0" />
                                        {param.label}
                                    </span>
                                );
                            })()}
                            <div className="flex items-center gap-2.5 min-w-0 mt-0.5">
                                {param.slug === 'color' && hexColor && (
                                    <div
                                        className="w-4 h-4 rounded-full shrink-0 border border-slate-200 shadow-sm"
                                        style={{ backgroundColor: hexColor }}
                                    />
                                )}
                                <div className="text-sm font-bold text-slate-900 truncate flex-1">
                                    {isEditing ? (
                                        <Select
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
                                        <span
                                            onDoubleClick={onEdit}
                                            className="cursor-pointer hover:text-primary transition-colors truncate block"
                                        >
                                            {attrLabel}
                                        </span>
                                    )}
                                </div>
                                {isEditing && onRemoveAttribute && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveAttribute(param.slug)}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-red-500 transition-all"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Add Characteristic Button in Edit Mode */}
                {isEditing && (
                    <div className="flex flex-col gap-1.5 py-4 min-w-0">
                        <span className="text-xs font-bold text-slate-400/70 mb-1">
                            Новое поле
                        </span>
                        <div className="relative h-11 w-full border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl hover:border-slate-300 hover:bg-slate-100/50 transition-all flex items-center justify-center overflow-hidden cursor-pointer group">
                            <Plus className="w-4 h-4 text-slate-400 mr-2" />
                            <span className="text-xs font-bold text-slate-400">Добавить характеристику</span>
                            <Select
                                value=""
                                onChange={(slug) => {
                                    if (slug) {
                                        // Setting to empty string makes it pass the filter in edit mode
                                        onUpdateAttribute(slug, "");
                                    }
                                }}
                                className="absolute inset-0 w-full h-full z-10"
                                options={(() => {
                                    return categoryAttributeTypes
                                        .filter(type => !allParams.find(p => p.slug === type.slug))
                                        .map(type => ({ id: type.slug, title: type.name }));
                                })()}
                                placeholder=""
                                compact={true}
                                triggerClassName="w-full h-full opacity-0 border-none p-0 cursor-pointer"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

ItemGeneralInfo.displayName = "ItemGeneralInfo";
