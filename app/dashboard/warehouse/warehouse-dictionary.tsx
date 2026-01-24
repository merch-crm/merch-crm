"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash, Check, Pencil, RefreshCw, Book, Settings, Pipette } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createInventoryAttribute, deleteInventoryAttribute, updateInventoryAttribute, regenerateAllItemSKUs, createInventoryAttributeType, updateInventoryAttributeType, deleteInventoryAttributeType, seedSystemCategories } from "./actions";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Lock } from "lucide-react";
import { Session } from "@/lib/auth";
import { InventoryAttribute as Attribute, AttributeType } from "./types";

const RUSSIAN_TO_LATIN_MAP: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '_'
};

const transliterateToSlug = (text: string) => {
    return text.toLowerCase().split('').map(char => RUSSIAN_TO_LATIN_MAP[char] || char).join('').replace(/[^a-z0-9_]/g, '');
};

const PRESET_COLORS = [
    "#000000", "#FFFFFF", "#64748b", "#ef4444", "#f97316", "#f59e0b",
    "#10b981", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#78350f"
];

const transliterateToSku = (text: string) => {
    const transliterated = text.toLowerCase().split('').map(char => {
        if (char === ' ') return '';
        return RUSSIAN_TO_LATIN_MAP[char] || char;
    }).join('').replace(/[^a-z0-9]/g, '');
    return transliterated.substring(0, 3).toUpperCase();
};

