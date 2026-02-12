"use client";

import { useState, useEffect, type ReactNode, type ComponentType } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ColorPicker } from "@/components/ui/color-picker";
import { Plus, Settings, Check, Book, Pencil, Trash2, Lock, AlertCircle, Loader2, Layers } from "lucide-react";
import { createInventoryAttribute, deleteInventoryAttribute, updateInventoryAttribute, updateInventoryAttributeType, deleteInventoryAttributeType } from "./actions";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { PremiumSelect } from "@/components/ui/premium-select";
import { Session } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { InventoryAttribute as Attribute, AttributeType } from "./types";
import { getCategoryIcon } from "./category-utils";
import React, { useMemo } from "react";

const RUSSIAN_TO_LATIN_MAP: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '_'
};

const DESIRED_CATEGORY_ORDER = ["Одежда", "Упаковка", "Расходники"];

const getColorHex = (meta: unknown): string => {
    if (typeof meta === 'object' && meta !== null && 'hex' in meta) {
        return (meta as { hex: string }).hex;
    }
    return "#000000";
};

const transliterateToSku = (text: string) => {
    const transliterated = text.toLowerCase().split('').map(char => {
        if (char === ' ') return '';
        return RUSSIAN_TO_LATIN_MAP[char] || char;
    }).join('').replace(/[^a-z0-9]/g, '');
    return transliterated.substring(0, 3);
};

function SwitchWrapper({
    checked,
    onChange,
    disabled,
    label,
    icon: Icon,
    description,
    variant
}: {
    checked: boolean,
    onChange: (val: boolean) => void,
    disabled?: boolean,
    label?: ReactNode,
    icon?: ComponentType<{ className?: string }>,
    description?: string,
    variant?: "primary" | "success"
}) {
    return (
        <div className={cn(
            "flex items-center justify-between group",
            disabled && "opacity-50"
        )}>
            <div className="flex flex-col gap-0.5">
                {label && (
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-900 leading-[1.1]">{label}</span>
                        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 mt-1" />}
                    </div>
                )}
                {description && <span className="text-[9px] text-slate-500 font-bold leading-tight uppercase tracking-wider mt-0.5">{description}</span>}
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onChange}
                disabled={disabled}
                variant={variant}
            />
        </div>
    );
}

interface Category {
    id: string;
    name: string;
    parentId?: string | null;
}

interface CharacteristicProps {
    attributes?: Attribute[];
    attributeTypes?: AttributeType[];
    categories?: Category[];
    user?: Session | null;
}

