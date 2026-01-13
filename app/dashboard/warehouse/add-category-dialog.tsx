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
        setIsPending(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
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

                        <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-2xl border border-rose-100 animate-in shake duration-500">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Название категории</label>
                                    <input
                                        name="name"
                                        required
                                        placeholder="Например: Футболки"
                                        className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Описание (необязательно)</label>
                                    <textarea
                                        name="description"
                                        placeholder="Краткое описание категории..."
                                        className="w-full min-h-[100px] p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-300 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Префикс артикула (напр. TS)</label>
                                    <input
                                        name="prefix"
                                        placeholder="TS, HD, SW..."
                                        className="w-full h-12 px-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-300 uppercase"
                                        onInput={(e) => {
                                            const sanitizeSku = (val: string) => val.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
                                            e.currentTarget.value = sanitizeSku(e.currentTarget.value);
                                        }}
                                    />
                                    <p className="text-[10px] text-slate-400 ml-1">Будет использоваться для генерации артикулов товаров</p>
                                </div>

                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Иконка</label>
                                        <div className="grid grid-cols-5 gap-3">
                                            {icons.map((item) => {
                                                const Icon = item.icon;
                                                const isSelected = selectedIcon === item.name;
                                                return (
                                                    <button
                                                        key={item.name}
                                                        type="button"
                                                        title={item.label}
                                                        onClick={() => setSelectedIcon(item.name)}
                                                        className={cn(
                                                            "aspect-square rounded-[22px] flex items-center justify-center transition-all duration-500 border-2 active:scale-90 group relative overflow-hidden",
                                                            isSelected
                                                                ? "bg-slate-900 border-slate-900 text-white shadow-2xl scale-100 z-10"
                                                                : "bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200 hover:text-slate-900 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]"
                                                        )}
                                                    >
                                                        <Icon className={cn("w-6 h-6 transition-all duration-500 ease-out", isSelected ? "scale-110" : "group-hover:scale-125 group-hover:rotate-3")} />
                                                        {!isSelected && (
                                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Цвет оформления</label>
                                        <div className="grid grid-cols-4 gap-5 pr-2">
                                            {colors.map((color) => {
                                                const isSelected = selectedColor === color.name;
                                                return (
                                                    <button
                                                        key={color.name}
                                                        type="button"
                                                        onClick={() => setSelectedColor(color.name)}
                                                        className={cn(
                                                            "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 relative shrink-0 active:scale-75 group",
                                                            color.class,
                                                            isSelected
                                                                ? "ring-[4px] ring-slate-950 ring-offset-4 scale-100 z-10"
                                                                : "hover:scale-125 hover:shadow-2xl hover:ring-[3px] hover:ring-white hover:z-20"
                                                        )}
                                                    >
                                                        {isSelected && <Check className="w-5 h-5 text-white stroke-[4] animate-in zoom-in duration-500" />}
                                                        {!isSelected && (
                                                            <div className="absolute inset-0 rounded-full ring-0 group-hover:ring-4 ring-white/30 transition-all duration-500" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button
                                    disabled={isPending}
                                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isPending ? "Создание..." : "Создать категорию"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
