"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Ruler, Hash, BarChart3, Folder, Shirt, Box, Wrench, ChevronRight, Image as ImageIcon, AlertTriangle, Check } from "lucide-react";
import { addInventoryItem } from "../../actions";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UnitSelect } from "@/components/ui/unit-select";
import { AttributeSelector } from "../../attribute-selector";

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
            className="w-full bg-[#6366f1] hover:bg-[#5558dd] text-white rounded-2xl font-bold h-14 text-base shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
        >
            {pending ? "Сохранение..." : "Добавить в базу"}
        </Button>
    );
}

interface NewItemClientProps {
    initialCategories: { id: string, name: string, prefix?: string | null }[];
}

export function NewItemClient({ initialCategories }: NewItemClientProps) {
    const router = useRouter();
    const [step, setStep] = useState<"type" | "details">("type");
    const [itemType, setItemType] = useState<string>("clothing");

    const [error, setError] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [selectedUnit, setSelectedUnit] = useState("ШТ");
    const [qualityCode, setQualityCode] = useState("");
    const [attributeCode, setAttributeCode] = useState("");
    const [sizeCode, setSizeCode] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    // Attribute values
    const [selectedColor, setSelectedColor] = useState("");
    const [selectedMaterial, setSelectedMaterial] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedQuality, setSelectedQuality] = useState("");

    const selectedCategory = initialCategories.find(c => c.id === selectedCategoryId);

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
        formData.append("itemType", itemType);

        // Add selected attributes as JSON
        if (itemType === "clothing") {
            const attributes: Record<string, string> = {};
            if (selectedQuality) attributes["Качество"] = selectedQuality;
            if (selectedColor) attributes["Цвет"] = selectedColor;
            if (selectedMaterial) attributes["Материал"] = selectedMaterial;
            if (selectedSize) attributes["Размер"] = selectedSize;

            if (Object.keys(attributes).length > 0) {
                formData.append("attributes", JSON.stringify(attributes));
            }
        }

        const res = await addInventoryItem(formData);
        if (res?.error) {
            setError(res.error);
        } else {
            router.push("/dashboard/warehouse");
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => step === "details" ? setStep("type") : router.back()}
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold mb-4 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        {step === "details" ? "Назад к выбору типа" : "К списку товаров"}
                    </button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                                {step === "type" ? "Выберите тип позиции" : "Детали позиции"}
                            </h1>
                            <p className="text-lg text-slate-500 font-medium mt-2">
                                {step === "type"
                                    ? "От типа зависят доступные поля и логика"
                                    : `Тип: ${ITEM_TYPES.find(t => t.id === itemType)?.name}`
                                }
                            </p>
                        </div>
                        {step === "details" && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <Check className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm font-bold text-slate-600">Шаг 2 из 2</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Step 1: Type Selection */}
                    {step === "type" && (
                        <div className="p-10 grid grid-cols-1 gap-6">
                            {ITEM_TYPES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setItemType(t.id);
                                        if (t.id === "clothing") {
                                            setSelectedUnit("ШТ");
                                        }
                                        setStep("details");
                                    }}
                                    className="group flex items-center gap-8 p-8 rounded-3xl border-2 border-slate-100 bg-white hover:border-indigo-300 hover:bg-slate-50/50 transition-all text-left"
                                >
                                    <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-110 duration-500", t.color)}>
                                        <t.icon className="w-10 h-10" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{t.name}</h3>
                                        <p className="text-base text-slate-500 font-medium">{t.description}</p>
                                    </div>
                                    <ChevronRight className="w-7 h-7 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-2 transition-all" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Details Form */}
                    {step === "details" && (
                        <form action={clientAction} noValidate className="p-10 space-y-6">
                            <div className="space-y-6">
                                {/* Common Fields */}
                                <div className="space-y-2.5">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        <Package className="w-4 h-4" />
                                        Название товара <span className="text-rose-500 font-bold">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        autoFocus
                                        className={cn(
                                            "w-full h-14 px-5 rounded-2xl border bg-slate-50 text-slate-900 font-bold text-base outline-none transition-all placeholder:text-slate-400",
                                            fieldErrors.name
                                                ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                                        )}
                                        placeholder={itemType === "clothing" ? "Напр. Футболка Gildan Black" : itemType === "packaging" ? "Напр. Коробка 30x20x10" : "Напр. Нитки черные 40/2"}
                                        onChange={() => setFieldErrors(prev => ({ ...prev, name: "" }))}
                                    />
                                    {fieldErrors.name && (
                                        <p className="text-xs font-bold text-rose-500 ml-1">
                                            {fieldErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            <Hash className="w-4 h-4" />
                                            Артикул
                                        </label>
                                        <input
                                            type="text"
                                            name="sku"
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-base focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none placeholder:text-slate-400"
                                            placeholder="Авто"
                                            onInput={(e) => {
                                                e.currentTarget.value = sanitizeSku(e.currentTarget.value);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            <Ruler className="w-4 h-4" />
                                            Ед. изм.
                                        </label>
                                        <div className="pt-2">
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
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        <Folder className="w-4 h-4" />
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
                                            "w-full h-14 px-5 rounded-2xl border bg-slate-50 text-slate-900 font-bold text-base outline-none transition-all appearance-none cursor-pointer",
                                            fieldErrors.categoryId
                                                ? "border-rose-300 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-500/10"
                                                : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
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
                                    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-6 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-black text-indigo-400 uppercase tracking-widest ml-1">Характеристики одежды</label>

                                        <AttributeSelector
                                            type="quality"
                                            value={selectedQuality}
                                            onChange={(name, code) => {
                                                setSelectedQuality(name);
                                                setQualityCode(code);
                                            }}
                                            onCodeChange={setQualityCode}
                                            allowCustom={false}
                                        />

                                        <AttributeSelector
                                            type="color"
                                            value={selectedColor}
                                            onChange={(name, code) => {
                                                setSelectedColor(name);
                                                setAttributeCode(code);
                                            }}
                                            onCodeChange={setAttributeCode}
                                            allowCustom={true}
                                        />

                                        <AttributeSelector
                                            type="material"
                                            value={selectedMaterial}
                                            onChange={(name) => {
                                                setSelectedMaterial(name);
                                            }}
                                            allowCustom={true}
                                        />

                                        <AttributeSelector
                                            type="size"
                                            value={selectedSize}
                                            onChange={(name, code) => {
                                                setSelectedSize(name);
                                                setSizeCode(code);
                                            }}
                                            onCodeChange={setSizeCode}
                                            allowCustom={false}
                                        />

                                        {skuPreview && (
                                            <div className="pt-2 border-t border-indigo-100 flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Превью артикула:</span>
                                                <span className="text-base font-black text-indigo-600 font-mono tracking-wider">{skuPreview}</span>
                                            </div>
                                        )}

                                        {/* Hidden inputs to pass values to form */}
                                        <input type="hidden" name="qualityCode" value={qualityCode} />
                                        <input type="hidden" name="attributeCode" value={attributeCode} />
                                        <input type="hidden" name="sizeCode" value={sizeCode} />
                                    </div>
                                )}

                                {itemType === "packaging" && (
                                    <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-black text-amber-500 uppercase tracking-widest ml-1">Характеристики упаковки</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Ширина (см)</label>
                                                <input type="number" name="width" className="w-full h-12 px-4 rounded-xl border border-amber-100 bg-white text-sm font-bold focus:border-amber-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Высота (см)</label>
                                                <input type="number" name="height" className="w-full h-12 px-4 rounded-xl border border-amber-100 bg-white text-sm font-bold focus:border-amber-500 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Глубина (см)</label>
                                                <input type="number" name="depth" className="w-full h-12 px-4 rounded-xl border border-amber-100 bg-white text-sm font-bold focus:border-amber-500 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {itemType === "consumables" && (
                                    <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <label className="text-xs font-black text-emerald-600 uppercase tracking-widest ml-1">Область применения</label>
                                        <select name="department" className="w-full h-12 px-5 rounded-xl border border-emerald-100 bg-white text-sm font-bold focus:border-emerald-500 outline-none">
                                            <option value="">Все отделы</option>
                                            <option value="printing">Печать</option>
                                            <option value="embroidery">Вышивка</option>
                                            <option value="sewing">Пошив</option>
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <div className="space-y-2.5">
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                            <BarChart3 className="w-4 h-4" />
                                            Начальное наличие
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            defaultValue="0"
                                            min="0"
                                            required
                                            className="w-full h-14 px-5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-base focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-5 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                        <div className="space-y-2.5">
                                            <label className="flex items-center gap-2 text-xs font-black text-rose-500 uppercase tracking-widest ml-1">
                                                <AlertTriangle className="w-4 h-4" />
                                                Склад пустой (≤)
                                            </label>
                                            <input
                                                type="number"
                                                name="criticalStockThreshold"
                                                defaultValue="0"
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-sm focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <label className="flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-widest ml-1">
                                                <Package className="w-4 h-4" />
                                                Заканчивается (≤)
                                            </label>
                                            <input
                                                type="number"
                                                name="lowStockThreshold"
                                                defaultValue="10"
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Media */}
                                <div className="space-y-5">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                        <ImageIcon className="w-4 h-4" />
                                        Фотографии
                                    </label>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Лицевая (Основное)</label>
                                            <input type="file" name="image" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Со спины</label>
                                            <input type="file" name="imageBack" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Сбоку</label>
                                            <input type="file" name="imageSide" accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Детали (до 2-х фото)</label>
                                            <input type="file" name="imageDetails" accept="image/*" multiple className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-black uppercase tracking-wider">
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4">
                                    <SubmitButton />
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
