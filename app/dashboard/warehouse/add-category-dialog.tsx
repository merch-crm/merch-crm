"use client";

import { useState } from "react";
import { X, FolderPlus, Shirt, Package, Layers, Zap, Scissors, Box, Hourglass, Wind, Tag, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addInventoryCategory } from "./actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function AddCategoryDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedIcon, setSelectedIcon] = useState("package");
    const [selectedColor, setSelectedColor] = useState("indigo");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const router = useRouter();

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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const name = formData.get("name") as string;
        const prefix = formData.get("prefix") as string;

        const newErrors: Record<string, string> = {};
        if (!name || name.trim().length < 2) newErrors.name = "Введите название категории";
        if (!prefix || prefix.trim().length < 2) newErrors.prefix = "Введите префикс артикула (напр. TS)";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setIsPending(true);
        setError(null);
        setFieldErrors({});

        formData.set("icon", selectedIcon);
        formData.set("color", selectedColor);
        const result = await addInventoryCategory(formData);

        if (result.error) {
            setError(result.error);
            setIsPending(false);
        } else {
            setIsOpen(false);
            setIsPending(false);
            router.refresh();
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 gap-2 font-black shadow-xl shadow-indigo-200 transition-all active:scale-95"
            >
                <FolderPlus className="w-5 h-5" />
                Добавить категорию
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-white/20 animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
                        <div className="flex items-center justify-between p-8 pb-4">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Новая категория</h1>
                                <p className="text-sm text-slate-500">Создайте категорию для товаров</p>
                            </div>
                            <button
                                type="button"
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} noValidate className="p-8 pt-4 space-y-6">

                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                            Название категории <span className="text-rose-500 font-bold">*</span>
                                        </label>
                                        <input
                                            name="name"
                                            placeholder="Футболки"
                                            className={cn(
                                                "w-full h-12 px-4 rounded-2xl border outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300",
                                                fieldErrors.name
                                                    ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                    : "border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 hover:bg-white"
                                            )}
                                            onChange={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
                                        />
                                        {fieldErrors.name && (
                                            <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                                {fieldErrors.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                            Артикул <span className="text-rose-500 font-bold">*</span>
                                        </label>
                                        <input
                                            name="prefix"
                                            placeholder="TS, HD..."
                                            className={cn(
                                                "w-full h-12 px-4 rounded-2xl border font-bold text-slate-900 placeholder:text-slate-300 uppercase outline-none transition-all",
                                                fieldErrors.prefix
                                                    ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                    : "border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-slate-50/50 hover:bg-white uppercase"
                                            )}
                                            onInput={(e) => {
                                                const val = e.currentTarget.value;
                                                e.currentTarget.value = val.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                                                if (fieldErrors.prefix) setFieldErrors(prev => ({ ...prev, prefix: "" }));
                                            }}
                                        />
                                        {fieldErrors.prefix && (
                                            <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                                {fieldErrors.prefix}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Описание (необязательно)</label>
                                    <textarea
                                        name="description"
                                        placeholder="Краткое описание..."
                                        className="w-full min-h-[60px] p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm placeholder:text-slate-300 resize-none bg-slate-50/50 hover:bg-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-10">
                                    {/* Icon Selection */}
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
                                                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border active:scale-95 group",
                                                            isSelected
                                                                ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                                                                : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-slate-50"
                                                        )}
                                                    >
                                                        <Icon className={cn("w-4 h-4", isSelected ? "scale-110" : "group-hover:scale-110")} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Color Selection */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Цвет оформления</label>
                                        <div className="grid grid-cols-4 gap-3">
                                            {colors.map((color) => {
                                                const isSelected = selectedColor === color.name;
                                                return (
                                                    <button
                                                        key={color.name}
                                                        type="button"
                                                        onClick={() => setSelectedColor(color.name)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative group active:scale-90",
                                                            color.class,
                                                            isSelected ? "ring-4 ring-offset-2 ring-slate-100" : "hover:scale-110"
                                                        )}
                                                    >
                                                        {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 space-y-4">
                                {error && (
                                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isPending ? "Создание..." : "Создать категорию"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
