"use client";

import { useState, useRef, useEffect, createElement } from "react";
import {
    Search, Upload, Plus, X,
    Sparkles, AlertCircle, Pencil, Save, Trash2, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ICON_GROUPS as INITIAL_ICON_GROUPS, hydrateIconGroups, serializeIconGroups, ALL_ICONS_MAP, IconGroupInput, SerializedIconGroup } from "@/app/(main)/dashboard/warehouse/category-utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateIconGroups } from "./actions";
import { createSvgIcon } from "@/app/(main)/dashboard/warehouse/category-utils";
import { pluralize } from "@/lib/pluralize";
import { useToast } from "@/components/ui/toast";

// Constants
const LIBRARY_ICONS_LIMIT = 50;

// Type for icon item
export interface IconItem {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    svgContent?: string;
}

export interface IconGroup {
    id: string;
    label: string;
    groupIcon: React.ComponentType<{ className?: string }>;
    icons: IconItem[];
}

// Helper: prepare groups for saving (DRY — used in save & delete)
const prepareGroupsForSave = (groups: IconGroup[]): IconGroupInput[] => {
    return groups.map(g => ({
        name: g.label,
        groupIcon: g.groupIcon,
        icons: g.icons.map(i => ({ ...i, label: i.label || i.name }))
    }));
};

