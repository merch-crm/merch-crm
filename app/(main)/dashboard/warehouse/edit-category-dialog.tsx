"use client";

import { useState, type ReactNode, useEffect } from "react";
import { Check, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { SubmitButton } from "./submit-button";

import { updateInventoryCategory, deleteInventoryCategory } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Session } from "@/lib/auth";


import { Category } from "./types";
import { createElement } from "react";
import { getCategoryIcon, getColorStyles, COLORS, getIconNameFromName, generateCategoryPrefix } from "./category-utils";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

function Switch({
    checked,
    onChange,
    disabled,
    label,
    description
}: {
    checked: boolean,
    onChange: (val: boolean) => void,
    disabled?: boolean,
    label?: ReactNode,
    description?: string
}) {
    return (
        <div className={cn(
            "flex items-center justify-between group w-full",
            disabled && "opacity-50"
        )}>
            <div className="flex flex-col gap-0.5">
                {label && (
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-900 leading-[1.1]">{label}</span>
                    </div>
                )}
                {description && <span className="text-[9px] text-slate-400 font-bold leading-tight uppercase tracking-wider mt-0.5">{description}</span>}
            </div>
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-inner",
                    checked ? "bg-primary" : "bg-slate-200",
                    disabled && "cursor-not-allowed"
                )}
            >
                <span
                    className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
}

interface EditCategoryDialogProps {
    category: Category & { prefix?: string | null, isSystem?: boolean };
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
    user: Session | null;
}

