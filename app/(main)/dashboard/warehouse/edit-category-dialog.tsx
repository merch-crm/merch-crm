"use client";

import { useState, createElement } from "react";
import { X, Package, Check, Trash2, ChevronDown, AlertCircle } from "lucide-react";
import { SubmitButton } from "./submit-button";

import { updateInventoryCategory, deleteInventoryCategory } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Session } from "@/lib/auth";
import { Lock } from "lucide-react";

import { Category } from "./types";
import { getCategoryIcon, getColorStyles, ICONS, COLORS, getIconNameFromName, ICON_GROUPS } from "./category-utils";

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
    const [selectedIcon, setSelectedIcon] = useState(() => {
        if (category.icon) return category.icon;
        return getIconNameFromName(category.name);
    });
    const [selectedColor, setSelectedColor] = useState(category.color || "primary");
    const selectedParentId = category.parentId || "";
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subToDelete, setSubToDelete] = useState<string | null>(null);
    const [showIcons, setShowIcons] = useState(false);

    const [subPending, setSubPending] = useState(false);

    const router = useRouter();

    // Find children using parentId
    const subCategories = categories.filter(c => c.parentId === category.id);
    const isParentCategory = !category.parentId;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        formData.set("icon", selectedIcon || "");
        formData.set("color", selectedColor);
        formData.set("parentId", selectedParentId);

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
            setDeletePassword(""); // Clear password on error
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
        if (result.success) {
            router.refresh();
        } else {
            alert("Ошибка при удалении");
        }
        setSubPending(false);
        setSubToDelete(null);
    }

    const colors = COLORS;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-[var(--radius-outer)] shadow-2xl border-none animate-in zoom-in-95 fade-in duration-300 flex flex-col my-auto shrink-0 max-h-[92vh] overflow-visible">
                <div className="flex items-center justify-between p-6 pb-2 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-[var(--radius-inner)] flex items-center justify-center transition-all duration-500 shadow-sm shrink-0", getColorStyles(selectedColor))}>
                            {createElement(getCategoryIcon({ icon: selectedIcon, name: category.name }), { className: "w-6 h-6" })}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">Редактировать</h2>
                            <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                                Объект: <span className="text-slate-900 font-bold">{category.name}</span>
                            </p>
                        </div>
                    </div>


                    <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[var(--radius-inner)] bg-slate-50 transition-all active:scale-95 shadow-sm"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form id="edit-category-form" onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar flex-1 overflow-visible">
                    {error && (
                        <div className="p-3 rounded-[var(--radius-inner)] bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* Name & Prefix */}
                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-bold text-slate-500 ml-1">Название категории</label>
                            <input
                                name="name"
                                required
                                defaultValue={category.name}
                                placeholder="Напр. Футболки"
                                className="w-full h-11 px-4 rounded-[var(--radius-inner)] border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 bg-slate-50/30 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-sm outline-none shadow-sm"
                            />
                        </div>
                        <div className="space-y-2 w-28">
                            <label className="text-sm font-bold text-slate-500 ml-1">Артикул</label>
                            <input
                                name="prefix"
                                defaultValue={category.prefix || ""}
                                placeholder="TS"
                                className="w-full h-11 px-4 rounded-[var(--radius-inner)] border border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 bg-slate-50/30 transition-all font-bold text-slate-900 placeholder:text-slate-300 text-center text-sm outline-none shadow-sm tabular-nums"
                                onInput={(e) => {
                                    e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 overflow-visible">
                        <div className="relative p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-3 overflow-visible shadow-sm">
                            <span className="text-sm font-bold text-slate-500 leading-none">Иконка</span>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={cn("w-10 h-10 shrink-0 rounded-[var(--radius-inner)] flex items-center justify-center transition-all shadow-md ring-1 ring-black/5", getColorStyles(selectedColor))}>
                                        {createElement(getCategoryIcon({ icon: selectedIcon, name: category.name }), { className: "w-5 h-5" })}
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700 truncate">
                                        {ICONS.find(i => i.name === selectedIcon)?.label || "Авто"}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowIcons(!showIcons)}
                                    className="h-8 w-8 rounded-[var(--radius-inner)] border border-slate-200 bg-white hover:border-primary/30 transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-sm group"
                                >
                                    <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300 group-hover:text-primary", showIcons && "rotate-180")} />
                                </button>
                            </div>

                            {showIcons && (
                                <div className="absolute top-[105%] left-0 w-[300px] z-[70] bg-white rounded-[var(--radius-inner)] shadow-2xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 duration-200 max-h-[320px] overflow-y-auto custom-scrollbar ring-1 ring-slate-900/5">
                                    <div className="space-y-5">
                                        {ICON_GROUPS.map((group) => (
                                            <div key={group.id} className="space-y-3">
                                                <div className="text-[9px] font-bold text-slate-400 px-1">{group.label}</div>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {group.icons.map((item) => {
                                                        const Icon = item.icon;
                                                        const isSelected = selectedIcon === item.name;
                                                        return (
                                                            <button
                                                                key={item.name}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedIcon(item.name);
                                                                    setShowIcons(false);
                                                                }}
                                                                className={cn(
                                                                    "w-10 h-10 rounded-[var(--radius-inner)] flex items-center justify-center transition-all bg-slate-50 border border-slate-200 hover:bg-white hover:border-primary/50 hover:shadow-md hover:text-primary active:scale-95 group/icon",
                                                                    isSelected && "bg-primary border-primary text-white hover:bg-primary hover:text-white shadow-lg shadow-primary/20"
                                                                )}
                                                                title={item.label}
                                                            >
                                                                <Icon className="w-4.5 h-4.5 group-hover/icon:scale-110 transition-transform" />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 flex flex-col gap-3 shadow-sm">
                            <span className="text-sm font-bold text-slate-500 leading-none">Цвет</span>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((color) => {
                                    const isSelected = selectedColor === color.name;
                                    return (
                                        <button
                                            key={color.name}
                                            type="button"
                                            onClick={() => setSelectedColor(color.name)}
                                            className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 relative group active:scale-90 shadow-sm ring-1 ring-black/5",
                                                color.class,
                                                isSelected ? "ring-2 ring-offset-2 ring-slate-300 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                                            )}
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[4]" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 ml-1">Описание категории</label>
                        <textarea
                            name="description"
                            defaultValue={category.description || ""}
                            placeholder="Расскажите об этой категории..."
                            className="w-full min-h-[64px] p-4 rounded-[var(--radius-inner)] border border-slate-200 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all font-bold text-sm placeholder:text-slate-300 resize-none bg-slate-50/30 leading-relaxed shadow-sm"
                        />
                    </div>

                    {isParentCategory && (
                        <div className="space-y-4 pt-3">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-sm font-bold text-slate-500">Подкатегории</label>
                                <span className="bg-slate-100 text-slate-900 border border-slate-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold shadow-sm">{subCategories.length}</span>
                            </div>

                            <div className="grid grid-cols-6 gap-3">
                                {subCategories.map(sub => {
                                    const IconComponent = getCategoryIcon(sub);
                                    return (
                                        <div key={sub.id} className="group relative flex flex-col items-center justify-center p-2.5 bg-slate-50/50 rounded-[var(--radius-inner)] border border-slate-200 hover:border-primary/20 hover:bg-white transition-all aspect-square cursor-default shadow-sm overflow-visible">
                                            <button
                                                type="button"
                                                disabled={subPending}
                                                onClick={() => handleDeleteSubcategory(sub.id)}
                                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white shadow-lg btn-destructive-ghost rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 border border-slate-200 active:scale-90"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <div className={cn("w-9 h-9 rounded-[var(--radius-inner)] flex items-center justify-center shadow-md ring-1 ring-black/5 mb-1.5 transition-all group-hover:scale-110", getColorStyles(sub.color || 'primary'))}>
                                                {createElement(IconComponent, { className: "w-4.5 h-4.5 shadow-sm" })}
                                            </div>
                                            <span className="text-[8px] font-bold text-slate-500 truncate w-full text-center px-0.5 leading-none">{sub.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </form>

                <div className="p-6 pt-3 flex items-center justify-between shrink-0 bg-white rounded-b-[var(--radius-outer)]">
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="h-11 px-6 rounded-[var(--radius-inner)] flex items-center gap-2.5 text-sm font-bold transition-all active:scale-95 btn-destructive-ghost"
                    >
                        <Trash2 className="w-4 h-4" />
                        Удалить
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-11 px-8 rounded-[var(--radius-inner)] text-slate-400 hover:text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Отмена
                        </button>
                        <SubmitButton
                            form="edit-category-form"
                            label="Сохранить"
                            pendingLabel="..."
                            className="h-11 px-10 btn-dark rounded-[var(--radius-inner)] font-bold text-sm transition-all active:scale-95"
                        />
                    </div>
                </div>

                {subToDelete && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md text-center animate-in fade-in duration-300">
                        <div className="w-full max-w-[280px] bg-white rounded-[var(--radius-outer)] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-200 p-8 animate-in zoom-in-95 duration-300 ring-1 ring-slate-900/5">
                            <div className="w-11 h-11 bg-rose-50 rounded-[var(--radius-inner)] flex items-center justify-center mx-auto mb-5 text-rose-500 shadow-sm border border-rose-100">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1 leading-tight">Удалить подкатегорию?</h3>
                            <p className="text-[11px] font-medium text-slate-400 mb-8 leading-relaxed">Это действие нельзя отменить</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setSubToDelete(null)} className="h-11 rounded-[var(--radius-inner)] bg-slate-50 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-all">Нет</button>
                                <button type="button" onClick={confirmDeleteSub} className="h-11 rounded-[var(--radius-inner)] btn-destructive text-white font-bold text-sm active:scale-95">Удалить</button>
                            </div>
                        </div>
                    </div>
                )}

                {showDeleteModal && (
                    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md text-center animate-in fade-in duration-300">
                        <div className="w-full max-w-[340px] bg-white rounded-[var(--radius-outer)] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-slate-200 p-10 animate-in zoom-in-95 duration-300 ring-1 ring-slate-900/5">
                            <div className="w-11 h-11 bg-rose-50 rounded-[var(--radius-inner)] flex items-center justify-center mx-auto mb-6 text-rose-500 shadow-sm border border-rose-100">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2 leading-tight">Удалить категорию?</h3>
                            <p className="text-[12px] font-medium text-rose-400 mb-8 leading-relaxed px-2">Все товары станут «Без категории»</p>

                            {category.isSystem && (
                                <div className="mb-8 p-5 bg-rose-50/50 rounded-[var(--radius-inner)] border border-rose-100 text-left shadow-inner">
                                    <label className="text-[10px] font-bold text-rose-600 mb-3 block">Системная защита</label>
                                    <input
                                        type="password"
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        placeholder="Пароль от своей учетной записи"
                                        className="w-full h-11 px-4 rounded-[var(--radius-inner)] border border-rose-200 bg-white focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 outline-none text-sm font-bold shadow-sm"
                                        autoFocus
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={handleDeleteCategory}
                                    disabled={isPending || (category.isSystem && !deletePassword.trim())}
                                    className="h-11 btn-destructive rounded-[var(--radius-inner)] font-bold text-sm active:scale-95"
                                >
                                    {isPending ? "Удаление..." : "Удалить категорию"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowDeleteModal(false); setDeletePassword(""); }}
                                    className="h-11 text-slate-400 font-bold text-sm hover:text-slate-600 transition-all"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
