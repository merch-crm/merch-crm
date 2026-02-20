"use client";

import { useState, createElement } from "react";
import { Check, Trash2, AlertCircle } from "lucide-react";
import { SubmitButton } from "./submit-button";
import { Button } from "@/components/ui/button";

import { updateInventoryCategory, deleteInventoryCategory } from "./category-actions";;
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Session } from "@/lib/auth";
import { useToast } from "@/components/ui/toast";


import { Category } from "./types";

import { getCategoryIcon, getGradientStyles, getColorStyles, COLORS, getIconNameFromName, generateCategoryPrefix } from "./category-utils";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Switch } from "@/components/ui/switch";


interface EditCategoryDialogProps {
    category: Category & { prefix?: string | null, isSystem?: boolean };
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
    user: Session | null;
}

export function EditCategoryDialog({ category, categories, isOpen, onClose }: EditCategoryDialogProps) {
    const { toast } = useToast();
    const [uiState, setUiState] = useState({
        isPending: false,
        deletePassword: "",
        error: null as string | null,
        showDeleteModal: false,
        subToDelete: null as string | null,
        subPending: false,
        prevCategoryId: category.id
    });

    const [formState, setFormState] = useState({
        name: category.name,
        prefix: category.prefix || "",
        prefixManuallyEdited: false,
        color: category.color || "primary",
        showInSku: category.showInSku ?? true,
        showInName: category.showInName ?? true,
    });

    // Reset state when category changes
    if (category.id !== uiState.prevCategoryId) {
        setUiState(prev => ({
            ...prev,
            prevCategoryId: category.id,
            error: null,
            deletePassword: "",
            showDeleteModal: false,
            subToDelete: null,
            isPending: false,
            subPending: false
        }));
        setFormState({
            name: category.name,
            prefix: category.prefix || "",
            prefixManuallyEdited: false,
            color: category.color || "primary",
            showInSku: category.showInSku ?? true,
            showInName: category.showInName ?? true,
        });
    }

    const router = useRouter();

    const selectedParentId = category.parentId || "";
    const subCategories = (categories || []).filter(c => c.parentId === category.id);
    const isParentCategory = !category.parentId;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setUiState(prev => ({ ...prev, isPending: true, error: null }));

        const formData = new FormData(event.currentTarget);
        const nameInput = (event.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
        formData.set("icon", getIconNameFromName(nameInput));
        formData.set("color", formState.color);
        formData.set("parentId", selectedParentId);
        formData.set("showInSku", String(formState.showInSku));
        formData.set("showInName", String(formState.showInName));

        const result = await updateInventoryCategory(category.id, formData);

        if (!result.success) {
            setUiState(prev => ({ ...prev, error: result.error, isPending: false }));
        } else {
            onClose();
            setUiState(prev => ({ ...prev, isPending: false }));
            router.refresh();
        }
    }

    async function handleDeleteCategory() {
        setUiState(prev => ({ ...prev, isPending: true }));
        const result = await deleteInventoryCategory(category.id);
        if (!result.success) {
            setUiState(prev => ({ ...prev, error: result.error, isPending: false, showDeleteModal: false, deletePassword: "" }));
        } else {
            setUiState(prev => ({ ...prev, isPending: false, showDeleteModal: false }));
            onClose();
            router.refresh();
        }
    }

    async function handleDeleteSubcategory(subId: string) {
        setUiState(prev => ({ ...prev, subToDelete: subId }));
    }

    async function confirmDeleteSub() {
        if (!uiState.subToDelete) return;
        setUiState(prev => ({ ...prev, subPending: true }));
        const result = await deleteInventoryCategory(uiState.subToDelete);
        if (result.success) {
            toast("Подкатегория удалена", "success");
            router.refresh();
        } else {
            toast(result.error || "Ошибка при удалении", "error");
        }
        setUiState(prev => ({ ...prev, subPending: false, subToDelete: null }));
    }

    const MainIcon = getCategoryIcon({ name: formState.name });
    const subToDeleteData = subCategories.find(s => s.id === uiState.subToDelete);

    return (
        <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Редактирование категории" showVisualTitle={false}>
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className={cn("w-12 h-12 rounded-[14px] flex items-center justify-center transition-all duration-500 shadow-lg shrink-0 text-white bg-gradient-to-br", getGradientStyles(formState.color))}>
                            {createElement(MainIcon, { className: "w-6 h-6 stroke-[2.5]" })}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">Редактировать</h2>
                            <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                                Категория: <span className="text-slate-900 font-bold">{category.name}</span>
                            </p>
                        </div>
                    </div>

                </div>

                <form id="edit-category-form" onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1">
                    {uiState.error && (
                        <div className="p-3 rounded-[var(--radius-inner)] bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4" />
                            {uiState.error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Название категории</label>
                            <input
                                name="name"
                                required
                                value={formState.name}
                                placeholder="Напр. Футболки"
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setFormState(prev => ({
                                        ...prev,
                                        name,
                                        prefix: prev.prefixManuallyEdited ? prev.prefix : generateCategoryPrefix(name)
                                    }));
                                }}
                                className="w-full h-11 px-4 rounded-[var(--radius-inner)] border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 bg-slate-50 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm outline-none shadow-sm"
                            />
                        </div>
                        <div className="space-y-2 w-28">
                            <label className="text-sm font-bold text-slate-700 ml-1">Артикул</label>
                            <input
                                name="prefix"
                                value={formState.prefix}
                                placeholder="TS"
                                className="w-full h-11 px-4 rounded-[var(--radius-inner)] border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 bg-slate-50 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-center text-sm outline-none shadow-sm tabular-nums"
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                                    setFormState(prev => ({ ...prev, prefix: val, prefixManuallyEdited: true }));
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-3 shadow-sm">
                            <span className="text-sm font-bold text-slate-700 leading-none">Иконка</span>
                            <div className="flex items-center justify-center py-2">
                                <div className={cn("w-10 h-10 shrink-0 rounded-[12px] flex items-center justify-center transition-all shadow-md ring-1 ring-black/5 text-white bg-gradient-to-br", getGradientStyles(formState.color))}>
                                    {createElement(MainIcon, { className: "w-5 h-5 stroke-[2.5]" })}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-3 shadow-sm">
                            <span className="text-sm font-bold text-slate-700 leading-none">Цвет</span>
                            <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-2.5">
                                {COLORS.map((color) => {
                                    const isSelected = formState.color === color.name;
                                    return (
                                        <Button
                                            key={color.name}
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setFormState(prev => ({ ...prev, color: color.name }))}
                                            className={cn(
                                                "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300 relative group shadow-sm ring-1 ring-black/5 p-0",
                                                color.class,
                                                isSelected ? "ring-2 ring-offset-2 ring-slate-300 scale-110" : "opacity-80 hover:opacity-100"
                                            )}
                                        >
                                            {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[4]" />}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm relative overflow-hidden flex items-center min-h-[70px]">
                            <div className="flex items-center justify-between group w-full">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-bold text-slate-900 leading-[1.1]">Добавлять<br className="sm:hidden" /><span className="hidden sm:inline"> </span>в артикул</span>
                                    <span className="text-xs text-slate-400 font-bold leading-tight mt-0.5">Будет в SKU</span>
                                </div>
                                <Switch
                                    checked={formState.showInSku}
                                    onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInSku: val }))}
                                    variant="success"
                                />
                            </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm relative overflow-hidden flex items-center min-h-[70px]">
                            <div className="flex items-center justify-between group w-full">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[11px] font-bold text-slate-900 leading-[1.1]">Добавлять<br className="sm:hidden" /><span className="hidden sm:inline"> </span>в название</span>
                                    <span className="text-xs text-slate-400 font-bold leading-tight mt-0.5">Будет в имени</span>
                                </div>
                                <Switch
                                    checked={formState.showInName}
                                    onCheckedChange={(val) => setFormState(prev => ({ ...prev, showInName: val }))}
                                    variant="success"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Описание категории</label>
                        <textarea
                            name="description"
                            defaultValue={category.description || ""}
                            placeholder="Расскажите об этой категории..."
                            className="w-full min-h-[64px] p-4 rounded-[var(--radius-inner)] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-sm placeholder:text-slate-300 resize-none bg-slate-50 leading-relaxed shadow-sm"
                        />
                    </div>

                    {isParentCategory && (
                        <div className="space-y-4 pt-3">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-sm font-bold text-slate-700">Подкатегории</label>
                                <span className="bg-slate-50 text-slate-900 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm">{subCategories.length}</span>
                            </div>

                            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-3 md:gap-4">
                                {subCategories.map(sub => {
                                    const IconComponent = getCategoryIcon(sub);
                                    return (
                                        <div key={sub.id} className="group relative flex flex-col items-center justify-center p-2 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 hover:border-primary/20 hover:shadow-md transition-all cursor-default shadow-sm overflow-visible min-h-[90px]">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                disabled={uiState.subPending}
                                                onClick={() => handleDeleteSubcategory(sub.id)}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white shadow-lg rounded-full flex items-center justify-center transition-all z-10 border border-white active:scale-95"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                            <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-black/5 mb-2 transition-all", getColorStyles(sub.color || 'primary'))}>
                                                <IconComponent className="w-6 h-6 md:w-7 md:h-7 shadow-sm" />
                                            </div>
                                            <span className="text-xs md:text-[11px] font-bold text-slate-500 truncate w-full text-center px-0.5 leading-tight">{sub.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </form>

                <div className="sticky bottom-0 z-10 p-4 sm:p-6 sm:pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 grid grid-cols-2 lg:flex items-center lg:justify-between gap-3 shrink-0">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setUiState(prev => ({ ...prev, showDeleteModal: true }))}
                        className="lg:flex-none lg:px-6 h-11 rounded-[var(--radius-inner)] flex items-center justify-center gap-2 font-bold text-sm w-full lg:w-auto"
                    >
                        <Trash2 className="w-4 h-4" />
                        Удалить
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="hidden lg:flex lg:ml-auto h-11 lg:px-8 text-slate-400 font-bold text-sm"
                    >
                        Отмена
                    </Button>

                    <SubmitButton
                        form="edit-category-form"
                        label="Сохранить"
                        pendingLabel="..."
                        className="h-11 w-full lg:w-auto lg:min-w-[140px] lg:px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm transition-all"
                    />
                </div>

                {/* Subcategory Deletion Confirmation */}
                <ResponsiveModal isOpen={!!uiState.subToDelete} onClose={() => setUiState(prev => ({ ...prev, subToDelete: null }))}>
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 text-rose-500 shadow-sm border border-rose-100">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight px-4">
                            Удалить подкатегорию «{subToDeleteData?.name}»?
                        </h3>
                        <p className="text-[12px] font-medium text-slate-400 mb-8 leading-relaxed max-w-[240px]">Это действие нельзя отменить. Подкатегория будет полностью удалена.</p>

                        <div className="flex flex-col gap-2 w-full max-w-[280px]">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={confirmDeleteSub}
                                className="h-12 w-full rounded-[var(--radius-inner)] text-white font-bold text-sm shadow-lg shadow-rose-500/20"
                            >
                                Удалить
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setUiState(prev => ({ ...prev, subToDelete: null }))}
                                className="hidden lg:flex h-11 w-full rounded-[var(--radius-inner)] text-slate-400 font-bold text-sm"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </ResponsiveModal>

                {/* Category Deletion Confirmation */}
                <ResponsiveModal
                    isOpen={uiState.showDeleteModal}
                    onClose={() => { setUiState(prev => ({ ...prev, showDeleteModal: false, deletePassword: "" })); }}
                    showVisualTitle={false}
                >
                    <div className="p-10 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-500 shadow-sm border border-rose-100">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight px-4">
                            Удалить категорию «{category.name}»?
                        </h3>
                        <p className="text-[13px] font-bold text-rose-400 mb-8 leading-relaxed px-2">Все товары станут «Без категории»</p>

                        {category.isSystem && (
                            <div className="mb-8 w-full p-5 bg-rose-50/50 rounded-2xl border border-rose-100 text-left shadow-inner">
                                <label className="text-sm font-bold text-rose-600 mb-3 block">Системная защита</label>
                                <input
                                    type="password"
                                    value={uiState.deletePassword}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setUiState(prev => ({ ...prev, deletePassword: val }));
                                    }}
                                    placeholder="Пароль от аккаунта"
                                    className="w-full h-12 px-4 rounded-[var(--radius-inner)] border border-rose-200 bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none text-sm font-bold shadow-sm"
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-3 w-full items-center">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDeleteCategory}
                                disabled={uiState.isPending || (category.isSystem && !uiState.deletePassword.trim())}
                                className="h-12 w-full max-w-[320px] bg-[#ff463c] hover:bg-[#ff463c]/90 text-white rounded-[var(--radius-inner)] font-bold text-sm shadow-lg shadow-rose-500/20 border-none"
                            >
                                {uiState.isPending ? "Удаление..." : "Удалить категорию"}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => { setUiState(prev => ({ ...prev, showDeleteModal: false, deletePassword: "" })); }}
                                className="h-11 w-full text-slate-400 font-bold text-sm"
                            >
                                Отмена
                            </Button>
                        </div>
                    </div>
                </ResponsiveModal>
            </div>
        </ResponsiveModal >
    );
}
