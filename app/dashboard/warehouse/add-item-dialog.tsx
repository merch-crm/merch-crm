"use client";

import { useState } from "react";
import { Plus, X, Package, Ruler, Hash, BarChart3, Folder } from "lucide-react";
import { addInventoryItem } from "./actions";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full bg-[#6366f1] hover:bg-[#5558dd] text-white rounded-2xl font-bold h-14 text-base shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] mt-4"
        >
            {pending ? "Сохранение..." : "Добавить в базу"}
        </Button>
    );
}

interface AddItemDialogProps {
    initialCategories: { id: string, name: string, prefix?: string | null }[];
}

export function AddItemDialog({ initialCategories }: AddItemDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [qualityCode, setQualityCode] = useState("");
    const [attributeCode, setAttributeCode] = useState("");
    const [sizeCode, setSizeCode] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const selectedCategory = initialCategories.find(c => c.id === selectedCategoryId);

    // SKU Sanitizer: Only A-Z, 0-9, and dashes allowed
    const sanitizeSku = (val: string) => val.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();

    const skuPreview = selectedCategory?.prefix
        ? [selectedCategory.prefix, qualityCode, attributeCode, sizeCode].filter(Boolean).join("-")
        : "";

    async function clientAction(formData: FormData) {
        const name = formData.get("name") as string;
        const categoryId = formData.get("categoryId") as string;

        const newErrors: Record<string, string> = {};
        if (!name || name.trim().length < 2) newErrors.name = "Введите название товара";
        if (!categoryId) newErrors.categoryId = "Выберите категорию";

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setFieldErrors({});
        const res = await addInventoryItem(formData);
        if (res?.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            setError("");
            setQualityCode("");
            setAttributeCode("");
            setSizeCode("");
            setFieldErrors({});
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 gap-2 font-black shadow-xl shadow-indigo-200 transition-all active:scale-95"
            >
                <Plus className="w-5 h-5" />
                Добавить товар
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-xl border border-slate-100 animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
                        <div className="flex items-center justify-between p-8 pb-4">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Новый товар</h1>
                                <p className="text-sm text-slate-500 font-medium">Заполните данные для учета остатков</p>
                            </div>
                            <button
                                type="button"
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 hover:bg-slate-100 transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form action={clientAction} noValidate className="p-8 pt-4 space-y-5">
                            <div className="space-y-5">
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        <Package className="w-3.5 h-3.5" />
                                        Название товара <span className="text-rose-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className={cn(
                                            "w-full h-12 px-4 rounded-xl border bg-slate-50 text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400",
                                            fieldErrors.name
                                                ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                        )}
                                        placeholder="Напр. Ткань хлопок белая"
                                        onChange={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
                                    />
                                    {fieldErrors.name && (
                                        <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                            {fieldErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            <Hash className="w-3.5 h-3.5" />
                                            Артикул (ручной)
                                        </label>
                                        <input
                                            type="text"
                                            name="sku"
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none placeholder:text-slate-400"
                                            placeholder="Оставьте пустым для авто"
                                            onInput={(e) => {
                                                e.currentTarget.value = sanitizeSku(e.currentTarget.value);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            <Ruler className="w-3.5 h-3.5" />
                                            Ед. изм.
                                        </label>
                                        <div className="relative">
                                            <select
                                                name="unit"
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="шт">Штуки (шт)</option>
                                                <option value="м">Метры (м)</option>
                                                <option value="кг">Килограммы (кг)</option>
                                                <option value="упак">Упаковки</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        <Folder className="w-3.5 h-3.5" />
                                        Категория <span className="text-rose-500 font-bold">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="categoryId"
                                            value={selectedCategoryId}
                                            onChange={(e) => {
                                                setSelectedCategoryId(e.target.value);
                                                setFieldErrors(prev => ({ ...prev, categoryId: "" }));
                                            }}
                                            className={cn(
                                                "w-full h-12 px-4 rounded-xl border bg-slate-50 text-slate-900 font-bold text-sm outline-none transition-all appearance-none cursor-pointer",
                                                fieldErrors.categoryId
                                                    ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                    : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                            )}
                                        >
                                            <option value="">Выберите категорию...</option>
                                            {initialCategories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {fieldErrors.categoryId && (
                                        <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                            {fieldErrors.categoryId}
                                        </p>
                                    )}
                                </div>

                                {selectedCategory?.prefix && (
                                    <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Составной артикул</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Качество</label>
                                                <input
                                                    name="qualityCode"
                                                    value={qualityCode}
                                                    onChange={(e) => setQualityCode(sanitizeSku(e.target.value))}
                                                    placeholder="FT, BZ"
                                                    className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Цвет (Attr)</label>
                                                <input
                                                    name="attributeCode"
                                                    value={attributeCode}
                                                    onChange={(e) => setAttributeCode(sanitizeSku(e.target.value))}
                                                    placeholder="BLK, WHT"
                                                    className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Размер</label>
                                                <input
                                                    name="sizeCode"
                                                    value={sizeCode}
                                                    onChange={(e) => setSizeCode(sanitizeSku(e.target.value))}
                                                    placeholder="L, XL"
                                                    className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase"
                                                />
                                            </div>
                                        </div>
                                        {skuPreview && (
                                            <div className="pt-2 border-t border-indigo-100 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Превью:</span>
                                                <span className="text-sm font-black text-indigo-600 font-mono tracking-wider">{skuPreview}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            <BarChart3 className="w-3.5 h-3.5" />
                                            Наличие
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            defaultValue="0"
                                            min="0"
                                            required
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none placeholder:text-slate-400"
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            Мин. порог
                                        </label>
                                        <input
                                            type="number"
                                            name="lowStockThreshold"
                                            defaultValue="5"
                                            className={cn(
                                                "w-full h-12 px-4 rounded-xl border bg-slate-50 text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400",
                                                fieldErrors.lowStockThreshold
                                                    ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                    : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                            )}
                                            onChange={() => setFieldErrors(prev => ({ ...prev, lowStockThreshold: "" }))}
                                        />
                                        {fieldErrors.lowStockThreshold && (
                                            <p className="text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1 duration-200">
                                                {fieldErrors.lowStockThreshold}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-black uppercase tracking-wider animate-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <SubmitButton />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
