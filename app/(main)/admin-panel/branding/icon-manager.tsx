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
import { ICON_GROUPS as INITIAL_ICON_GROUPS, ALL_ICONS_MAP, SerializedIconGroup } from "@/app/(main)/dashboard/warehouse/category-utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { updateIconGroups } from "./actions";
import { useToast } from "@/components/ui/toast";
import {
    pluralize,
    prepareGroupsForSave,
    serializeIconGroups,
    hydrateIconGroups,
    createSvgIcon
} from "./components/icon-manager/utils";

// Constants
const LIBRARY_ICONS_LIMIT = 50;


import { IconGroup, IconItem, CategoryDialog, UploadIconModal, DeleteConfirmation } from "./components/icon-manager";

export function IconManager({ initialData }: { initialData?: SerializedIconGroup[] }) {
    const [uiState, setUiState] = useState({
        selectedIcon: null as string | null,
        showUploadModal: false,
        isSaving: false,
        editingCategory: null as IconGroup | null,
        categoryToDelete: null as string | null,
    });

    const { toast } = useToast();

    // Categories state
    const [dataState, setDataState] = useState({
        iconGroups: (() => {
            const rawGroups = initialData
                ? hydrateIconGroups(initialData)
                : INITIAL_ICON_GROUPS;

            return rawGroups.map((g, idx): IconGroup => {
                const group = g as Partial<IconGroup> & { name?: string };
                return {
                    id: group.id || group.name?.toLowerCase().replace(/\s+/g, '-') || `cat-${idx}`,
                    label: group.label || group.name || "Без названия",
                    groupIcon: group.groupIcon || Sparkles,
                    icons: group.icons || []
                };
            });
        })()
    });

    const totalIcons = dataState.iconGroups.reduce(
        (acc: number, g: IconGroup) => acc + g.icons.length,
        0
    );

    // Escape key handler for selected icon
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (uiState.selectedIcon) setUiState(prev => ({ ...prev, selectedIcon: null }));
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [uiState.selectedIcon]);

    const handleSaveCategory = async () => {
        if (!uiState.editingCategory) return;

        if (!uiState.editingCategory.label.trim()) {
            toast("Пожалуйста, введите название категории", "warning");
            return;
        }

        setUiState(prev => ({ ...prev, isSaving: true }));

        let updatedGroups;
        const exists = dataState.iconGroups.some(g => g.id === uiState.editingCategory?.id);
        if (exists) {
            updatedGroups = dataState.iconGroups.map(g => g.id === uiState.editingCategory?.id ? uiState.editingCategory! : g);
        } else {
            updatedGroups = [...dataState.iconGroups, uiState.editingCategory];
        }

        setDataState(prev => ({ ...prev, iconGroups: updatedGroups }));

        try {
            const serializedData = serializeIconGroups(prepareGroupsForSave(updatedGroups)).map(g => ({
                ...g,
                groupIconName: g.group_icon || "box" // Ensure compatibility with existing actions
            } as typeof g & { groupIconName: string }));

            const result = await updateIconGroups(serializedData);
            if (result.error) {
                toast(`Ошибка при сохранении: ${result.error}`, "error");
            }
        } catch (error) {
            console.error("Failed to save icon groups:", error);
            toast(error instanceof Error ? error.message : "Неизвестная ошибка при сохранении", "error");
        } finally {
            setUiState(prev => ({ ...prev, isSaving: false, editingCategory: null }));
        }
    };

    const handleDeleteCategory = (categoryId: string) => {
        setUiState(prev => ({ ...prev, categoryToDelete: categoryId }));
    };

    const confirmDeleteAction = async () => {
        if (!uiState.categoryToDelete) return;

        const categoryId = uiState.categoryToDelete;
        setUiState(prev => ({ ...prev, isSaving: true }));

        const updatedGroups = dataState.iconGroups.filter(g => g.id !== categoryId);
        setDataState(prev => ({ ...prev, iconGroups: updatedGroups }));

        try {
            const serializedData = serializeIconGroups(prepareGroupsForSave(updatedGroups)).map(g => ({
                ...g,
                groupIconName: g.group_icon || "box" // Ensure compatibility with existing actions
            } as typeof g & { groupIconName: string }));

            const result = await updateIconGroups(serializedData);
            if (result.error) {
                toast(`Ошибка при сохранении: ${result.error}`, "error");
            }
        } catch (error) {
            console.error("Failed to save icon groups:", error);
            toast(error instanceof Error ? error.message : "Неизвестная ошибка при сохранении", "error");
        } finally {
            setUiState(prev => ({ ...prev, isSaving: false, categoryToDelete: null, editingCategory: null }));
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

        setUiState(prev => ({ ...prev, editingCategory: newCategory }));
    };

    // Handler for uploading SVG from the standalone Upload Modal
    const handleUploadFromModal = (file: File) => {
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
            if (uiState.editingCategory) {
                setUiState(prev => ({
                    ...prev,
                    editingCategory: prev.editingCategory ? {
                        ...prev.editingCategory,
                        icons: [...prev.editingCategory.icons, newIcon]
                    } : null
                }));
            } else if (dataState.iconGroups.length > 0) {
                const updatedGroups = [...dataState.iconGroups];
                updatedGroups[0] = {
                    ...updatedGroups[0],
                    icons: [...updatedGroups[0].icons, newIcon]
                };
                setDataState(prev => ({ ...prev, iconGroups: updatedGroups }));

                // Auto-save
                updateIconGroups(serializeIconGroups(prepareGroupsForSave(updatedGroups))).catch((error) => {
                    console.error("Failed to auto-save after upload:", error);
                });
            }

            setUiState(prev => ({ ...prev, showUploadModal: false }));
            toast("Иконка успешно загружена", "success");
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-4">
            {/* Single Unified Panel */}
            <div className="crm-card !p-0">
                {/* Header */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 opacity-70 border-b border-slate-100 pb-3">
                                <Sparkles className="w-4 h-4 text-primary" /> Библиотека иконок
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                                {totalIcons} {pluralize(totalIcons, 'иконка', 'иконки', 'иконок')} в {dataState.iconGroups.length} {pluralize(dataState.iconGroups.length, 'категория', 'категории', 'категорий')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-md font-bold h-9 border-slate-200"
                                onClick={() => handleAddNewCategory()}
                            >
                                <Plus className="w-4 h-4 mr-2 text-primary" />
                                Создать категорию
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-md font-bold h-9 border-slate-200"
                                onClick={() => setUiState(prev => ({ ...prev, showUploadModal: true }))}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Загрузить SVG
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Icons Grid Area */}
                <div className="px-6 pb-6 pt-2 overflow-y-auto custom-scrollbar max-h-[800px] bg-slate-50/30">
                    {dataState.iconGroups.length === 0 ? (
                        <div className="py-20 text-center">
                            <Search className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">
                                Иконки не найдены
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {dataState.iconGroups.map((group: IconGroup, groupIndex: number) => {
                                const GroupIcon = group.icons.length > 0 ? group.icons[0].icon : group.groupIcon;

                                return (
                                    <div key={`group-${group.id}-${groupIndex}`} className="bg-white rounded-xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden group/card shadow-hover transition-all">
                                        {/* Category Header */}
                                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                                    {createElement(GroupIcon, {
                                                        className: "w-3.5 h-3.5 text-primary",
                                                    })}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-extrabold text-slate-700 truncate">
                                                        {group.label}
                                                    </h4>
                                                    <p className="text-xs text-slate-400 font-bold">
                                                        {group.icons.length} {pluralize(group.icons.length, 'иконка', 'иконки', 'иконок')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setUiState(prev => ({ ...prev, editingCategory: group }))}
                                                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-primary"
                                                    aria-label={`Редактировать категорию ${group.label}`}
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    type="button"
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
                                                    const isSelected = uiState.selectedIcon === item.name;

                                                    return (
                                                        <div
                                                            key={item.name}
                                                            className="relative group/icon"
                                                        >
                                                            <button type="button"
                                                                onClick={() =>
                                                                    setUiState(prev => ({
                                                                        ...prev,
                                                                        selectedIcon: isSelected ? null : item.name
                                                                    }))
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

            {/* Sub-components for Modals and Dialogs */}
            <CategoryDialog
                isOpen={!!uiState.editingCategory}
                onClose={() => setUiState(prev => ({ ...prev, editingCategory: null }))}
                category={uiState.editingCategory}
                onChange={(cat) => setUiState(prev => ({ ...prev, editingCategory: cat }))}
                onSave={handleSaveCategory}
                onDelete={handleDeleteCategory}
                isSaving={uiState.isSaving}
                isExisting={dataState.iconGroups.some(g => g.id === uiState.editingCategory?.id)}
                toast={toast}
            />

            <UploadIconModal
                isOpen={uiState.showUploadModal}
                onClose={() => setUiState(prev => ({ ...prev, showUploadModal: false }))}
                onUpload={handleUploadFromModal}
            />

            <DeleteConfirmation
                isOpen={!!uiState.categoryToDelete}
                onClose={() => setUiState(prev => ({ ...prev, categoryToDelete: null }))}
                onConfirm={confirmDeleteAction}
                isDeleting={uiState.isSaving}
            />

            {/* Selected Icon Details Panel */}
            <AnimatePresence>
                {uiState.selectedIcon && (() => {
                    const iconItem = dataState.iconGroups.flatMap(
                        (g: IconGroup) => g.icons
                    ).find((i: IconItem) => i.name === uiState.selectedIcon);

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
                                        {iconItem?.label || uiState.selectedIcon}
                                    </p>
                                    <p className="text-xs text-slate-400 font-mono truncate">
                                        {uiState.selectedIcon}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-auto">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        className="rounded-[10px] h-9 w-9 p-0"
                                        onClick={() => setUiState(prev => ({ ...prev, selectedIcon: null }))}
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
        </div>
    );
}