function CategorySelectDropdown({
    value,
    onChange,
    categories,
}: {
    value: string;
    onChange: (val: string) => void;
    categories: Category[];
}) {
    const selectedCategory = categories.find(c => c.id === value);
    const label = value === "uncategorized" || !value ? "Без категории" : selectedCategory?.name || "Без категории";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="w-full h-11 px-4 rounded-[var(--radius)] border border-slate-200 bg-white flex items-center justify-between hover:border-primary/50 transition-all outline-none group"
                >
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            (value === "uncategorized" || !value) ? "bg-slate-300" : "bg-primary"
                        )} />
                        <span className={cn(
                            "text-sm font-bold truncate",
                            (value === "uncategorized" || !value) ? "text-slate-500" : "text-slate-900"
                        )}>
                            {label}
                        </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[var(--radix-dropdown-menu-trigger-width)] bg-white border border-slate-200/60 rounded-[14px] p-2 z-[150] animate-in fade-in zoom-in-95 duration-200"
                style={{ boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.35), 0 16px 32px -12px rgba(0, 0, 0, 0.2)' }}
                align="start"
                sideOffset={8}
            >
                <DropdownMenuItem
                    onClick={() => onChange("uncategorized")}
                    className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-[var(--radius)] text-sm font-bold transition-all cursor-pointer outline-none",
                        (value === "uncategorized" || !value) ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    )}
                >
                    <span className="flex-1 text-left">Без категории</span>
                    {(value === "uncategorized" || !value) && <Check className="w-4 h-4 ml-2 text-primary stroke-[3]" />}
                </DropdownMenuItem>

                {categories.map((cat) => {
                    const isSelected = value === cat.id;
                    return (
                        <DropdownMenuItem
                            key={cat.id}
                            onClick={() => onChange(cat.id)}
                            className={cn(
                                "flex items-center justify-between px-3 py-2.5 rounded-[var(--radius)] text-sm font-bold transition-all cursor-pointer outline-none",
                                isSelected ? "bg-primary/5 text-primary" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <span className="flex-1 text-left">{cat.name}</span>
                            {isSelected && <Check className="w-4 h-4 ml-2 stroke-[3]" />}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Switch({
    checked,
    onChange,
    disabled,
    label,
    icon: Icon,
    description
}: {
    checked: boolean,
    onChange: (val: boolean) => void,
    disabled?: boolean,
    label?: string,
    icon?: React.ComponentType<{ className?: string }>,
    description?: string
}) {
    return (
        <div className={cn(
            "flex items-center justify-between group",
            disabled && "opacity-50"
        )}>
            <div className="flex flex-col gap-0.5">
                {label && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-700">{label}</span>
                        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                )}
                {description && <span className="text-[10px] text-slate-400 font-medium">{description}</span>}
            </div>
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    checked ? "bg-primary shadow-lg shadow-primary/20" : "bg-slate-200",
                    disabled && "cursor-not-allowed"
                )}
            >
                <span
                    className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
}

interface Category {
    id: string;
    name: string;
    parentId?: string | null;
}

interface DictionaryProps {
    attributes?: Attribute[];
    attributeTypes?: AttributeType[];
    categories?: Category[];
    user?: Session | null;
}

export function WarehouseDictionary({ attributes = [], attributeTypes = [], categories = [], user }: DictionaryProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rootCategories = categories.filter(c => !c.parentId);
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
        router.replace(`?${params.toString()}`, { scroll: false });
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
    const [showInName, setShowInName] = useState(true);
    const [showInSku, setShowInSku] = useState(true);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncingCategories, setIsSyncingCategories] = useState(false);
    const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    // Delete State
    const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Create Type State
    const [isCreatingType, setIsCreatingType] = useState(false);
    const [newTypeLabel, setNewTypeLabel] = useState("");
    const [newTypeSlug, setNewTypeSlug] = useState("");
    const [newTypeIsSystem, setNewTypeIsSystem] = useState(false);
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
    const [isCreatingTypeLoading, setIsCreatingTypeLoading] = useState(false);

    // Type Delete State
    const [typeToDelete, setTypeToDelete] = useState<AttributeType | null>(null);
    const [isDeletingType, setIsDeletingType] = useState(false);

    // Edit Type State (Metadata)
    const [editingType, setEditingType] = useState<AttributeType | null>(null);
    const [editTypeName, setEditTypeName] = useState("");
    const [editTypeCategoryId, setEditTypeCategoryId] = useState<string>("uncategorized");
    const [editTypeIsSystem, setEditTypeIsSystem] = useState(false);
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
        setShowInName(true);
        setShowInSku(true);
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
        setShowInName(typedMeta?.showInName ?? true);
        setShowInSku(typedMeta?.showInSku ?? true);
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
            showInName,
            showInSku,
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
        } catch {
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
        } catch {
            toast("Ошибка при удалении", "error");
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleCreateType() {
        if (!newTypeLabel.trim() || !newTypeSlug.trim()) return;
        setIsCreatingTypeLoading(true);
        try {
            const catIdToSave = activeCategoryId === "uncategorized" ? undefined : activeCategoryId;
            const res = await createInventoryAttributeType(newTypeLabel, newTypeSlug, catIdToSave, newTypeIsSystem);
            if (res.success) {
                toast("Новый раздел создан", "success");
                setIsCreatingType(false);
                setNewTypeLabel("");
                setNewTypeSlug("");
                setNewTypeIsSystem(false);
                setIsSlugManuallyEdited(false);
                router.refresh();
            } else {
                toast(res.error || "Ошибка создания", "error");
            }
        } catch {
            toast("Ошибка создания", "error");
        } finally {
            setIsCreatingTypeLoading(false);
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
        } catch {
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
    }

    async function handleUpdateType() {
        if (!editingType || !editTypeName.trim()) return;
        setIsEditTypeLoading(true);
        try {
            const catId = editTypeCategoryId === "uncategorized" ? null : editTypeCategoryId;
            const res = await updateInventoryAttributeType(editingType.id, editTypeName, catId, editTypeIsSystem);
            if (res.success) {
                toast("Раздел обновлен", "success");
                // Don't close immediately, user might want to edit values
                // setEditingType(null); 
                router.refresh();
            } else {
                toast(res.error || "Ошибка обновления", "error");
            }
        } catch {
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
            <div className="bg-slate-100/50 p-1.5 rounded-[var(--radius)] inline-flex gap-1 border border-slate-200 flex-wrap">
                {rootCategories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-[18px] text-sm font-bold transition-all duration-300",
                            activeCategoryId === cat.id
                                ? "bg-white text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                        )}
                    >
                        {cat.name}
                    </button>
                ))}
                {hasUncategorized && (
                    <button
                        onClick={() => handleCategoryChange("uncategorized")}
                        className={cn(
                            "px-5 py-2.5 rounded-[18px] text-sm font-bold transition-all duration-300",
                            activeCategoryId === "uncategorized"
                                ? "bg-white text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                        )}
                    >
                        Другое
                    </button>
                )}
            </div>

            {/* Dashboard of Types & Values */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 ">Характеристики: {activeCategoryName}</h2>
                            <p className="text-slate-500">Управление значениями списков</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    setIsSyncingCategories(true);
                                    toast("Синхронизация категорий...", "info");
                                    try {
                                        const res = await seedSystemCategories();
                                        if (res.success) {
                                            toast("Категории обновлены", "success");
                                            router.refresh();
                                        } else {
                                            toast(res.error || "Ошибка синхронизации", "error");
                                        }
                                    } catch {
                                        toast("Ошибка синхронизации", "error");
                                    } finally {
                                        setIsSyncingCategories(false);
                                    }
                                }}
                                disabled={isSyncingCategories}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-[var(--radius)] font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw className={cn("w-4 h-4", isSyncingCategories && "animate-spin")} />
                                <span className="hidden sm:inline">Синхронизировать категории</span>
                            </button>
                            <button
                                onClick={async () => {
                                    toast("Обновление артикулов...", "info");
                                    try {
                                        const res = await regenerateAllItemSKUs();
                                        if (res.success) {
                                            toast(`Обновлено ${res.updatedCount} артикулов`, "success");
                                            router.refresh();
                                        } else {
                                            toast("Ошибка при обновлении", "error");
                                        }
                                    } catch {
                                        toast("Ошибка при обновлении", "error");
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-[var(--radius)] font-bold text-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="hidden sm:inline">Обновить SKU</span>
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreatingType(true);
                                    setNewTypeLabel("");
                                    setNewTypeSlug("");
                                    setIsSlugManuallyEdited(false);
                                }}
                                className="bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md text-slate-700 hover:text-primary px-5 py-2.5 rounded-[var(--radius)] font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Новый тип
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                                    className="group bg-white p-6 rounded-[24px] border border-slate-200 hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-[var(--radius)] bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner">
                                                <span className="font-bold text-lg leading-none pt-0.5">{type.name[0]}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 leading-tight">{type.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-slate-400">{type.slug}</span>
                                                    {type.isSystem && <span className="text-[10px] font-bold  text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">SYS</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => handleEditTypeClick(type, e)}
                                                className="p-2 rounded-[18px] text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex flex-wrap gap-2">
                                            {typeAttributes.map(attr => (
                                                <button
                                                    key={attr.id}
                                                    onClick={() => openEditValue(attr)}
                                                    className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 bg-slate-50 hover:bg-primary/5 border border-slate-200 hover:border-primary/20 rounded-full transition-all group/item"
                                                >
                                                    {type.slug === "color" ? (
                                                        <span className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/5 flex-shrink-0" style={{ backgroundColor: (attr.meta as { hex?: string })?.hex || "#000" }} />
                                                    ) : (
                                                        <span className={cn(
                                                            "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm border border-slate-100 flex-shrink-0 overflow-hidden  bg-white text-slate-600"
                                                        )}>
                                                            {["size", "material"].includes(type.slug)
                                                                ? attr.value
                                                                : attr.name.substring(0, 1).toUpperCase()}
                                                        </span>
                                                    )}

                                                    <span className="text-sm font-medium text-slate-700 group-hover/item:text-primary">{attr.name}</span>
                                                </button>
                                            ))}
                                            {typeAttributes.length === 0 && (
                                                <div className="text-sm text-slate-400 italic py-2">Нет значений</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6">
                                        <button
                                            onClick={() => openAddValue(type.slug)}
                                            className="w-full py-2.5 rounded-[18px] border border-dashed border-slate-300 text-slate-500 hover:border-primary/40 hover:bg-primary/5 hover:text-primary font-medium text-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Добавить значение
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredTypes.length === 0 && (
                            <div className="col-span-full py-16 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                    <Book className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-700">Нет характеристик</h3>
                                <p className="text-slate-500">
                                    {activeCategoryId === "uncategorized"
                                        ? "Все характеристики распределены по категориям"
                                        : `В категории "${activeCategoryName}" пока нет созданных типов характеристик`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Type Dialog */}
            <Dialog open={isCreatingType} onOpenChange={setIsCreatingType}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Создать новый тип характеристики</DialogTitle>
                        <DialogDescription>
                            Для категории: <span className="font-bold text-primary">{activeCategoryName}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Категория</label>
                            <CategorySelectDropdown
                                value={activeCategoryId}
                                onChange={setActiveCategoryId}
                                categories={rootCategories}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Название раздела</label>
                            <input
                                value={newTypeLabel}
                                onChange={e => {
                                    const val = e.target.value;
                                    setNewTypeLabel(val);
                                    if (!isSlugManuallyEdited) {
                                        setNewTypeSlug(transliterateToSlug(val));
                                    }
                                }}
                                placeholder="Например: Тип рукава"
                                className="w-full h-11 px-4 rounded-[var(--radius)] bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Системный код (латиница)</label>
                            <input
                                value={newTypeSlug}
                                onChange={e => {
                                    setNewTypeSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
                                    setIsSlugManuallyEdited(true);
                                }}
                                placeholder="Например: sleeve_type"
                                className="w-full h-11 px-4 rounded-[var(--radius)] bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-mono placeholder:text-slate-400"
                            />
                        </div>
                        <Switch
                            checked={newTypeIsSystem}
                            onChange={setNewTypeIsSystem}
                            label="Системная характеристика"
                            icon={Lock}
                        />
                    </div>
                    <DialogFooter>
                        <button onClick={() => setIsCreatingType(false)} className="px-4 py-2 text-slate-500 hover:text-slate-900 font-medium">Отмена</button>
                        <button onClick={handleCreateType} disabled={isCreatingTypeLoading || !newTypeLabel || !newTypeSlug} className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                            {isCreatingTypeLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Создать
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Type Dialog (Full Editor) */}
            <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
                <DialogContent
                    className="w-[95vw] md:max-w-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col p-0 overflow-hidden"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="px-6 pt-6 pb-2 border-b border-slate-100 flex-shrink-0">
                        <DialogHeader>
                            <DialogTitle>Редактировать тип характеристики</DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Название</label>
                                <input
                                    value={editTypeName}
                                    onChange={e => setEditTypeName(e.target.value)}
                                    className="w-full h-11 px-4 rounded-[var(--radius)] bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-slate-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Категория</label>
                                <CategorySelectDropdown
                                    value={editTypeCategoryId}
                                    onChange={setEditTypeCategoryId}
                                    categories={rootCategories}
                                />
                            </div>
                        </div>

                        <div className="mt-4 py-4 px-0 bg-slate-50 rounded-[var(--radius)]">
                            <Switch
                                checked={editTypeIsSystem}
                                onChange={setEditTypeIsSystem}
                                disabled={user?.roleName !== "Администратор"}
                                label="Системная характеристика"
                                icon={Lock}
                                description={editTypeIsSystem && user?.roleName !== "Администратор" ? "(только для Администратора)" : undefined}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pt-5 pb-10 bg-slate-50/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-600 ">Значения ({editingTypeValues.length})</h3>
                            <button
                                onClick={() => editingTypeLatest && openAddValue(editingTypeLatest.slug)}
                                className="text-xs bg-primary text-white px-3 py-1.5 rounded-[18px] hover:bg-primary/90 font-bold flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-3 h-3" /> Добавить
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {editingTypeValues.map(attr => (
                                <div key={attr.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-[18px] hover:border-primary/30 hover:shadow-sm transition-all group">
                                    <div className="flex items-center gap-3">
                                        {/* Visual Preview */}
                                        {editingTypeLatest?.slug === "color" && (
                                            <div className="w-8 h-8 rounded-[18px] shadow-sm ring-1 ring-black/5 flex-shrink-0" style={{ backgroundColor: (attr.meta as { hex?: string })?.hex || "#000" }} />
                                        )}
                                        {editingTypeLatest && (editingTypeLatest.slug === "size" || editingTypeLatest.slug === "material") && (
                                            <div className="w-8 h-8 rounded-[18px] bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                                                {attr.value.substring(0, 2)}
                                            </div>
                                        )}
                                        {editingTypeLatest && !["color", "size", "material"].includes(editingTypeLatest.slug) && (
                                            <div className="w-8 h-8 rounded-[18px] bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                                                {attr.value.substring(0, 1)}
                                            </div>
                                        )}

                                        <div>
                                            <div className="font-bold text-sm text-slate-800">{attr.name}</div>
                                            <div className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1 rounded inline-block border border-slate-100">{attr.value}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 transition-opacity">
                                        <button
                                            onClick={() => openEditValue(attr)}
                                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-[18px] transition-colors"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setAttributeToDelete(attr)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[18px] transition-colors"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {editingTypeValues.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-[18px]">
                                    <p className="text-sm text-slate-500 mb-2">Список значений пуст</p>
                                    <button
                                        onClick={() => editingTypeLatest && openAddValue(editingTypeLatest.slug)}
                                        className="text-primary text-sm font-bold hover:underline"
                                    >
                                        Добавить первое значение
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-between items-center flex-shrink-0">
                        <div>
                            {editingTypeLatest && (
                                <button
                                    onClick={() => setTypeToDelete(editingTypeLatest)}
                                    disabled={editingTypeLatest.isSystem && user?.roleName !== "Администратор"}
                                    className="px-4 py-2 text-red-500 hover:text-red-700 font-bold text-sm flex items-center gap-2 hover:bg-red-50 rounded-[18px] transition-all disabled:opacity-30 disabled:grayscale"
                                >
                                    <Trash className="w-4 h-4" />
                                    Удалить раздел
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setEditingType(null)} className="px-4 py-2 text-slate-500 hover:text-slate-900 font-medium text-sm">Отмена</button>
                            <button onClick={handleUpdateType} disabled={isEditTypeLoading} className="px-6 py-2 bg-primary text-white rounded-[18px] text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
                                Сохранить изменения
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Value Dialog */}
            <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
                <DialogContent
                    className="w-[95vw] sm:max-w-[425px] z-[9999] overflow-hidden flex flex-col max-h-[90vh] p-0 gap-0"
                    style={{ zIndex: 9999 }}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogHeader className="p-6 pb-2 shrink-0">
                        <DialogTitle className="text-xl font-bold">{editingAttribute ? "Редактировать значение" : "Добавить значение"}</DialogTitle>
                        <DialogDescription className="text-xs">
                            Для характеристики: <span className="font-bold text-primary">{attributeTypes.find(t => t.slug === targetTypeSlug)?.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-2">
                        <div className="space-y-3.5 mt-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400  ml-1">Название</label>
                                    <input
                                        value={newItemName}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setNewItemName(val);
                                            if (!isCodeManuallyEdited) {
                                                setNewItemCode(transliterateToSku(val));
                                            }
                                        }}
                                        placeholder="Синий"
                                        className="w-full h-10 px-4 rounded-[18px] bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400 text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400  ml-1">Код (SKU)</label>
                                    <input
                                        value={newItemCode}
                                        onChange={e => {
                                            setNewItemCode(e.target.value.toUpperCase());
                                            setIsCodeManuallyEdited(true);
                                        }}
                                        placeholder="BLU"
                                        className="w-full h-10 px-4 rounded-[18px] bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-mono transition-all placeholder:text-slate-400 text-sm font-bold"
                                    />
                                </div>
                            </div>

                            {targetTypeSlug === "color" && (
                                <div className="space-y-3 py-4 px-0 bg-slate-50 rounded-[24px]">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Цвет (HEX)</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button type="button" className="relative w-12 h-12 shrink-0 group active:scale-95 transition-transform">
                                                        <div
                                                            className="w-full h-full rounded-[18px] border-2 border-white shadow-md ring-1 ring-slate-200 transition-all group-hover:ring-primary/30"
                                                            style={{ backgroundColor: newItemColorHex }}
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-[18px]">
                                                            <Pipette className="w-4 h-4 text-white drop-shadow-md" />
                                                        </div>
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-64 p-3 bg-white shadow-2xl rounded-[24px] border-slate-100 z-[10000]" side="top" align="start">
                                                    <div className="custom-color-picker">
                                                        <HexColorPicker color={newItemColorHex} onChange={setNewItemColorHex} className="!w-full !h-40" />
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            <div className="relative flex-1">
                                                <input
                                                    value={newItemColorHex}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                                                            setNewItemColorHex(val);
                                                        }
                                                    }}
                                                    className="w-full h-12 px-5 rounded-[18px] border border-slate-200 font-mono focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all placeholder:text-slate-400 text-sm font-bold bg-white"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">HEX</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                            <div className="space-y-2.5 px-1">
                                <Switch
                                    checked={showInName}
                                    onChange={setShowInName}
                                    label="В названии"
                                    description="Добавлять это значение в авто-имя товара"
                                />
                                <Switch
                                    checked={showInSku}
                                    onChange={setShowInSku}
                                    label="В SKU"
                                    description="Использовать код в генераторе артикулов"
                                />
                            </div>

                            {error && <div className="text-rose-500 text-[11px] font-bold bg-rose-50 px-3 py-2 rounded-[18px] border border-rose-100">{error}</div>}
                        </div>
                    </div>

                    <DialogFooter className="p-6 pt-2 shrink-0 flex flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50">
                        {editingAttribute ? (
                            <button
                                onClick={() => setAttributeToDelete(editingAttribute)}
                                className="h-10 px-3 text-rose-500 hover:bg-rose-50 rounded-[18px] text-xs font-bold  flex items-center gap-2 transition-colors"
                            >
                                <Trash className="w-4 h-4" /> Удалить
                            </button>
                        ) : <div />}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsValueDialogOpen(false)}
                                className="h-10 px-4 text-slate-500 hover:text-slate-900 text-xs font-bold "
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleValueSave}
                                disabled={isSaving}
                                className="h-10 px-6 bg-primary text-white rounded-[18px] text-xs font-bold  hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                                {isSaving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Сохранить
                            </button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!attributeToDelete}
                onClose={() => setAttributeToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Удаление значения"
                description={`Вы уверены, что хотите удалить "${attributeToDelete?.name}"?`}
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
                description={`Вы уверены, что хотите удалить раздел "${typeToDelete?.name}"? Все значения в нем также будут недоступны.`}
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeletingType}
                isConfirmDisabled={!!typeToDelete?.isSystem && !deletePassword.trim()}
            >
                {typeToDelete?.isSystem && (
                    <div className="px-1 pb-4">
                        <div className="bg-rose-50 p-4 rounded-[18px] border border-rose-100 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-rose-600">
                                <Lock className="w-4 h-4" />
                                <span className="text-[11px] font-bold ">Системная защита</span>
                            </div>
                            <p className="text-xs font-bold text-rose-500/80 leading-relaxed">
                                Это системный раздел. Для подтверждения удаления введите пароль администратора.
                            </p>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Пароль администратора"
                                className="w-full h-11 px-4 rounded-[18px] border border-rose-200 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-rose-200"
                                autoFocus
                            />
                        </div>
                    </div>
                )}
            </ConfirmDialog>
        </div>
    );
}
