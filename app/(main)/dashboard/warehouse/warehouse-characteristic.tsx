"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ColorPicker } from "@/components/ui/color-picker";
import { Plus, Settings, Check, Book, Pencil, Trash, Lock } from "lucide-react";
import { createInventoryAttribute, deleteInventoryAttribute, updateInventoryAttribute, updateInventoryAttributeType, deleteInventoryAttributeType } from "./actions";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PremiumSelect } from "@/components/ui/premium-select";
import { Session } from "@/lib/auth";
import { InventoryAttribute as Attribute, AttributeType } from "./types";

const RUSSIAN_TO_LATIN_MAP: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    ' ': '_'
};





const transliterateToSku = (text: string) => {
    const transliterated = text.toLowerCase().split('').map(char => {
        if (char === ' ') return '';
        return RUSSIAN_TO_LATIN_MAP[char] || char;
    }).join('').replace(/[^a-z0-9]/g, '');
    return transliterated.substring(0, 3);
};



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
                        <span className="text-sm font-bold text-slate-900">{label}</span>
                        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                )}
                {description && <span className="text-xs text-slate-500 font-medium">{description}</span>}
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
    const desiredOrder = ["Одежда", "Упаковка", "Расходники"];
    const rootCategories = categories
        .filter(c => !c.parentId)
        .sort((a, b) => {
            const indexA = desiredOrder.indexOf(a.name);
            const indexB = desiredOrder.indexOf(b.name);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
        });

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
    const [showInName, setShowInName] = useState(true);
    const [showInSku, setShowInSku] = useState(true);
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
            <div className="flex w-full h-[58px] items-center gap-2 p-[6px] !rounded-[22px] glass-panel">
                {rootCategories.map((cat) => {
                    const isActive = activeCategoryId === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={cn(
                                "relative flex-1 h-full px-2 !rounded-[16px] text-sm font-bold group",
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
                            <span className="relative z-10">{cat.name}</span>
                        </button>
                    );
                })}
                {hasUncategorized && (
                    <button
                        onClick={() => handleCategoryChange("uncategorized")}
                        className={cn(
                            "relative h-full px-6 !rounded-[16px] text-sm font-bold group",
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
                        <span className="relative z-10">Без категории</span>
                    </button>
                )}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col gap-8">

                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-[var(--crm-grid-gap)]">
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
                                    className="bg-white border border-slate-200 rounded-[var(--radius-outer)] p-6 flex flex-col h-full group shadow-sm"
                                >
                                    <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-slate-100 text-slate-600 flex items-center justify-center shadow-inner">
                                                <span className="font-bold text-lg leading-none pt-0.5">{type.name[0]}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 leading-tight">{type.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">{type.slug}</span>
                                                    {type.isSystem && <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md uppercase tracking-tight">Sys</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => handleEditTypeClick(type, e)}
                                                className="p-2 rounded-[var(--radius-inner)] text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors"
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
                                                    className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 rounded-full transition-all group/item shadow-sm"
                                                >
                                                    {type.slug === "color" ? (
                                                        <span className="w-6 h-6 rounded-full shadow-sm ring-1 ring-black/5 flex-shrink-0" style={{ backgroundColor: (attr.meta as { hex?: string })?.hex || "#000" }} />
                                                    ) : (
                                                        <span className={cn(
                                                            "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm border border-slate-200 flex-shrink-0 overflow-hidden  bg-white text-slate-600"
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
                                                <div className="text-sm text-slate-400 py-2">Нет значений</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6">
                                        <button
                                            onClick={() => openAddValue(type.slug)}
                                            className="w-full py-2.5 rounded-[var(--radius-inner)] border border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 font-medium text-sm transition-all flex items-center justify-center gap-2"
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
                                        : `В категории «${activeCategoryName}» пока нет созданных типов характеристик`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Edit Type Dialog (Full Editor) */}
            <Dialog open={!!editingType} onOpenChange={(open) => !open && setEditingType(null)}>
                <DialogContent
                    className="w-[95vw] md:max-w-2xl max-h-[95vh] flex flex-col p-0 overflow-visible rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogTitle className="sr-only">Настройка раздела</DialogTitle>
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

                    <div className="px-6 py-5 space-y-6 shrink-0 bg-slate-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Название раздела</label>
                                <input
                                    value={editTypeName}
                                    onChange={e => setEditTypeName(e.target.value)}
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-white border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-sm text-slate-900 shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Категория</label>
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

                        <div className="p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm">
                            <Switch
                                checked={editTypeIsSystem}
                                onChange={setEditTypeIsSystem}
                                disabled={user?.roleName !== "Администратор"}
                                label="Системная характеристика"
                                icon={Lock}
                                description={editTypeIsSystem && user?.roleName !== "Администратор" ? "(только для Администратора)" : "Будет доступна во всех категориях"}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pt-2 pb-6 bg-white/50 custom-scrollbar">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-500 ml-1">Значения ({editingTypeValues.length})</h3>
                            <button
                                onClick={() => editingTypeLatest && openAddValue(editingTypeLatest.slug)}
                                className="h-8 bg-primary/10 text-primary px-3 rounded-lg hover:bg-primary hover:text-white font-bold text-[10px] flex items-center gap-1.5 transition-all active:scale-95"
                            >
                                <Plus className="w-3 h-3 stroke-[3]" /> Добавить
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {editingTypeValues.map(attr => (
                                <div key={attr.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-[var(--radius-inner)] hover:border-slate-300 hover:shadow-md transition-all group relative">
                                    <div className="flex items-center gap-3">
                                        {/* Visual Preview */}
                                        {editingTypeLatest?.slug === "color" && (
                                            <div className="w-8 h-8 rounded-[var(--radius-inner)] shadow-sm ring-1 ring-black/5 flex-shrink-0" style={{ backgroundColor: (attr.meta as { hex?: string })?.hex || "#000" }} />
                                        )}
                                        {editingTypeLatest && (editingTypeLatest.slug === "size" || editingTypeLatest.slug === "material") && (
                                            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-900 border border-slate-200 flex-shrink-0 uppercase">
                                                {attr.value.substring(0, 3)}
                                            </div>
                                        )}
                                        {editingTypeLatest && !["color", "size", "material"].includes(editingTypeLatest.slug) && (
                                            <div className="w-8 h-8 rounded-[var(--radius-inner)] bg-primary/5 flex items-center justify-center text-primary font-bold text-[10px] flex-shrink-0 border border-primary/10">
                                                {attr.value.substring(0, 1)}
                                            </div>
                                        )}

                                        <div>
                                            <div className="font-bold text-[13px] text-slate-900 leading-tight">{attr.name}</div>
                                            <div className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md inline-block border border-slate-200 mt-0.5 tabular-nums">{attr.value}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditValue(attr)}
                                            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 rounded-[var(--radius-inner)] transition-all active:scale-90"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setAttributeToDelete(attr)}
                                            className="w-7 h-7 flex items-center justify-center text-slate-400 btn-destructive-ghost rounded-[var(--radius-inner)] transition-all active:scale-90"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {editingTypeValues.length === 0 && (
                                <div className="col-span-full text-center py-10 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[var(--radius-inner)]">
                                    <p className="text-[11px] font-bold text-slate-400 mb-2">Список значений пуст</p>
                                    <button
                                        onClick={() => editingTypeLatest && openAddValue(editingTypeLatest.slug)}
                                        className="text-primary text-[10px] font-bold hover:underline"
                                    >
                                        Добавить первое значение
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center shrink-0 rounded-b-[var(--radius-outer)]">
                        <div>
                            {editingTypeLatest && (
                                <button
                                    onClick={() => setTypeToDelete(editingTypeLatest)}
                                    disabled={editingTypeLatest.isSystem && user?.roleName !== "Администратор"}
                                    className="h-11 px-6 font-bold text-sm flex items-center gap-2 btn-destructive-ghost rounded-[var(--radius-inner)] transition-all disabled:opacity-30 disabled:grayscale"
                                >
                                    <Trash className="w-4 h-4" />
                                    Удалить раздел
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditingType(null)}
                                className="h-11 px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleUpdateType}
                                disabled={isEditTypeLoading}
                                className="h-11 px-8 btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isEditTypeLoading ? <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                                Сохранить изменения
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Value Dialog */}
            <Dialog open={isValueDialogOpen} onOpenChange={setIsValueDialogOpen}>
                <DialogContent
                    className="w-[95vw] sm:max-w-md flex flex-col p-0 overflow-visible rounded-[var(--radius-outer)] bg-white border-none shadow-2xl"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <DialogTitle className="sr-only">
                        {editingAttribute ? "Изменить значение" : "Новое значение"}
                    </DialogTitle>
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

                    <div className="px-6 py-6 space-y-5 bg-slate-50/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Название</label>
                                <input
                                    value={newItemName}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setNewItemName(val);
                                        if (!isCodeManuallyEdited) {
                                            setNewItemCode(transliterateToSku(val));
                                        }
                                    }}
                                    placeholder="Напр: Синий"
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-500 ml-1">Код (SKU)</label>
                                <input
                                    value={newItemCode}
                                    onChange={e => {
                                        setNewItemCode(e.target.value.toUpperCase());
                                        setIsCodeManuallyEdited(true);
                                    }}
                                    placeholder="BLU"
                                    className="w-full h-11 px-4 rounded-[var(--radius-inner)] bg-white border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none font-mono transition-all placeholder:text-slate-300 font-bold text-sm text-slate-900 shadow-sm"
                                />
                            </div>
                        </div>

                        {targetTypeSlug === "color" && (
                            <ColorPicker
                                label="Цвет (Hex)"
                                color={newItemColorHex}
                                onChange={setNewItemColorHex}
                            />
                        )}

                        <div className="space-y-3 bg-white p-4 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm">
                            <Switch
                                checked={showInName}
                                onChange={setShowInName}
                                label="В составе имени"
                                description="Будет участвовать в генерации названия"
                            />
                            <div className="h-px bg-slate-50 mx-1" />
                            <Switch
                                checked={showInSku}
                                onChange={setShowInSku}
                                label="В составе SKU"
                                description="Будет участвовать в генерации артикула"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-[var(--radius-inner)] bg-rose-50 text-rose-600 border border-rose-100 animate-in shake duration-500">
                                <Check className="w-3.5 h-3.5 shrink-0 rotate-45" />
                                <p className="text-[10px] font-bold leading-tight">{error}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center shrink-0 rounded-b-[var(--radius-outer)] gap-3">
                        <div>
                            {editingAttribute ? (
                                <button
                                    onClick={() => setAttributeToDelete(editingAttribute)}
                                    className="h-11 px-6 font-bold text-sm flex items-center gap-2 btn-destructive-ghost rounded-[var(--radius-inner)] transition-all active:scale-95"
                                >
                                    <Trash className="w-4 h-4" /> Удалить
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsValueDialogOpen(false)}
                                    className="h-11 px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all"
                                >
                                    Отмена
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleValueSave}
                            disabled={isSaving || !newItemName.trim() || !newItemCode.trim()}
                            className="flex-1 h-11 btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                            Сохранить
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

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
                            <input
                                type="password"
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
        </div >
    );
}