export function WarehouseCharacteristic({ attributes = [], attributeTypes = [], categories = [], user }: CharacteristicProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Explicitly sort categories to match the main warehouse view
    const rootCategories = useMemo(() => {
        return categories
            .filter(c => !c.parentId)
            .sort((a, b) => {
                const indexA = DESIRED_CATEGORY_ORDER.indexOf(a.name);
                const indexB = DESIRED_CATEGORY_ORDER.indexOf(b.name);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
    }, [categories]);

    const hasUncategorized = attributeTypes.some(t => !t.categoryId);

    const [activeCategoryId, setActiveCategoryId] = useState<string>(() => {
        const cat = searchParams.get("cat");
        if (cat) return cat;
        if (rootCategories.length > 0) return rootCategories[0].id;
        if (hasUncategorized) return "uncategorized";
        return "";
    });

    const handleCategoryChange = (id: string) => {
        setActiveCategoryId(id);
        const params = new URLSearchParams(searchParams.toString());
        params.set("cat", id);
        window.history.replaceState(null, '', `?${params.toString()}`);
    };

    // Ensure we have a valid selection on data updates
    useEffect(() => {
        const cat = searchParams.get("cat");
        if (cat) {
            setActiveCategoryId(cat);
            return;
        }

        const isActiveValid = activeCategoryId === "uncategorized" || rootCategories.some(c => c.id === activeCategoryId);
        if (!activeCategoryId || !isActiveValid) {
            if (rootCategories.length > 0) {
                setActiveCategoryId(rootCategories[0].id);
            } else if (hasUncategorized) {
                setActiveCategoryId("uncategorized");
            }
        }
    }, [rootCategories, hasUncategorized, activeCategoryId, searchParams]);

    // State for Value Editor (Add/Edit)
    const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
    const [targetTypeSlug, setTargetTypeSlug] = useState<string | null>(null); // Which type are we editing/adding to?
    const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null); // If null, we are adding new

    // Form State
    const [newItemName, setNewItemName] = useState("");
    const [newItemCode, setNewItemCode] = useState("");
    const [newItemColorHex, setNewItemColorHex] = useState("#000000");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    // Delete State
    const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Type Delete State
    const [typeToDelete, setTypeToDelete] = useState<AttributeType | null>(null);
    const [isDeletingType, setIsDeletingType] = useState(false);

    // Edit Type State (Metadata)
    const [editingType, setEditingType] = useState<AttributeType | null>(null);
    const [editTypeName, setEditTypeName] = useState("");
    const [editTypeCategoryId, setEditTypeCategoryId] = useState<string>("uncategorized");
    const [editTypeIsSystem, setEditTypeIsSystem] = useState(false);
    const [editTypeShowInSku, setEditTypeShowInSku] = useState(true);
    const [editTypeShowInName, setEditTypeShowInName] = useState(true);
    const [isEditTypeLoading, setIsEditTypeLoading] = useState(false);

    // Computed Editing Data
    // We fetch fresh data from props based on editingType.id to ensure list is up to date after refreshes
    const editingTypeLatest = editingType ? attributeTypes.find(t => t.id === editingType.id) : null;
    const editingTypeValues = editingTypeLatest ? attributes.filter(a => a.type === editingTypeLatest.slug) : [];

    const { toast } = useToast();

    // Filter types by active category
    const filteredTypes = activeCategoryId === "uncategorized"
        ? attributeTypes.filter(t => !t.categoryId)
        : attributeTypes.filter(t => t.categoryId === activeCategoryId);

    function openAddValue(typeSlug: string) {
        setTargetTypeSlug(typeSlug);
        setEditingAttribute(null);
        setNewItemName("");
        setNewItemCode("");
        setIsCodeManuallyEdited(false);
        setNewItemColorHex("#000000");
        setError("");
        setIsValueDialogOpen(true);
    }

    function openEditValue(attr: Attribute) {
        setTargetTypeSlug(attr.type);
        setEditingAttribute(attr);
        setNewItemName(attr.name);

        // Robust meta parsing
        let meta: unknown = attr.meta;
        if (typeof meta === 'string') {
            try { meta = JSON.parse(meta); } catch { meta = {}; }
        } else if (!meta) {
            meta = {};
        }

        const typedMeta = meta as { hex?: string; showInName?: boolean; showInSku?: boolean };

        setNewItemCode(attr.value);
        setIsCodeManuallyEdited(true);
        setNewItemColorHex(typedMeta?.hex || "#000000");
        setError("");
        setIsValueDialogOpen(true);
    }

    async function handleValueSave() {
        if (!newItemName.trim()) { setError("Введите название"); return; }
        if (!newItemCode.trim()) { setError("Введите код"); return; }
        if (!targetTypeSlug) return;

        setError("");
        setIsSaving(true);

        const meta = {
            ...(targetTypeSlug === "color" ? { hex: newItemColorHex } : {}),
        };

        try {
            let res;
            if (editingAttribute) {
                res = await updateInventoryAttribute(editingAttribute.id, newItemName, newItemCode, meta);
            } else {
                res = await createInventoryAttribute(targetTypeSlug, newItemName, newItemCode, meta);
            }

            if (res.error) {
                setError(res.error);
            } else {
                toast(editingAttribute ? "Обновлено успешно" : "Добавлено успешно", "success");
                setIsValueDialogOpen(false);
                router.refresh();
            }
        } catch (err) {
            console.error("[WAREHOUSE_CHARACTERISTIC] Save error:", err);
            setError("Ошибка при сохранении");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteConfirm() {
        if (!attributeToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteInventoryAttribute(attributeToDelete.id);
            if (res.success) {
                toast("Удалено успешно", "success");
                setAttributeToDelete(null);
                // If we were editing this item, close the dialog
                if (editingAttribute?.id === attributeToDelete.id) {
                    setIsValueDialogOpen(false);
                }
                router.refresh();
            } else {
                toast(res.error || "Ошибка при удалении", "error");
            }
        } catch (err) {
            console.error("[WAREHOUSE_CHARACTERISTIC] Delete error:", err);
            toast("Ошибка при удалении", "error");
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleDeleteTypeConfirm() {
        if (!typeToDelete) return;
        setIsDeletingType(true);
        try {
            const res = await deleteInventoryAttributeType(typeToDelete.id, deletePassword);
            if (res.success) {
                toast("Раздел удален", "success");
                setTypeToDelete(null);
                setDeletePassword("");
                setEditingType(null);
                router.refresh();
            } else {
                toast(res.error || "Ошибка удаления", "error");
                setDeletePassword("");
            }
        } catch (err) {
            console.error("[WAREHOUSE_CHARACTERISTIC] Delete type error:", err);
            toast("Ошибка удаления", "error");
            setDeletePassword("");
        } finally {
            setIsDeletingType(false);
        }
    }

    function handleEditTypeClick(type: AttributeType, e: React.MouseEvent) {
        e.stopPropagation();
        setEditingType(type);
        setEditTypeName(type.name);
        setEditTypeCategoryId(type.categoryId || "uncategorized");
        setEditTypeIsSystem(type.isSystem || false);
        setEditTypeShowInSku(type.showInSku ?? true);
        setEditTypeShowInName(type.showInName ?? true);
    }

    async function handleUpdateType() {
        if (!editingType || !editTypeName.trim()) return;
        setIsEditTypeLoading(true);
        try {
            const catId = editTypeCategoryId === "uncategorized" ? null : editTypeCategoryId;
            const res = await updateInventoryAttributeType(
                editingType.id,
                editTypeName,
                catId,
                editTypeIsSystem,
                editTypeShowInSku,
                editTypeShowInName
            );
            if (res.success) {
                toast("Раздел обновлен", "success");
                setEditingType(null);
                router.refresh();
            } else {
                toast(res.error || "Ошибка обновления", "error");
            }
        } catch (err) {
            console.error("[WAREHOUSE_CHARACTERISTIC] Update type error:", err);
            toast("Ошибка обновления", "error");
        } finally {
            setIsEditTypeLoading(false);
        }
    }

    const activeCategoryName = activeCategoryId === "uncategorized"
        ? "Без категории"
        : (categories.find(c => c.id === activeCategoryId)?.name || "Категория");

    return (
        <div className="space-y-8 pb-20">
            {/* Category Tabs */}
            <div className="crm-card flex w-full overflow-x-auto h-[58px] items-center gap-2 !p-[6px] !rounded-[22px] scrollbar-hide">
                {rootCategories.map((cat) => {
                    const isActive = activeCategoryId === cat.id;
                    const Icon = getCategoryIcon(cat);

                    return (
                        <Button
                            key={cat.id}
                            asChild
                            variant="ghost"
                            className="p-0 border-none bg-transparent hover:bg-transparent shadow-none flex-1 h-full"
                        >
                            <button
                                onClick={() => handleCategoryChange(cat.id)}
                                title={cat.name}
                                className={cn(
                                    "relative w-full h-full shrink-0 px-4 !rounded-[16px] text-sm font-bold group whitespace-nowrap flex items-center justify-center gap-2 transition-colors duration-200",
                                    isActive ? "text-white" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeCategoryTab"
                                        className="absolute inset-0 bg-slate-900 !rounded-[16px] shadow-lg shadow-slate-900/10 z-0"
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    <Icon className="w-5 h-5 shrink-0" />
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn("hidden md:inline-block", isActive && "inline-block")}
                                        >
                                            {cat.name}
                                        </motion.span>
                                    </AnimatePresence>
                                </span>
                            </button>
                        </Button>
                    );
                })}
                {hasUncategorized && (
                    <Button
                        asChild
                        variant="ghost"
                        className="p-0 border-none bg-transparent hover:bg-transparent shadow-none flex-1 h-full"
                    >
                        <button
                            onClick={() => handleCategoryChange("uncategorized")}
                            title="Без категории"
                            className={cn(
                                "relative w-full h-full shrink-0 px-4 !rounded-[16px] text-sm font-bold group whitespace-nowrap flex items-center justify-center transition-colors duration-200",
                                activeCategoryId === "uncategorized" ? "text-white" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {activeCategoryId === "uncategorized" && (
                                <motion.div
                                    layoutId="activeCategoryTab"
                                    className="absolute inset-0 bg-slate-900 !rounded-[16px] shadow-lg shadow-slate-900/10"
                                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Layers className="w-5 h-5 shrink-0" />
                                <AnimatePresence mode="popLayout" initial={false}>
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                        className={cn("hidden md:inline-block", activeCategoryId === "uncategorized" && "inline-block")}
                                    >
                                        Без категории
                                    </motion.span>
                                </AnimatePresence>
                            </span>
                        </button>
                    </Button>
                )}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[var(--crm-grid-gap)]">
                        {filteredTypes.map(type => {
                            let typeAttributes = attributes.filter(a => a.type === type.slug);

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
                                <div
                                    key={type.id}
                                    className="crm-card flex flex-col h-full group shadow-sm hover:shadow-md transition-shadow duration-300"
                                >
                                    {/* Header Variant B (Structured) */}
                                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            {/* Gradient Icon */}
                                            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                                                <span className="font-bold text-xl leading-none pt-0.5">{type.name[0]}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{type.name}</h3>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {type.isSystem && (
                                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider">
                                                            Sys
                                                        </span>
                                                    )}
                                                    {type.showInSku && (
                                                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider">
                                                            Sku
                                                        </span>
                                                    )}
                                                    {type.showInName && (
                                                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider">
                                                            Name
                                                        </span>
                                                    )}
                                                    {!type.isSystem && !type.showInSku && !type.showInName && (
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">
                                                            {type.slug}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                                {typeAttributes.length} шт
                                            </span>
                                            <button
                                                onClick={(e) => handleEditTypeClick(type, e)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Grid Layout */}
                                    <div className="flex-1">
                                        <div className="grid grid-cols-2 gap-2">
                                            {typeAttributes.map(attr => (
                                                <button
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
                                                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-white text-slate-600 border border-slate-200 flex-shrink-0 shadow-sm">
                                                            {["size", "material"].includes(type.slug)
                                                                ? attr.value
                                                                : attr.name.substring(0, 1).toUpperCase()}
                                                        </span>
                                                    )}

                                                    <span className="text-[13px] font-semibold text-slate-700 truncate group-hover/item:text-indigo-600 transition-colors flex-1 pr-4 text-left">
                                                        {attr.name}
                                                    </span>

                                                    {/* Pencil Icon on Hover */}
                                                    <div className="absolute right-2 opacity-0 group-hover/item:opacity-100 transform translate-x-2 group-hover/item:translate-x-0 transition-all duration-200 text-indigo-500">
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

                                    {/* Footer Button Variant B */}
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={() => openAddValue(type.slug)}
                                            className="w-full h-11 flex items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-slate-200 text-slate-400 font-semibold text-[13px] hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all duration-200 group/add"
                                        >
                                            <Plus className="w-4 h-4 transition-transform" />
                                            Добавить значение
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredTypes.length === 0 && (
                            <div className="col-span-full py-16 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <Book className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">Нет характеристик</h3>
                                <p className="text-slate-500">
                                    {activeCategoryId === "uncategorized"
                                        ? "Все характеристики распределены по категориям"
                                        : `В категории «${activeCategoryName}» пока нет созданных типов характеристик`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Type Dialog (Full Editor) */}
            <ResponsiveModal
                isOpen={!!editingType}
                onClose={() => setEditingType(null)}
                hideClose
                title="Настройка раздела"
                showVisualTitle={false}
                className="w-full md:max-w-2xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
            >
                <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-indigo-50 flex items-center justify-center shrink-0 shadow-sm border border-indigo-100/50">
                                <Settings className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">Настройка раздела</h2>
                                <p className="text-[11px] font-medium text-slate-500 mt-0.5">Управление характеристиками и их значениями</p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 space-y-4 shrink-0 bg-slate-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Название раздела</label>
                                <Input
                                    value={editTypeName}
                                    onChange={e => setEditTypeName(e.target.value)}
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm text-slate-900 shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Категория</label>
                                <PremiumSelect
                                    value={editTypeCategoryId}
                                    onChange={setEditTypeCategoryId}
                                    options={[
                                        ...rootCategories
                                            .filter(c => c.name.toLowerCase() !== "без категории")
                                            .map(c => ({ id: c.id, title: c.name })),
                                        { id: "uncategorized", title: "Без категории" }
                                    ]}
                                    placeholder="Выберите категорию"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm relative overflow-hidden">
                            <SwitchWrapper
                                checked={editTypeIsSystem}
                                onChange={setEditTypeIsSystem}
                                disabled={user?.roleName !== "Администратор"}
                                label="Системная характеристика"
                                description={editTypeIsSystem && user?.roleName !== "Администратор" ? "(только для Администратора)" : "Доступна везде"}
                            />
                            <div className="h-px bg-slate-200/80" />
                            <div className="flex items-stretch gap-0 pt-1">
                                <div className="flex-1">
                                    <SwitchWrapper
                                        checked={editTypeShowInSku}
                                        onChange={setEditTypeShowInSku}
                                        variant="success"
                                        label={
                                            <span className="sm:whitespace-nowrap">
                                                <span className="sm:hidden">Добавлять<br />в артикул</span>
                                                <span className="hidden sm:inline">Добавлять в артикул</span>
                                            </span>
                                        }
                                        description="Будет в SKU"
                                    />
                                </div>
                                <div className="w-px bg-slate-200/80 mx-4 self-stretch" />
                                <div className="flex-1">
                                    <SwitchWrapper
                                        checked={editTypeShowInName}
                                        onChange={setEditTypeShowInName}
                                        variant="success"
                                        label={
                                            <span className="sm:whitespace-nowrap">
                                                <span className="sm:hidden">Добавлять<br />в название</span>
                                                <span className="hidden sm:inline">Добавлять в название</span>
                                            </span>
                                        }
                                        description="Будет в имени"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-y-auto custom-scrollbar px-6 pb-8 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-bold text-slate-700 ml-1">Значения ({editingTypeValues.length})</label>
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => editingTypeLatest && openAddValue(editingTypeLatest.slug)}
                                className="sm:w-auto sm:px-3 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-all active:scale-95 shrink-0 mr-1"
                            >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span className="whitespace-nowrap hidden sm:inline">Добавить</span>
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {editingTypeValues.map(attr => (
                                <div
                                    key={attr.id}
                                    onClick={() => openEditValue(attr)}
                                    className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-[20px] cursor-pointer hover:bg-white hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 border border-transparent hover:border-slate-100 group"
                                >
                                    {/* Visual Preview */}
                                    {editingTypeLatest?.slug === "color" && (
                                        <div className={cn(
                                            "w-9 h-9 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1)] flex-shrink-0",
                                            ((attr.meta as { hex?: string })?.hex?.toLowerCase() === '#ffffff') && "shadow-[inset_0_0_0_1px_#e2e8f0,0_4px_10px_rgba(0,0,0,0.05)]"
                                        )} style={{ backgroundColor: getColorHex(attr.meta) }} />
                                    )}
                                    {editingTypeLatest && (editingTypeLatest.slug === "size" || editingTypeLatest.slug === "material") && (
                                        <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-900 border border-slate-200 flex-shrink-0 uppercase">
                                            {attr.value.substring(0, 3)}
                                        </div>
                                    )}
                                    {editingTypeLatest && !["color", "size", "material"].includes(editingTypeLatest.slug) && (
                                        <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-primary font-bold text-[10px] flex-shrink-0 border border-primary/10">
                                            {attr.value.substring(0, 1)}
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center gap-1">
                                        <div className="font-bold text-[12px] text-slate-600 text-center leading-tight">{attr.name}</div>
                                        <div className="text-[9px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 tabular-nums">{attr.value}</div>
                                    </div>
                                </div>
                            ))}


                        </div>

                        {editingTypeValues.length === 0 && (
                            <div className="col-span-full text-center py-10 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[var(--radius-inner)]">
                                <p className="text-[11px] font-bold text-slate-400 mb-2">Список значений пуст</p>
                                <Button
                                    variant="link"
                                    onClick={() => editingTypeLatest && openAddValue(editingTypeLatest.slug)}
                                    className="text-primary text-[10px] font-bold h-auto p-0"
                                >
                                    Добавить первое значение
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sticky bottom-0 z-10 p-4 sm:p-6 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center shrink-0 sm:rounded-b-[var(--radius-outer)] gap-4 mt-auto">
                    {editingTypeLatest && (
                        <Button
                            variant="ghost"
                            onClick={() => setTypeToDelete(editingTypeLatest)}
                            disabled={editingTypeLatest.isSystem && user?.roleName !== "Администратор"}
                            className="h-11 px-6 font-bold text-sm flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-[var(--radius-inner)] transition-all disabled:opacity-30 disabled:grayscale shrink-0"
                        >
                            <Trash2 className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline whitespace-nowrap">Удалить раздел</span>
                            <span className="sm:hidden whitespace-nowrap">Удалить</span>
                        </Button>
                    )}

                    <div className="flex items-center gap-3 ml-auto">
                        <Button
                            variant="action"
                            onClick={() => setEditingType(null)}
                            className="hidden md:flex h-11 px-8 text-slate-400 hover:text-slate-600 font-bold text-sm border-none bg-transparent hover:bg-slate-50"
                        >
                            Отмена
                        </Button>

                        <Button
                            onClick={handleUpdateType}
                            disabled={isEditTypeLoading}
                            variant="btn-dark"
                            className="px-10 h-11 rounded-[var(--radius-inner)] text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isEditTypeLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 stroke-[3] text-white" />
                            )}
                            Сохранить
                        </Button>
                    </div>
                </div>
            </ResponsiveModal>

            {/* Add/Edit Value Dialog */}
            <ResponsiveModal
                isOpen={isValueDialogOpen}
                onClose={() => setIsValueDialogOpen(false)}
                hideClose
                className="w-full sm:max-w-md flex flex-col p-0 overflow-visible rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
            >
                <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-primary/10 flex items-center justify-center shrink-0">
                                {editingAttribute ? <Pencil className="w-6 h-6 text-primary" /> : <Plus className="w-6 h-6 text-primary" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                                    {editingAttribute ? "Изменить значение" : "Новое значение"}
                                </h2>
                                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                    Раздел: <span className="text-primary font-bold">{attributeTypes.find(t => t.slug === targetTypeSlug)?.name}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6 pb-4 bg-slate-50/30 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Название</label>
                                <Input
                                    value={newItemName}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setNewItemName(val);
                                        if (!isCodeManuallyEdited) {
                                            setNewItemCode(transliterateToSku(val));
                                        }
                                    }}
                                    placeholder="Напр: Синий"
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700 ml-1">Код (SKU)</label>
                                <Input
                                    value={newItemCode}
                                    onChange={e => {
                                        setNewItemCode(e.target.value.toUpperCase());
                                        setIsCodeManuallyEdited(true);
                                    }}
                                    placeholder="BLU"
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-slate-50 border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-mono transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                                />
                            </div>
                        </div>

                        {targetTypeSlug === "color" && (
                            <div className="space-y-1.5 pt-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Цвет (HEX)</label>
                                <ColorPicker
                                    color={newItemColorHex}
                                    onChange={setNewItemColorHex}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-[var(--radius-inner)] bg-rose-50 text-rose-600 border border-rose-100 animate-in shake duration-500 mt-4">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <p className="text-[10px] font-bold leading-tight">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="sticky bottom-0 z-10 p-5 pt-3 flex flex-row items-center justify-between gap-3 shrink-0 bg-white border-t border-slate-100 sm:rounded-b-[var(--radius-outer)]">
                        {editingAttribute ? (
                            <Button
                                variant="ghost"
                                onClick={() => setAttributeToDelete(editingAttribute)}
                                className="h-11 px-4 font-bold text-sm flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-[var(--radius-inner)]"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Удалить</span>
                            </Button>
                        ) : (
                            <div />
                        )}
                        <div className="flex items-center gap-3 ml-auto">
                            <Button
                                variant="ghost"
                                onClick={() => setIsValueDialogOpen(false)}
                                className="h-11 px-4 text-slate-400 hover:text-slate-600 font-bold text-sm"
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={handleValueSave}
                                disabled={isSaving || !newItemName.trim() || !newItemCode.trim()}
                                variant="btn-dark"
                                className="h-11 px-6 rounded-[var(--radius-inner)] text-sm font-bold flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4 stroke-[3] text-white" />
                                )}
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </div>
            </ResponsiveModal>

            <ConfirmDialog
                isOpen={!!attributeToDelete}
                onClose={() => setAttributeToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Удаление значения"
                description={`Вы уверены, что хотите удалить «${attributeToDelete?.name}»?`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeleting}
            />

            <ConfirmDialog
                isOpen={!!typeToDelete}
                onClose={() => {
                    setTypeToDelete(null);
                    setDeletePassword("");
                }}
                onConfirm={handleDeleteTypeConfirm}
                title="Удаление раздела"
                description={`Вы уверены, что хотите удалить раздел «${typeToDelete?.name}»? Все значения в нем также будут недоступны.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeletingType}
                isConfirmDisabled={!!typeToDelete?.isSystem && !deletePassword.trim()}
            >
                {typeToDelete?.isSystem && (
                    <div className="px-1 pb-4">
                        <div className="bg-rose-50 p-4 rounded-[var(--radius-inner)] border border-rose-100 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-rose-600">
                                <Lock className="w-4 h-4" />
                                <span className="text-xs font-bold ">Системная защита</span>
                            </div>
                            <p className="text-xs font-bold text-rose-500/80 leading-relaxed">
                                Это системный раздел. Для подтверждения удаления введите пароль от своей учетной записи.
                            </p>
                            <Input
                                type="password"
                                id="delete-password-input"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Пароль от своей учетной записи"
                                className="w-full h-11 px-4 rounded-[var(--radius-inner)] border border-rose-200 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-rose-200"
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </ConfirmDialog>
        </div>
    );
}
