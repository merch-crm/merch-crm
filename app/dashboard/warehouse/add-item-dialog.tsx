"use client";

import { useState } from "react";
import { Plus, X, Package, Ruler, Hash, BarChart3, Folder, Shirt, Box, Wrench, ArrowLeft, ChevronRight } from "lucide-react";
import { addInventoryItem } from "./actions";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UnitSelect } from "@/components/ui/unit-select";

const UNIT_OPTIONS = [
    { id: "kg", name: "КГ" },
    { id: "l", name: "Л" },
    { id: "m", name: "М" },
    { id: "pogm", name: "ПОГ.М" },
    { id: "upak", name: "УПАК" },
    { id: "sht", name: "ШТ" },
];

const ITEM_TYPES = [
    {
        id: "clothing",
        name: "Одежда",
        description: "Футболки, худи, кепки и другой текстиль",
        icon: Shirt,
        color: "bg-blue-50 text-blue-600 border-blue-100"
    },
    {
        id: "packaging",
        name: "Упаковка",
        description: "Коробки, пакеты, конверты, скотч",
        icon: Box,
        color: "bg-amber-50 text-amber-600 border-amber-100"
    },
    {
        id: "consumables",
        name: "Расходники",
        description: "Краска, нитки, бумага, запчасти",
        icon: Wrench,
        color: "bg-emerald-50 text-emerald-600 border-emerald-100"
    }
];

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
    const [step, setStep] = useState<"type" | "details">("type");
    const [itemType, setItemType] = useState<string>("clothing");

    const [error, setError] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedUnit, setSelectedUnit] = useState("ШТ");
    const [qualityCode, setQualityCode] = useState("");
    const [attributeCode, setAttributeCode] = useState("");
    const [sizeCode, setSizeCode] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const selectedCategory = initialCategories.find(c => c.id === selectedCategoryId);

    const sanitizeSku = (val: string) => val.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();

    const skuPreview = selectedCategory?.prefix
        ? [selectedCategory.prefix, qualityCode, attributeCode, sizeCode].filter(Boolean).join("-")
        : "";

    const resetDialog = () => {
        setIsOpen(false);
        setStep("type");
        setError("");
        setQualityCode("");
        setAttributeCode("");
        setSizeCode("");
        setFieldErrors({});
        setSelectedCategoryId("");
    };

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
        // Append itemType as it might not be in form naturally if not an input
        formData.append("itemType", itemType);

        const res = await addInventoryItem(formData);
        if (res?.error) {
            setError(res.error);
        } else {
            resetDialog();
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
                        onClick={resetDialog}
                    />

                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-8 pb-4">
                            <div className="flex items-center gap-4">
                                {step === "details" && (
                                    <button
                                        onClick={() => setStep("type")}
                                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 transition-all"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                )}
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                        {step === "type" ? "Выберите тип позиции" : "Детали позиции"}
                                    </h1>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {step === "type" ? "От типа зависят доступные поля и логика" : `Тип: ${ITEM_TYPES.find(t => t.id === itemType)?.name}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-full bg-slate-50 hover:bg-slate-100 transition-all"
                                onClick={resetDialog}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Step 1: Type Selection */}
                        {step === "type" && (
                            <div className="p-8 pt-4 grid grid-cols-1 gap-4">
                                {ITEM_TYPES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => {
                                            setItemType(t.id);
                                            setStep("details");
                                        }}
                                        className="group flex items-center gap-6 p-6 rounded-3xl border border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50/50 transition-all text-left"
                                    >
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-110 duration-500", t.color)}>
                                            <t.icon className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">{t.name}</h3>
                                            <p className="text-sm text-slate-500 font-medium line-clamp-1">{t.description}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Step 2: Details Form */}
                        {step === "details" && (
                            <form action={clientAction} noValidate className="p-8 pt-4 space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar">
                                <div className="space-y-5">
                                    {/* Common Fields */}
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            <Package className="w-3.5 h-3.5" />
                                            Название товара <span className="text-rose-500 font-bold">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            autoFocus
                                            className={cn(
                                                "w-full h-12 px-4 rounded-xl border bg-slate-50 text-slate-900 font-bold text-sm outline-none transition-all placeholder:text-slate-400",
                                                fieldErrors.name
                                                    ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                    : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                            )}
                                            placeholder={itemType === "clothing" ? "Напр. Футболка Gildan Black" : itemType === "packaging" ? "Напр. Коробка 30x20x10" : "Напр. Нитки черные 40/2"}
                                            onChange={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
                                        />
                                        {fieldErrors.name && (
                                            <p className="text-[10px] font-bold text-rose-500 ml-1">
                                                {fieldErrors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2.5">
                                            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                                <Hash className="w-3.5 h-3.5" />
                                                Артикул
                                            </label>
                                            <input
                                                type="text"
                                                name="sku"
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none placeholder:text-slate-400"
                                                placeholder="Авто"
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
                                            <div className="pt-1.5">
                                                <UnitSelect
                                                    name="unit"
                                                    value={selectedUnit}
                                                    onChange={setSelectedUnit}
                                                    options={UNIT_OPTIONS}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            <Folder className="w-3.5 h-3.5" />
                                            Категория <span className="text-rose-500 font-bold">*</span>
                                        </label>
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

                                    {/* Type Specific Fields */}
                                    {itemType === "clothing" && selectedCategory?.prefix && (
                                        <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Составной артикул</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Качество</label>
                                                    <input name="qualityCode" value={qualityCode} onChange={(e) => setQualityCode(sanitizeSku(e.target.value))} placeholder="FT" className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Цвет</label>
                                                    <input name="attributeCode" value={attributeCode} onChange={(e) => setAttributeCode(sanitizeSku(e.target.value))} placeholder="BLK" className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Размер</label>
                                                    <input name="sizeCode" value={sizeCode} onChange={(e) => setSizeCode(sanitizeSku(e.target.value))} placeholder="L" className="w-full h-10 px-3 rounded-xl border border-indigo-100 bg-white text-xs font-bold focus:border-indigo-500 outline-none uppercase" />
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

                                    {itemType === "packaging" && (
                                        <div className="p-5 bg-amber-50/50 rounded-3xl border border-amber-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest ml-1">Характеристики упаковки</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Ширина (см)</label>
                                                    <input type="number" name="width" className="w-full h-10 px-3 rounded-xl border border-amber-100 bg-white text-xs font-bold focus:border-amber-500 outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Высота (см)</label>
                                                    <input type="number" name="height" className="w-full h-10 px-3 rounded-xl border border-amber-100 bg-white text-xs font-bold focus:border-amber-500 outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Глубина (см)</label>
                                                    <input type="number" name="depth" className="w-full h-10 px-3 rounded-xl border border-amber-100 bg-white text-xs font-bold focus:border-amber-500 outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {itemType === "consumables" && (
                                        <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Область применения</label>
                                            <select name="department" className="w-full h-11 px-4 rounded-xl border border-emerald-100 bg-white text-sm font-bold focus:border-emerald-500 outline-none">
                                                <option value="">Все отделы</option>
                                                <option value="printing">Печать</option>
                                                <option value="embroidery">Вышивка</option>
                                                <option value="sewing">Пошив</option>
                                            </select>
                                        </div>
                                    )}

                                    {/* Inventory Controls */}
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
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
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
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-black uppercase tracking-wider">
                                            {error}
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <SubmitButton />
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