export function EditCategoryDialog({ category, categories, isOpen, onClose }: EditCategoryDialogProps) {
    const [isPending, setIsPending] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState(category.name);
    const [categoryPrefix, setCategoryPrefix] = useState(category.prefix || "");
    const [prefixManuallyEdited, setPrefixManuallyEdited] = useState(false);
    const [selectedColor, setSelectedColor] = useState(category.color || "primary");
    const [showInSku, setShowInSku] = useState(category.showInSku ?? true);
    const [showInName, setShowInName] = useState(category.showInName ?? true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subToDelete, setSubToDelete] = useState<string | null>(null);
    const [subPending, setSubPending] = useState(false);
    const [prevCategoryId, setPrevCategoryId] = useState(category.id);

    // Reset state when category changes
    if (category.id !== prevCategoryId) {
        setPrevCategoryId(category.id);
        setCategoryName(category.name);
        setCategoryPrefix(category.prefix || "");
        setSelectedColor(category.color || "primary");
        setShowInSku(category.showInSku ?? true);
        setShowInName(category.showInName ?? true);
        setPrefixManuallyEdited(false);
        setError(null);
    }

    const router = useRouter();

    const selectedParentId = category.parentId || "";
    const subCategories = categories.filter(c => c.parentId === category.id);
    const isParentCategory = !category.parentId;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const nameInput = (event.currentTarget.elements.namedItem("name") as HTMLInputElement).value;
        formData.set("icon", getIconNameFromName(nameInput));
        formData.set("color", selectedColor);
        formData.set("parentId", selectedParentId);
        formData.set("showInSku", String(showInSku));
        formData.set("showInName", String(showInName));

        const result = await updateInventoryCategory(category.id, formData);

        if (result?.error) {
            setError(result.error);
            setIsPending(false);
        } else {
            onClose();
            setIsPending(false);
            router.refresh();
        }
    }

    async function handleDeleteCategory() {
        setIsPending(true);
        const result = await deleteInventoryCategory(category.id, deletePassword);
        if (result?.error) {
            setError(result.error);
            setIsPending(false);
            setShowDeleteModal(false);
            setDeletePassword("");
        } else {
            setShowDeleteModal(false);
            onClose();
            setIsPending(false);
            router.refresh();
        }
    }

    async function handleDeleteSubcategory(subId: string) {
        setSubToDelete(subId);
    }

    async function confirmDeleteSub() {
        if (!subToDelete) return;
        setSubPending(true);
        const result = await deleteInventoryCategory(subToDelete);
        if (result?.success) {
            router.refresh();
        } else {
            alert("Ошибка при удалении");
        }
        setSubPending(false);
        setSubToDelete(null);
    }

    const MainIcon = getCategoryIcon({ name: categoryName });
    const subToDeleteData = subCategories.find(s => s.id === subToDelete);

    return (
        <ResponsiveModal isOpen={isOpen} onClose={onClose} title="Редактирование категории" showVisualTitle={false}>
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-[var(--radius-inner)] flex items-center justify-center transition-all duration-500 shadow-sm shrink-0", getColorStyles(selectedColor))}>
                            {createElement(MainIcon, { className: "w-6 h-6" })}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">Редактировать</h2>
                            <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                                Категория: <span className="text-slate-900 font-bold">{category.name}</span>
                            </p>
                        </div>
                    </div>

                </div>

                <form id="edit-category-form" onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1">
                    {error && (
                        <div className="p-3 rounded-[var(--radius-inner)] bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-bold text-slate-700 ml-1">Название категории</label>
                            <input
                                name="name"
                                required
                                value={categoryName}
                                placeholder="Напр. Футболки"
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setCategoryName(name);
                                    if (!prefixManuallyEdited) {
                                        setCategoryPrefix(generateCategoryPrefix(name));
                                    }
                                }}
                                className="w-full h-11 px-4 rounded-[var(--radius-inner)] border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 bg-slate-50 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm outline-none shadow-sm"
                            />
                        </div>
                        <div className="space-y-2 w-28">
                            <label className="text-sm font-bold text-slate-700 ml-1">Артикул</label>
                            <input
                                name="prefix"
                                value={categoryPrefix}
                                placeholder="TS"
                                className="w-full h-11 px-4 rounded-[var(--radius-inner)] border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 bg-slate-50 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-center text-sm outline-none shadow-sm tabular-nums"
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                                    setCategoryPrefix(val);
                                    setPrefixManuallyEdited(true);
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-3 shadow-sm">
                            <span className="text-sm font-bold text-slate-700 leading-none">Иконка</span>
                            <div className="flex items-center justify-center py-2">
                                <div className={cn("w-10 h-10 shrink-0 rounded-[var(--radius-inner)] flex items-center justify-center transition-all shadow-md ring-1 ring-black/5", getColorStyles(selectedColor))}>
                                    {createElement(MainIcon, { className: "w-5 h-5" })}
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-3 shadow-sm">
                            <span className="text-sm font-bold text-slate-700 leading-none">Цвет</span>
                            <div className="grid grid-cols-5 sm:flex sm:flex-wrap gap-2.5">
                                {COLORS.map((color) => {
                                    const isSelected = selectedColor === color.name;
                                    return (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setSelectedColor(color.name)}
                                            className={cn(
                                                "w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-300 relative group active:scale-90 shadow-sm ring-1 ring-black/5",
                                                color.class,
                                                isSelected ? "ring-2 ring-offset-2 ring-slate-300 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                                            )}
                                        >
                                            {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[4]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm relative overflow-hidden flex items-center min-h-[70px]">
                            <Switch
                                checked={showInSku}
                                onChange={setShowInSku}
                                label={<span className="sm:whitespace-nowrap">Добавлять<br className="sm:hidden" /><span className="hidden sm:inline"> </span>в артикул</span>}
                                description="Будет в SKU"
                            />
                        </div>
                        <div className="p-3 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 shadow-sm relative overflow-hidden flex items-center min-h-[70px]">
                            <Switch
                                checked={showInName}
                                onChange={setShowInName}
                                label={<span className="sm:whitespace-nowrap">Добавлять<br className="sm:hidden" /><span className="hidden sm:inline"> </span>в название</span>}
                                description="Будет в имени"
                            />
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
                                <span className="bg-slate-50 text-slate-900 border border-slate-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm">{subCategories.length}</span>
                            </div>

                            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-3 md:gap-4">
                                {subCategories.map(sub => {
                                    const IconComponent = getCategoryIcon(sub);
                                    return (
                                        <div key={sub.id} className="group relative flex flex-col items-center justify-center p-2 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 hover:border-primary/20 hover:shadow-md transition-all cursor-default shadow-sm overflow-visible min-h-[90px]">
                                            <button
                                                type="button"
                                                disabled={subPending}
                                                onClick={() => handleDeleteSubcategory(sub.id)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-white shadow-lg btn-destructive-ghost rounded-full flex items-center justify-center transition-all z-10 border border-slate-200 active:scale-90 hover:animate-shake"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <div className={cn("w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-sm ring-1 ring-black/5 mb-2 transition-all group-hover:scale-105", getColorStyles(sub.color || 'primary'))}>
                                                <IconComponent className="w-6 h-6 md:w-7 md:h-7 shadow-sm" />
                                            </div>
                                            <span className="text-[10px] md:text-[11px] font-bold text-slate-500 truncate w-full text-center px-0.5 leading-tight">{sub.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </form>

                <div className="sticky bottom-0 z-10 p-4 sm:p-6 sm:pt-3 bg-white/95 backdrop-blur-md border-t border-slate-100 mt-auto flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3 w-full lg:w-auto lg:justify-end flex-1">
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="flex-1 lg:flex-none lg:px-6 h-11 bg-white border border-rose-100 rounded-[var(--radius-inner)] flex items-center justify-center gap-2 text-rose-500 font-bold text-sm active:scale-95 transition-all"
                        >
                            <span className="text-sm font-bold">Удалить</span>
                        </button>

                        <div className="flex lg:hidden items-center justify-end gap-3 flex-1">
                            {/* Hidden 'Cancel' on mobile as per screen, but can be added if needed. 
                                Based on screenshot, there is only Delete and Save. */}
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="hidden lg:flex h-11 lg:px-8 text-slate-400 hover:text-slate-600 font-bold text-sm active:scale-95 transition-all items-center justify-center rounded-[var(--radius-inner)]"
                        >
                            Отмена
                        </button>

                        <SubmitButton
                            form="edit-category-form"
                            label="Сохранить"
                            pendingLabel="..."
                            className="h-11 flex-1 lg:flex-none lg:min-w-[140px] lg:px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm transition-all active:scale-95"
                        />
                    </div>
                </div>

                {/* Subcategory Deletion Confirmation */}
                <ResponsiveModal isOpen={!!subToDelete} onClose={() => setSubToDelete(null)}>
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-5 text-rose-500 shadow-sm border border-rose-100">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight px-4">
                            Удалить подкатегорию «{subToDeleteData?.name}»?
                        </h3>
                        <p className="text-[12px] font-medium text-slate-400 mb-8 leading-relaxed max-w-[240px]">Это действие нельзя отменить. Подкатегория будет полностью удалена.</p>

                        <div className="flex flex-col gap-2 w-full max-w-[280px]">
                            <button
                                type="button"
                                onClick={confirmDeleteSub}
                                className="h-12 w-full rounded-[var(--radius-inner)] btn-destructive text-white font-bold text-sm active:scale-95 shadow-lg shadow-rose-500/20"
                            >
                                Удалить
                            </button>
                            <button
                                type="button"
                                onClick={() => setSubToDelete(null)}
                                className="hidden lg:flex h-11 w-full rounded-[var(--radius-inner)] text-slate-400 font-bold text-sm hover:text-slate-600 transition-all items-center justify-center"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </ResponsiveModal>

                {/* Category Deletion Confirmation */}
                <ResponsiveModal
                    isOpen={showDeleteModal}
                    onClose={() => { setShowDeleteModal(false); setDeletePassword(""); }}
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
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Пароль от аккаунта"
                                    className="w-full h-12 px-4 rounded-[var(--radius-inner)] border border-rose-200 bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none text-sm font-bold shadow-sm"
                                    autoFocus
                                />
                            </div>
                        )}

                        <div className="flex flex-col gap-3 w-full items-center">
                            <button
                                type="button"
                                onClick={handleDeleteCategory}
                                disabled={isPending || (category.isSystem && !deletePassword.trim())}
                                className="h-12 w-full max-w-[320px] bg-[#ff463c] hover:bg-[#ff463c]/90 text-white rounded-[var(--radius-inner)] font-bold text-sm active:scale-95 shadow-lg shadow-rose-500/20 transition-all border-none"
                            >
                                {isPending ? "Удаление..." : "Удалить категорию"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}
                                className="h-11 w-full text-slate-400 font-bold text-sm hover:text-slate-600 transition-all flex items-center justify-center bg-transparent border-none"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </ResponsiveModal>
            </div>
        </ResponsiveModal >
    );
}
