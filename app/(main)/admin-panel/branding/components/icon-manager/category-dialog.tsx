"use client";

import { useState, useRef, createElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Sparkles, Search, Upload, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ALL_ICONS_MAP, createSvgIcon } from "@/app/(main)/dashboard/warehouse/category-utils";
import { IconGroup, IconItem } from "./types";

interface CategoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    category: IconGroup | null;
    onChange: (category: IconGroup) => void;
    onSave: () => void;
    onDelete: (id: string) => void;
    isSaving: boolean;
    isExisting: boolean;
    toast: (msg: string, type: "success" | "error" | "warning" | "info") => void;
}

const LIBRARY_ICONS_LIMIT = 50;

export function CategoryDialog({
    isOpen,
    onClose,
    category,
    onChange,
    onSave,
    onDelete,
    isSaving,
    isExisting,
    toast
}: CategoryDialogProps) {
    const [iconPickerSearch, setIconPickerSearch] = useState("");
    const [librarySearch, setLibrarySearch] = useState("");
    const [isLibraryPickerOpen, setIsLibraryPickerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!category) return null;

    const EditGroupIcon = category.groupIcon || Sparkles;

    const handleUploadSvg = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
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

            onChange({
                ...category,
                icons: [...category.icons, newIcon]
            });
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const handleAddIconFromLibrary = (name: string, Icon: React.ComponentType<{ className?: string }>) => {
        if (category.icons.some(i => i.name === name)) {
            toast("Эта иконка уже есть в категории", "info");
            return;
        }

        const newIcon: IconItem = {
            name,
            label: name,
            icon: Icon
        };

        onChange({
            ...category,
            icons: [...category.icons, newIcon]
        });
        setIsLibraryPickerOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <EditGroupIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Sparkles className="w-4 h-4 text-primary" /> {isExisting ? "Редактировать категорию" : "Новая категория"}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <Building2 className="w-4 h-4 text-primary" /> Название категории
                                    </label>
                                    <Input
                                        value={category.label}
                                        onChange={e => onChange({ ...category, label: e.target.value })}
                                        placeholder="Напр. Аксессуары"
                                        className="h-11 font-medium"
                                        autoFocus
                                    />
                                </div>
                                <div className="shrink-0">
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                                        <Sparkles className="w-4 h-4 text-primary" /> Иконка группы
                                    </label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button type="button" className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-white hover:border-primary/50 transition-all shadow-sm group">
                                                {createElement(category.groupIcon || Sparkles, {
                                                    className: "w-5 h-5 text-slate-400 group-hover:text-primary"
                                                })}
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
                                                        <button type="button"
                                                            key={`picker-${name}`}
                                                            onClick={() => {
                                                                onChange({ ...category, groupIcon: Icon });
                                                                setIconPickerSearch("");
                                                            }}
                                                            className={cn(
                                                                "w-10 h-10 rounded-lg flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-colors",
                                                                category.groupIcon === Icon ? "bg-primary text-white hover:bg-primary hover:text-white" : "text-slate-400"
                                                            )}
                                                            title={name}
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
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                        <Sparkles className="w-4 h-4 text-primary" /> Иконки в категории ({category.icons.length})
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
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 text-xs font-bold rounded-lg border-slate-200"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="w-3 h-3 mr-1" />
                                            SVG
                                        </Button>

                                        <Popover open={isLibraryPickerOpen} onOpenChange={setIsLibraryPickerOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs font-bold rounded-lg border-slate-200"
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
                                                            <button type="button"
                                                                key={`lib-picker-${name}`}
                                                                onClick={() => handleAddIconFromLibrary(name, Icon)}
                                                                className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-colors text-slate-400"
                                                                title={name}
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
                                        {category.icons.map((icon) => (
                                            <div
                                                key={`edit-group-icon-${icon.name}`}
                                                className="aspect-square rounded-lg flex items-center justify-center bg-white border border-slate-200 shadow-sm relative group/edit-icon"
                                            >
                                                {createElement(icon.icon, { className: "w-5 h-5 text-slate-600" })}

                                                <button type="button"
                                                    onClick={() => {
                                                        const updatedIcons = category.icons.filter(i => i.name !== icon.name);
                                                        onChange({ ...category, icons: updatedIcons });
                                                    }}
                                                    className="absolute -top-1.5 -right-1.5 bg-red-50 text-red-500 border border-red-100 rounded-full p-1 opacity-0 group-hover/edit-icon:opacity-100 transition-all hover:bg-red-100 hover:scale-110 shadow-sm"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {category.icons.length === 0 && (
                                            <div className="col-span-6 py-8 px-4 text-center text-slate-400 text-xs font-medium leading-relaxed">
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
                                    type="button"
                                    variant="ghost"
                                    className="btn-destructive-ghost font-bold px-4 h-11 rounded-[var(--radius-inner)]"
                                    onClick={() => onDelete(category.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Удалить
                                </Button>
                            ) : <div />}

                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-[14px] font-bold h-11 px-6 border-slate-200 text-slate-500"
                                    onClick={onClose}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="btn-dark !bg-[#1b1b1b] hover:!bg-black hover:!text-white rounded-[var(--radius-inner)] font-bold h-11 px-8 shadow-xl shadow-slate-900/10 border-none text-white"
                                    onClick={onSave}
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
            )}
        </AnimatePresence>
    );
}