export function IconManager({ initialData }: { initialData?: SerializedIconGroup[] }) {
    const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Categories state — safe typing without double assertion
    const [iconGroups, setIconGroups] = useState<IconGroup[]>(() => {
        const rawGroups = initialData
            ? hydrateIconGroups(initialData)
            : INITIAL_ICON_GROUPS;

        return rawGroups.map((g, idx): IconGroup => ({
            id: (g as { id?: string }).id || g.name?.toLowerCase().replace(/\s+/g, '-') || `cat-${idx}`,
            label: (g as { label?: string }).label || g.name || "Без названия",
            groupIcon: (g as { groupIcon?: React.ComponentType<{ className?: string }> }).groupIcon || Sparkles,
            icons: g.icons || []
        }));
    });
    const [editingCategory, setEditingCategory] = useState<IconGroup | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [iconPickerSearch, setIconPickerSearch] = useState("");

    const totalIcons = iconGroups.reduce(
        (acc: number, g: IconGroup) => acc + g.icons.length,
        0
    );

    // Escape key handler for all modals
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (categoryToDelete) setCategoryToDelete(null);
                else if (editingCategory) setEditingCategory(null);
                else if (showUploadModal) setShowUploadModal(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [categoryToDelete, editingCategory, showUploadModal]);

    const handleSaveCategory = async () => {
        if (!editingCategory) return;

        if (!editingCategory.label.trim()) {
            toast("Пожалуйста, введите название категории", "warning");
            return;
        }

        setIsSaving(true);

        let updatedGroups;
        const exists = iconGroups.some(g => g.id === editingCategory.id);
        if (exists) {
            updatedGroups = iconGroups.map(g => g.id === editingCategory.id ? editingCategory : g);
        } else {
            updatedGroups = [...iconGroups, editingCategory];
        }

        setIconGroups(updatedGroups);

        try {
            const result = await updateIconGroups(serializeIconGroups(prepareGroupsForSave(updatedGroups)));
            if (result.error) {
                toast(`Ошибка при сохранении: ${result.error}`, "error");
            }
        } catch (error) {
            console.error("Failed to save icon groups:", error);
            toast(error instanceof Error ? error.message : "Неизвестная ошибка при сохранении", "error");
        } finally {
            setIsSaving(false);
            setEditingCategory(null);
        }
    };

    const handleDeleteCategory = (categoryId: string) => {
        setCategoryToDelete(categoryId);
    };

    const confirmDeleteAction = async () => {
        if (!categoryToDelete) return;

        const categoryId = categoryToDelete;
        setCategoryToDelete(null);

        setIsSaving(true);
        const updatedGroups = iconGroups.filter(g => g.id !== categoryId);
        setIconGroups(updatedGroups);

        try {
            const result = await updateIconGroups(serializeIconGroups(prepareGroupsForSave(updatedGroups)));
            if (result.error) {
                toast(`Ошибка при сохранении: ${result.error}`, "error");
            }
        } catch (error) {
            console.error("Failed to save icon groups:", error);
            toast(error instanceof Error ? error.message : "Неизвестная ошибка при сохранении", "error");
        } finally {
            setIsSaving(false);
            setEditingCategory(null);
        }
    };

    const handleAddNewCategory = () => {
        const newId = `cat-${Date.now()}`;
        const newCategory: IconGroup = {
            id: newId,
            label: "",
            groupIcon: Sparkles,
            icons: []
        };

        setEditingCategory(newCategory);
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadModalInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);
    const [librarySearch, setLibrarySearch] = useState("");

    const handleUploadSvg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingCategory) return;

        if (!file.name.endsWith('.svg')) {
            toast("Пожалуйста, выберите SVG файл", "warning");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const newIcon: IconItem = {
                name: `custom-${Date.now()}`,
                label: file.name.replace('.svg', ''),
                icon: createSvgIcon(content),
                svgContent: content
            };

            setEditingCategory({
                ...editingCategory,
                icons: [...editingCategory.icons, newIcon]
            });
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    // Handler for uploading SVG from the standalone Upload Modal
    const handleUploadFromModal = (file: File | null) => {
        if (!file) return;

        if (!file.name.endsWith('.svg')) {
            toast("Пожалуйста, выберите SVG файл", "warning");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const newIcon: IconItem = {
                name: `custom-${Date.now()}`,
                label: file.name.replace('.svg', ''),
                icon: createSvgIcon(content),
                svgContent: content
            };

            // If a category is being edited — add there, otherwise add to first group
            if (editingCategory) {
                setEditingCategory({
                    ...editingCategory,
                    icons: [...editingCategory.icons, newIcon]
                });
            } else if (iconGroups.length > 0) {
                const updatedGroups = [...iconGroups];
                updatedGroups[0] = {
                    ...updatedGroups[0],
                    icons: [...updatedGroups[0].icons, newIcon]
                };
                setIconGroups(updatedGroups);

                // Auto-save
                updateIconGroups(serializeIconGroups(prepareGroupsForSave(updatedGroups))).catch((error) => {
                    console.error("Failed to auto-save after upload:", error);
                });
            }

            setShowUploadModal(false);
            setUploadedFile(null);
            toast("Иконка успешно загружена", "success");
        };
        reader.readAsText(file);
    };

    const handleAddIconFromLibrary = (name: string, Icon: React.ComponentType<{ className?: string }>) => {
        if (!editingCategory) return;

        if (editingCategory.icons.some(i => i.name === name)) {
            toast("Эта иконка уже есть в категории", "info");
            return;
        }

        const newIcon: IconItem = {
            name,
            label: name,
            icon: Icon
        };

        setEditingCategory({
            ...editingCategory,
            icons: [...editingCategory.icons, newIcon]
        });
        setIsLibraryPickerOpen(false);
    };

    return (
        <div className="space-y-6">
            {/* Single Unified Panel */}
            <div className="crm-card !p-0">
                {/* Header */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div>
                            <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-widest opacity-70 border-b border-slate-100 pb-3">
                                <Sparkles className="w-4 h-4 text-primary" /> Библиотека иконок
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                {totalIcons} {pluralize(totalIcons, 'иконка', 'иконки', 'иконок')} в {iconGroups.length} {pluralize(iconGroups.length, 'категория', 'категории', 'категорий')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-[var(--radius-inner)] font-bold h-9 border-slate-200"
                                onClick={() => handleAddNewCategory()}
                            >
                                <Plus className="w-4 h-4 mr-2 text-primary" />
                                Создать категорию
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-[var(--radius-inner)] font-bold h-9 border-slate-200"
                                onClick={() => setShowUploadModal(true)}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Загрузить SVG
                            </Button>
                        </div>
                    </div>


                </div>

                {/* Icons Grid Area */}
                <div className="px-6 pb-6 pt-2 overflow-y-auto custom-scrollbar max-h-[800px] bg-slate-50/30">
                    {iconGroups.length === 0 ? (
                        <div className="py-20 text-center">
                            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">
                                Иконки не найдены
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {iconGroups.map((group: IconGroup, groupIndex: number) => {
                                const GroupIcon = group.icons.length > 0 ? group.icons[0].icon : group.groupIcon;

                                return (
                                    <div key={`group-${group.id}-${groupIndex}`} className="bg-white rounded-[var(--radius-inner)] border border-slate-200/60 shadow-sm flex flex-col overflow-hidden group/card shadow-hover transition-all">
                                        {/* Category Header */}
                                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                                    {createElement(GroupIcon, {
                                                        className: "w-3.5 h-3.5 text-primary",
                                                    })}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-[13px] font-extrabold text-slate-700 uppercase tracking-wider truncate">
                                                        {group.label}
                                                    </h4>
                                                    <p className="text-[11px] text-slate-400 font-bold">
                                                        {group.icons.length} {pluralize(group.icons.length, 'иконка', 'иконки', 'иконок')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setEditingCategory(group)}
                                                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-primary"
                                                    aria-label={`Редактировать категорию ${group.label}`}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteCategory(group.id)}
                                                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-500"
                                                    aria-label={`Удалить категорию ${group.label}`}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Icons Grid - 10 per row */}
                                        <div className="p-3.5">
                                            <div className="grid grid-cols-10 gap-2">
                                                {group.icons.map((item: IconItem) => {
                                                    const Icon = item.icon;
                                                    const isSelected = selectedIcon === item.name;

                                                    return (
                                                        <div
                                                            key={item.name}
                                                            className="relative group/icon"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedIcon(
                                                                        isSelected ? null : item.name
                                                                    )
                                                                }
                                                                className={cn(
                                                                    "w-full aspect-square rounded-[8px] flex items-center justify-center transition-all bg-white border border-slate-100 hover:border-primary/50 hover:shadow hover:text-primary active:scale-95",
                                                                    isSelected &&
                                                                    "bg-primary border-primary text-white hover:bg-primary hover:text-white shadow-md shadow-primary/20"
                                                                )}
                                                                title={item.label}
                                                                aria-label={item.label}
                                                            >
                                                                {createElement(Icon, {
                                                                    className: "w-6 h-6",
                                                                })}
                                                            </button>


                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Category Modal */}
            <AnimatePresence>
                {editingCategory && (() => {
                    const EditGroupIcon = editingCategory.groupIcon || Sparkles;
                    const isExisting = iconGroups.some(g => g.id === editingCategory.id);

                    return (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                            onClick={() => setEditingCategory(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-[20px] shadow-2xl max-w-md w-full p-6 border border-slate-100"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <EditGroupIcon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                                            <Sparkles className="w-4 h-4 text-primary" /> {isExisting ? "Редактировать категорию" : "Новая категория"}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingCategory(null)}
                                        className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200"
                                        aria-label="Закрыть"
                                    >
                                        <X className="w-5 h-5 text-slate-500" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-2">
                                                <Building2 className="w-4 h-4 text-primary" /> Название категории
                                            </label>
                                            <Input
                                                value={editingCategory.label}
                                                onChange={e => setEditingCategory({ ...editingCategory, label: e.target.value })}
                                                placeholder="Напр. Аксессуары"
                                                className="h-11 font-medium"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="shrink-0">
                                            <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-2">
                                                <Sparkles className="w-4 h-4 text-primary" /> Иконка группы
                                            </label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-white hover:border-primary/50 transition-all shadow-sm group">
                                                        {(() => {
                                                            const Icon = editingCategory.groupIcon || Sparkles;
                                                            return <Icon className="w-5 h-5 text-slate-400 group-hover:text-primary" />;
                                                        })()}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[320px] p-0 z-[100] rounded-2xl shadow-2xl border-slate-100 overflow-hidden" align="end">
                                                    <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                                                        <div className="relative">
                                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                            <Input
                                                                type="text"
                                                                placeholder="Поиск..."
                                                                className="w-full h-9 pl-9 pr-4 border-slate-200 rounded-lg text-xs font-bold"
                                                                value={iconPickerSearch}
                                                                onChange={(e) => setIconPickerSearch(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto p-2 grid grid-cols-5 gap-1.5 custom-scrollbar">
                                                        {Object.entries(ALL_ICONS_MAP)
                                                            .filter(([name]) => name.toLowerCase().includes(iconPickerSearch.toLowerCase()))
                                                            .map(([name, Icon]) => (
                                                                <button
                                                                    key={`picker-${name}`}
                                                                    onClick={() => {
                                                                        setEditingCategory({ ...editingCategory, groupIcon: Icon });
                                                                        setIconPickerSearch("");
                                                                    }}
                                                                    className={cn(
                                                                        "w-10 h-10 rounded-lg flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-colors",
                                                                        editingCategory.groupIcon === Icon ? "bg-primary text-white hover:bg-primary hover:text-white" : "text-slate-400"
                                                                    )}
                                                                    title={name}
                                                                    aria-label={`Выбрать иконку ${name}`}
                                                                >
                                                                    <Icon className="w-5 h-5" />
                                                                </button>
                                                            ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2 px-1">
                                            <label className="flex items-center gap-2 text-[13px] font-bold text-slate-700">
                                                <Sparkles className="w-4 h-4 text-primary" /> Иконки в категории ({editingCategory.icons.length})
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="file"
                                                    accept=".svg"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleUploadSvg}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-[10px] font-bold rounded-lg border-slate-200"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Upload className="w-3 h-3 mr-1" />
                                                    SVG
                                                </Button>

                                                <Popover open={isLibraryPickerOpen} onOpenChange={setIsLibraryPickerOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 px-2 text-[10px] font-bold rounded-lg border-slate-200"
                                                        >
                                                            <Plus className="w-3 h-3 mr-1 text-primary" />
                                                            Библиотека
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[320px] p-0 z-[100] rounded-2xl shadow-2xl border-slate-100 overflow-hidden" align="end">
                                                        <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Поиск в библиотеке..."
                                                                    className="w-full h-9 pl-9 pr-4 border-slate-200 rounded-lg text-xs font-bold"
                                                                    value={librarySearch}
                                                                    onChange={(e) => setLibrarySearch(e.target.value)}
                                                                    autoFocus
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="max-h-[300px] overflow-y-auto p-2 grid grid-cols-5 gap-1.5 custom-scrollbar">
                                                            {Object.entries(ALL_ICONS_MAP)
                                                                .filter(([name]) => name.toLowerCase().includes(librarySearch.toLowerCase()))
                                                                .slice(0, LIBRARY_ICONS_LIMIT)
                                                                .map(([name, Icon]) => (
                                                                    <button
                                                                        key={`lib-picker-${name}`}
                                                                        onClick={() => handleAddIconFromLibrary(name, Icon)}
                                                                        className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-colors text-slate-400"
                                                                        title={name}
                                                                        aria-label={`Добавить иконку ${name}`}
                                                                    >
                                                                        <Icon className="w-5 h-5" />
                                                                    </button>
                                                                ))}
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-6 gap-2 p-3 bg-slate-50 rounded-xl max-h-[220px] overflow-y-auto border border-slate-100 custom-scrollbar">
                                                {editingCategory.icons.map((icon) => (
                                                    <div
                                                        key={`edit-group-icon-${icon.name}`}
                                                        className="aspect-square rounded-lg flex items-center justify-center bg-white border border-slate-200 shadow-sm relative group/edit-icon"
                                                    >
                                                        {createElement(icon.icon, { className: "w-5 h-5 text-slate-600" })}

                                                        <button
                                                            onClick={() => {
                                                                const updatedIcons = editingCategory.icons.filter(i => i.name !== icon.name);
                                                                setEditingCategory({ ...editingCategory, icons: updatedIcons });
                                                            }}
                                                            className="absolute -top-1.5 -right-1.5 bg-red-50 text-red-500 border border-red-100 rounded-full p-1 opacity-0 group-hover/edit-icon:opacity-100 transition-all hover:bg-red-100 hover:scale-110 shadow-sm"
                                                            aria-label={`Удалить иконку ${icon.label}`}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {editingCategory.icons.length === 0 && (
                                                    <div className="col-span-6 py-8 px-4 text-center text-slate-400 text-[10px] font-medium leading-relaxed">
                                                        В этой категории еще нет иконок. Используйте кнопки выше, чтобы добавить их из библиотеки или загрузить свои.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-8 pt-2">
                                    {isExisting ? (
                                        <Button
                                            variant="ghost"
                                            className="btn-destructive-ghost font-bold px-4 h-11 rounded-[var(--radius-inner)]"
                                            onClick={() => handleDeleteCategory(editingCategory.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Удалить
                                        </Button>
                                    ) : <div />}

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            className="rounded-[14px] font-bold h-11 px-6 border-slate-200 text-slate-500"
                                            onClick={() => setEditingCategory(null)}
                                        >
                                            Отмена
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="btn-dark !bg-[#1b1b1b] hover:!bg-black hover:!text-white rounded-[var(--radius-inner)] font-bold h-11 px-8 shadow-xl shadow-slate-900/10 border-none text-white"
                                            onClick={handleSaveCategory}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                            ) : (
                                                <Save className="w-4 h-4 mr-2" />
                                            )}
                                            {isSaving ? "Сохранение..." : (isExisting ? "Сохранить" : "Создать категорию")}
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Selected Icon Details Panel */}
            <AnimatePresence>
                {selectedIcon && (() => {
                    const iconItem = iconGroups.flatMap(
                        (g: IconGroup) => g.icons
                    ).find((i: IconItem) => i.name === selectedIcon);

                    return (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-lg"
                        >
                            <div className="crm-card flex items-center gap-4 !shadow-2xl !border-2 !border-primary/20 !bg-white/95 backdrop-blur-xl">
                                <div className="w-12 h-12 rounded-[12px] bg-primary flex items-center justify-center shrink-0">
                                    {iconItem?.icon && createElement(iconItem.icon, {
                                        className: "w-6 h-6 text-white",
                                    })}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-bold text-slate-900 truncate">
                                        {iconItem?.label || selectedIcon}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono truncate">
                                        {selectedIcon}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-auto">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-[10px] h-9 w-9 p-0"
                                        onClick={() => setSelectedIcon(null)}
                                        aria-label="Закрыть панель иконки"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* Upload Modal — now fully functional */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                        onClick={() => { setShowUploadModal(false); setUploadedFile(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[24px] shadow-2xl max-w-lg w-full p-8 border border-slate-100"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Upload className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Загрузить SVG
                                    </h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => { setShowUploadModal(false); setUploadedFile(null); }}
                                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200"
                                    aria-label="Закрыть"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </Button>
                            </div>

                            {/* Upload Zone — connected via label + htmlFor */}
                            <label
                                htmlFor="svg-upload-modal"
                                className={cn(
                                    "border-2 border-dashed rounded-[20px] p-10 text-center transition-all cursor-pointer group bg-slate-50/50 hover:bg-white active:scale-[0.98] block",
                                    uploadedFile
                                        ? "border-primary/50 bg-primary/5"
                                        : "border-slate-200 hover:border-primary/50"
                                )}
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 mx-auto mb-5 flex items-center justify-center group-hover:shadow-md transition-all">
                                    {uploadedFile ? (
                                        <Sparkles className="w-8 h-8 text-primary" />
                                    ) : (
                                        <Upload className="w-8 h-8 text-primary shadow-primary/20" />
                                    )}
                                </div>
                                {uploadedFile ? (
                                    <>
                                        <p className="text-slate-700 font-bold mb-1 text-lg">
                                            {uploadedFile.name}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            {(uploadedFile.size / 1024).toFixed(1)} KB • Нажмите, чтобы выбрать другой
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-slate-700 font-bold mb-1 text-lg">
                                            Перетащите SVG файл сюда
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            макс. размер 50KB, только контурные SVG
                                        </p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept=".svg"
                                    className="hidden"
                                    id="svg-upload-modal"
                                    ref={uploadModalInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setUploadedFile(file);
                                    }}
                                />
                            </label>

                            {/* Info */}
                            <div className="mt-6 p-4 bg-amber-50/50 rounded-[16px] border border-amber-100 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-amber-800">
                                        Технические требования
                                    </p>
                                    <ul className="text-xs text-amber-700 mt-2 space-y-1.5">
                                        <li className="flex items-center gap-2">• ViewBox должен быть <span className="font-mono bg-white px-1 rounded">24x24</span></li>
                                        <li className="flex items-center gap-2">• Толщина линий (stroke) <span className="font-mono bg-white px-1 rounded">1.5px</span></li>
                                        <li className="flex items-center gap-2">• Удалите все <span className="font-mono bg-white px-1 rounded">fill</span> атрибуты</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                                <Button
                                    variant="outline"
                                    className="rounded-xl font-bold h-12 px-6"
                                    onClick={() => { setShowUploadModal(false); setUploadedFile(null); }}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    className="btn-dark rounded-xl font-bold h-12 px-8 shadow-xl shadow-slate-900/20"
                                    disabled={!uploadedFile}
                                    onClick={() => handleUploadFromModal(uploadedFile)}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Добавить
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {categoryToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
                        onClick={() => setCategoryToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[24px] shadow-2xl max-w-sm w-full p-8 border border-slate-100"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                                    <Trash2 className="w-8 h-8 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Удалить категорию?
                                </h3>
                                <p className="text-slate-500 font-medium mb-8">
                                    Вы уверены, что хотите удалить эту категорию? Это действие нельзя будет отменить.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="destructive"
                                    className="w-full rounded-xl font-bold h-12 shadow-lg shadow-red-500/20 border-none text-white"
                                    onClick={confirmDeleteAction}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Удаление..." : "Удалить категорию"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full rounded-xl font-bold h-12 text-slate-500 border-slate-200"
                                    onClick={() => setCategoryToDelete(null)}
                                >
                                    Отмена
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
