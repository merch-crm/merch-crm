"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
    GripVertical, Settings,
    Tag, Hash, Shapes, Ruler, Palette, Box, Layers, Maximize,
    Globe, Weight, Droplets, Package, LucideIcon, Component, Waves, Wrench,
} from "lucide-react";
import { type InventoryAttribute as Attribute, type AttributeType, type AttributeMeta } from "../../types";
import { sortAttributeValues, getColorHex } from "@/app/(main)/dashboard/warehouse/utils/characteristic-helpers";

// ─── Icon map ──────────────────────────────────────────────────────────────
const DATA_TYPE_ICONS: Record<string, LucideIcon> = {
    text: Shapes, unit: Ruler, color: Palette, dimensions: Box, quantity: Hash,
    composition: Component, material: Layers, size: Maximize, brand: Tag,
    country: Globe, density: Waves, weight: Weight, volume: Droplets,
    package: Package, consumable: Wrench,
};

// ─── Shared card content ───────────────────────────────────────────────────
export function CharacteristicCardContent({
    type,
    attributes: allAttributes,
    openEditType,
    openEditValue,
    dragHandleProps,
    isOverlay,
}: {
    type: AttributeType;
    attributes: Attribute[];
    openEditType: (type: AttributeType) => void;
    openEditValue: (attr: Attribute) => void;
    dragHandleProps?: Record<string, unknown>;
    isOverlay?: boolean;
}) {
    const typeAttributes = sortAttributeValues(
        allAttributes.filter(a => a.type === type.slug),
        type.dataType || "text"
    );
    const TypeIcon = DATA_TYPE_ICONS[type.dataType || ""];

    return (
        <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "") { e.preventDefault(); openEditType(type); }
            }}
            onClick={() => openEditType(type)}
            className={cn("crm-card flex flex-col h-full group shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border hover:border-indigo-200 active:scale-[0.99]",
                isOverlay && "!border-primary shadow-crm-xl"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0 group-hover:scale-110 transition-transform">
                        {TypeIcon
                            ? <TypeIcon className="w-6 h-6" />
                            : <span className="font-bold text-xl leading-none pt-0.5">{type.name[0]}</span>}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors whitespace-normal break-words">
                            {type.name === 'Единица измерения' ? 'Ед. измерения' : type.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {type.isSystem && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[4px]">Sys</span>}
                            {type.showInSku && <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-[4px]">в арт.</span>}
                            {type.showInName && <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-[4px]">в названии</span>}
                            {!type.isSystem && !type.showInSku && !type.showInName && (
                                <span className="text-xs font-bold text-slate-400 px-1">{type.slug}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Drag handle — only when not overlay */}
                    {!isOverlay && dragHandleProps && (
                        <div
                            role="button"
                            tabIndex={0}
                            {...dragHandleProps}
                            onClick={(e) => (e as React.MouseEvent).stopPropagation()}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "") e.preventDefault(); }}
                            className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-primary cursor-grab active:cursor-grabbing transition-colors rounded-[var(--radius-inner)] hover:bg-slate-50 opacity-0 group-hover:opacity-100"
                            aria-label="Перетащить для изменения порядка"
                        >
                            <GripVertical className="w-4 h-4" />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEditType(type); }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Values grid */}
            <div className="flex-1 flex flex-col pt-2">
                <div className="flex flex-wrap gap-2 content-stretch items-stretch flex-1">
                    {typeAttributes.map((attr: Attribute) => (
                        <button
                            type="button"
                            key={attr.id}
                            onClick={(e) => { e.stopPropagation(); openEditValue(attr); }}
                            className={cn("relative group/val flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-[14px] text-sm font-semibold text-slate-700 transition-all active:scale-[0.98] hover:bg-white hover:shadow-md hover:border-slate-200 cursor-pointer overflow-hidden flex-1 min-w-[120px] h-auto min-h-[52px]",
                                attr.semanticColor && "pl-3"
                            )}
                        >
                            {type.dataType === "color" || type.slug === "color" ? (
                                <span className="w-7 h-7 rounded-full shadow-sm ring-1 ring-black/5 flex-shrink-0"
                                    style={{ backgroundColor: getColorHex(attr.meta) }} />
                            ) : (() => {
                                const Icon = DATA_TYPE_ICONS[type.dataType || ""];
                                return (
                                    <span className="w-7 h-7 rounded-full flex items-center justify-center bg-white text-primary border border-slate-200 flex-shrink-0 shadow-sm">
                                        {Icon ? <Icon className="w-3.5 h-3.5" /> : <span className="text-[12px] font-bold text-slate-600">{attr.name.substring(0, 1)}</span>}
                                    </span>
                                );
                            })()}
                            <div className="flex flex-col items-start gap-0.5 flex-1 w-full px-0.5">
                                <span className="text-[13px] font-bold text-slate-700 break-words whitespace-normal leading-tight group-hover/val:text-indigo-600 transition-colors text-left font-sans">
                                    {(() => {
                                        const rawValue = (attr.meta as AttributeMeta)?.fullName || attr.name;
                                        if (type.dataType === "country" || type.slug === "country") {
                                            return rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
                                        }
                                        return rawValue;
                                    })()}
                                    {type.dataType === "density" && !((attr.meta as AttributeMeta)?.fullName || attr.name).includes("г/м") && " г/м²"}
                                </span>
                                {(attr.meta as AttributeMeta)?.isOversize && (
                                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-xs font-black border border-indigo-100/50 group-hover/val:bg-white transition-colors leading-none mt-0.5">oversize</span>
                                )}
                            </div>
                        </button>
                    ))}
                    {typeAttributes.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-center bg-slate-50/50 rounded-[14px] border border-dashed border-slate-200 min-h-[80px]">
                            <span className="text-sm font-medium text-slate-400">Нет значений</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Sortable wrapper (used inside DndContext) ─────────────────────────────
export function SortableCharacteristicCard({
    type,
    attributes,
    openEditType,
    openEditValue,
}: {
    type: AttributeType;
    attributes: Attribute[];
    openEditType: (type: AttributeType) => void;
    openEditValue: (attr: Attribute) => void;
}) {
    const {
        attributes: dndAttrs,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: type.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // Go invisible while dragging — slot stays in layout but card is hidden
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="h-full">
            <CharacteristicCardContent
                type={type}
                attributes={attributes}
                openEditType={openEditType}
                openEditValue={openEditValue}
                dragHandleProps={{ ...dndAttrs, ...listeners }}
            />
        </div>
    );
}
