"use client";

import { useState } from "react";
import { X, Shirt, Package, Layers, Zap, Scissors, Box, Hourglass, Wind, Tag, ShoppingBag, Check, Trash2, Plus } from "lucide-react";

import { updateInventoryCategory, deleteInventoryCategory, addInventoryCategory } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Category } from "./inventory-client";

interface EditCategoryDialogProps {
    category: Category & { prefix?: string | null };
    categories: Category[];
    isOpen: boolean;
    onClose: () => void;
}

export function EditCategoryDialog({ category, categories, isOpen, onClose }: EditCategoryDialogProps) {
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState(() => {
        if (category.icon) return category.icon;

        // Fallback mapping to match card appearance
        const name = category.name.toLowerCase();
        if (name.includes("футболк")) return "shirt";
        if (name.includes("худи")) return "hourglass";
        if (name.includes("свитшот")) return "layers";
        if (name.includes("лонгслив")) return "shirt";
        if (name.includes("анорак")) return "wind";
        if (name.includes("зип")) return "zap";
        if (name.includes("штаны")) return "package";
        if (name.includes("поло")) return "shirt";
        if (name.includes("упаковка")) return "box";
        if (name.includes("расходники")) return "scissors";

        return "package";
    });
    const [selectedColor, setSelectedColor] = useState(category.color || "indigo");
    const [selectedParentId, setSelectedParentId] = useState(category.parentId || "");
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // Subcategory management state
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [newSubName, setNewSubName] = useState("");
    const [newSubPrefix, setNewSubPrefix] = useState("");
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

    async function handleDelete() {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        setIsPending(true);
        const result = await deleteInventoryCategory(category.id);
        if (result?.error) {
            setError(result.error);
            setIsPending(false);
        } else {
            onClose();
            setIsPending(false);
            router.refresh();
        }
    }

    async function handleAddSubcategory() {
        if (!newSubName || !newSubPrefix) return;
        setSubPending(true);

        const formData = new FormData();
        formData.set("name", newSubName);
        formData.set("prefix", newSubPrefix);
        formData.set("parentId", category.id);
        // Default visuals
        formData.set("icon", "package");
        formData.set("color", "slate");

        const result = await addInventoryCategory(formData);
        if (result.success) {
            setNewSubName("");
            setNewSubPrefix("");
            setIsAddingSub(false);
            router.refresh();
        } else {
            alert("Ошибка при создании: " + (result.error || "Неизвестная ошибка"));
        }
        setSubPending(false);
    }

    async function handleDeleteSubcategory(subId: string) {
        if (!confirm("Удалить эту подкатегорию?")) return;
        setSubPending(true);
        const result = await deleteInventoryCategory(subId);
        if (result.success) {
            router.refresh();
        } else {
            alert("Ошибка при удалении");
        }
        setSubPending(false);
    }

    const icons = [
        { name: "shirt", icon: Shirt, label: "Одежда" },
        { name: "package", icon: Package, label: "Коробка" },
        { name: "layers", icon: Layers, label: "Стопка" },
        { name: "zap", icon: Zap, label: "Молния" },
        { name: "scissors", icon: Scissors, label: "Расходники" },
        { name: "box", icon: Box, label: "Куб" },
        { name: "hourglass", icon: Hourglass, label: "Время" },
        { name: "wind", icon: Wind, label: "Анорак" },
        { name: "tag", icon: Tag, label: "Бирка" },
        { name: "shopping-bag", icon: ShoppingBag, label: "Пакет" },
    ];

    const colors = [
        { name: "indigo", class: "bg-indigo-500" },
        { name: "rose", class: "bg-rose-500" },
        { name: "emerald", class: "bg-emerald-500" },
        { name: "amber", class: "bg-amber-500" },
        { name: "violet", class: "bg-violet-600" },
        { name: "cyan", class: "bg-cyan-500" },
        { name: "slate", class: "bg-slate-600" },
        { name: "orange", class: "bg-orange-500" },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 fade-in duration-300 overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-8 pb-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Редактировать категорию</h1>
                        <p className="text-sm text-slate-500">Измените информацию о категории</p>
                    </div>
                    <button
                        type="button"
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 transition-all"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 pt-4 flex flex-col h-full">
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl border border-rose-100 animate-in shake duration-500">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-6">
                        {/* LEFT COLUMN: Main Settings */}
                        <div className={cn("space-y-5", isParentCategory ? "lg:col-span-5" : "lg:col-span-8 lg:col-start-3")}>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Название категории</label>
                                    <input
                                        name="name"
                                        required
                                        defaultValue={category.name}
                                        placeholder="Футболки"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Артикул</label>
                                    <input
                                        name="prefix"
                                        defaultValue={category.prefix || ""}
                                        placeholder="TS"
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 placeholder:text-slate-300 bg-slate-50/50 hover:bg-white uppercase text-center"
                                        onInput={(e) => {
                                            const val = e.currentTarget.value;
                                            if (/[а-яА-ЯёЁ]/.test(val)) {
                                                alert("Используйте только латиницу, цифры 0-9 и символ «-»");
                                            }
                                            e.currentTarget.value = val.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание</label>
                                <textarea
                                    name="description"
                                    defaultValue={category.description || ""}
                                    placeholder="Краткое описание..."
                                    className="w-full min-h-[50px] p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm placeholder:text-slate-300 resize-none bg-slate-50/50 hover:bg-white"
                                />
                            </div>

                            {category.parentId && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Родительская категория</label>
                                    <select
                                        value={selectedParentId}
                                        onChange={(e) => setSelectedParentId(e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-slate-900 bg-slate-50/50 hover:bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="">Основная категория (нет родителя)</option>
                                        {categories
                                            .filter(cat => cat.id !== category.id && !cat.parentId)
                                            .map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6 pt-2">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Иконка</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {icons.map((item) => {
                                            const Icon = item.icon;
                                            const isSelected = selectedIcon === item.name;
                                            return (
                                                <button
                                                    key={item.name}
                                                    type="button"
                                                    onClick={() => setSelectedIcon(item.name)}
                                                    className={cn(
                                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 border active:scale-95 group",
                                                        isSelected
                                                            ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                                                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <Icon className={cn("w-3.5 h-3.5", isSelected ? "scale-110" : "group-hover:scale-110")} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Цвет оформления</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {colors.map((color) => {
                                            const isSelected = selectedColor === color.name;
                                            return (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color.name)}
                                                    className={cn(
                                                        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 relative group active:scale-90",
                                                        color.class,
                                                        isSelected ? "ring-2 ring-offset-2 ring-slate-200" : "hover:scale-110"
                                                    )}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Subcategories */}
                        {isParentCategory && (
                            <div className="lg:col-span-7 flex flex-col bg-slate-50/50 rounded-3xl border border-slate-100/80 p-5 h-full relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Подкатегории ({subCategories.length})
                                    </label>
                                    {!isAddingSub && (
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingSub(true)}
                                            className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-[10px] font-bold"
                                        >
                                            <Plus className="w-3 h-3" />
                                            ДОБАВИТЬ
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto min-h-[200px] pr-1 -mr-1">
                                    <div className="space-y-3">
                                        {subCategories.length > 0 ? (
                                            <div className="grid grid-cols-4 gap-2">
                                                {subCategories.map(sub => (
                                                    <div key={sub.id} className="group relative flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-slate-100 transition-all hover:border-indigo-200 hover:shadow-md hover:shadow-slate-100 hover:-translate-y-0.5 aspect-[5/4]">
                                                        <button
                                                            type="button"
                                                            disabled={subPending}
                                                            onClick={() => handleDeleteSubcategory(sub.id)}
                                                            className="absolute top-1 right-1 p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                            title="Удалить подкатегорию"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>

                                                        <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm mb-1.5 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-colors">
                                                            <Package className="w-3 h-3" />
                                                        </div>

                                                        <div className="w-full text-center">
                                                            <div className="text-[10px] font-bold text-slate-700 truncate w-full px-0.5 mb-px leading-tight">{sub.name}</div>
                                                            <div className="text-[8px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 px-1 py-px rounded inline-block">
                                                                {sub.prefix || "-"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : !isAddingSub && (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200/50 rounded-2xl text-slate-400 gap-2 opacity-60">
                                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                    <Package className="w-6 h-6 text-slate-300" />
                                                </div>
                                                <span className="text-xs font-medium">Нет подкатегорий</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isAddingSub && (
                                    <div className="mt-auto pt-3 border-t border-slate-100/50 animate-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-900 mb-2 px-1 opacity-80">
                                            <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                            НОВАЯ ПОДКАТЕГОРИЯ
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="col-span-2">
                                                <input
                                                    autoFocus
                                                    placeholder="Название..."
                                                    value={newSubName}
                                                    onChange={(e) => setNewSubName(e.target.value)}
                                                    className="w-full h-9 px-3 rounded-lg border border-indigo-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:font-normal"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    placeholder="Код"
                                                    value={newSubPrefix}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                                                        setNewSubPrefix(val);
                                                    }}
                                                    className="w-full h-9 px-3 rounded-lg border border-indigo-200 bg-white text-xs font-bold text-slate-700 uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:font-normal placeholder:normal-case text-center tracking-widest"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingSub(false)}
                                                className="px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                            >
                                                ОТМЕНА
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleAddSubcategory}
                                                disabled={!newSubName || !newSubPrefix || subPending}
                                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 active:scale-95"
                                            >
                                                {subPending ? "..." : "СОЗДАТЬ"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className={cn(
                                "h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border shadow-sm",
                                deleteConfirm
                                    ? "bg-rose-500 border-rose-500 text-white shadow-rose-200"
                                    : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50"
                            )}
                        >
                            <Trash2 className="w-4 h-4" />
                            {deleteConfirm ? "Подтвердить удаление" : "Удалить категорию"}
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {isPending ? "Сохранение..." : "Сохранить изменения"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
