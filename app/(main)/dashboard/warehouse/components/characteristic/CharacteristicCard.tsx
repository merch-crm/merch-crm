"use client";
import { cn } from "@/lib/utils";
import { Plus, Settings, Pencil } from "lucide-react";
import { InventoryAttribute as Attribute, AttributeType } from "../../types";
import { getColorHex } from "../../hooks/use-warehouse-characteristic";

interface CharacteristicCardProps {
    type: AttributeType;
    attributes: Attribute[];
    openEditType: (type: AttributeType) => void;
    openEditValue: (attr: Attribute) => void;
    openAddValue: (slug: string) => void;
}

export function CharacteristicCard({
    type,
    attributes: allAttributes,
    openEditType,
    openEditValue,
    openAddValue
}: CharacteristicCardProps) {
    let typeAttributes = allAttributes.filter(a => a.type === type.slug);

    if (type.slug === "size") {
        const sizeOrder = ["kids", "s", "s-m", "m", "l", "xl"];
        typeAttributes = [...typeAttributes].sort((a, b) => {
            const indexA = sizeOrder.indexOf(a.name.toLowerCase());
            const indexB = sizeOrder.indexOf(b.name.toLowerCase());
            if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });
    }

    return (
        <div className="crm-card flex flex-col h-full group shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                        <span className="font-bold text-xl leading-none pt-0.5">{type.name[0]}</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{type.name}</h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {type.isSystem && (
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[4px]">
                                    Sys
                                </span>
                            )}
                            {type.showInSku && (
                                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-[4px]">
                                    Sku
                                </span>
                            )}
                            {type.showInName && (
                                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-[4px]">
                                    Name
                                </span>
                            )}
                            {!type.isSystem && !type.showInSku && !type.showInName && (
                                <span className="text-xs font-bold text-slate-400 px-1">
                                    {type.slug}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {typeAttributes.length} шт
                    </span>
                    <button type="button"
                        onClick={() => openEditType(type)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1">
                <div className="grid grid-cols-2 gap-2">
                    {typeAttributes.map(attr => (
                        <button type="button"
                            key={attr.id}
                            onClick={() => openEditValue(attr)}
                            className={cn(
                                "relative group/val flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-[10px] text-sm font-semibold text-slate-700 transition-all active:scale-[0.98] hover:bg-white hover:shadow-sm hover:border-slate-200 cursor-pointer overflow-hidden",
                                attr.semanticColor && "pl-2"
                            )}
                        >
                            {type.slug === "color" ? (
                                <span
                                    className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/5 flex-shrink-0"
                                    style={{ backgroundColor: getColorHex(attr.meta) }}
                                />
                            ) : (
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white text-slate-600 border border-slate-200 flex-shrink-0 shadow-sm">
                                    {["size", "material"].includes(type.slug)
                                        ? attr.value
                                        : attr.name.substring(0, 1).toUpperCase()}
                                </span>
                            )}

                            <span className="text-[13px] font-semibold text-slate-700 truncate group-hover/item:text-indigo-600 transition-colors flex-1 pr-4 text-left">
                                {attr.name}
                            </span>

                            <div className="absolute right-2 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-indigo-500">
                                <Pencil className="w-3.5 h-3.5" />
                            </div>
                        </button>
                    ))}

                    {typeAttributes.length === 0 && (
                        <div className="col-span-2 py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                            <span className="text-sm font-medium text-slate-400">Нет значений</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
                <button type="button"
                    onClick={() => openAddValue(type.slug)}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-slate-200 text-slate-400 font-semibold text-[13px] hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-200 group/add"
                >
                    <Plus className="w-4 h-4 transition-transform" />
                    Добавить значение
                </button>
            </div>
        </div>
    );
}
