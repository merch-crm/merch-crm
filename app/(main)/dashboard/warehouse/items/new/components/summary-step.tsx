"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Ruler, AlertCircle, Package, Warehouse, Banknote, Sparkles, X, LayoutGrid, Tag, Shirt, Scale } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Category, ItemFormData, StorageLocation, InventoryAttribute, AttributeType } from "../../../types";
import { StepFooter } from "./step-footer";
import { getCategoryIcon, getColorStyles, CLOTHING_COLORS } from "../../../category-utils";
import { createElement } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveModal } from "@/components/ui/responsive-modal";




interface SummaryStepProps {
    category: Category;
    subCategories: Category[];
    storageLocations: StorageLocation[];
    dynamicAttributes: InventoryAttribute[];
    attributeTypes: AttributeType[];
    formData: ItemFormData;
    updateFormData: (updates: Partial<ItemFormData>) => void;
    onSubmit: () => void;
    onBack: () => void;
    validationError: string;
    isSubmitting: boolean;
}

export function SummaryStep({
    category,
    subCategories,
    storageLocations,
    dynamicAttributes,
    // attributeTypes, // unused
    formData,
    updateFormData,
    onSubmit,
    onBack,
    validationError,
    isSubmitting
}: SummaryStepProps) {
    // 1. Hooks (Conditional-free, at the top)
    const isMobile = useIsMobile();
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(formData.itemName);

    const [prevItemName, setPrevItemName] = useState(formData.itemName);
    if (formData.itemName !== prevItemName) {
        setPrevItemName(formData.itemName);
        if (!isEditingName) {
            setTempName(formData.itemName);
        }
    }

    // 2. Logic (Derived state)
    const sub = subCategories.find(s => s.id === formData.subcategoryId);
    const selectedColor = CLOTHING_COLORS.find(c => c.code === formData.attributeCode);
    const accentColor = selectedColor?.hex;

    const getAttrName = (type: string, code?: string) => {
        if (!code) return null;
        const attr = dynamicAttributes.find(a => a.type === type && a.value === code);
        return attr ? attr.name : code;
    };

    // 3. Render
    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 px-4 sm:px-10 pt-6 sm:pt-10 pb-6 sm:pb-10 overflow-y-auto min-h-0 custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Item Name & Status Header */}
                    <div className="relative bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                        {/* Status Bar */}
                        <div className="h-2 w-full flex">
                            <div className="flex-1 bg-emerald-500" />
                            <div className="w-1/3 bg-emerald-500/30" />
                        </div>

                        <div className="p-6 sm:p-10">
                            <div
                                className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none"
                                style={{
                                    background: accentColor
                                        ? `linear-gradient(135deg, ${accentColor} 0%, transparent 100%)`
                                        : 'linear-gradient(135deg, #000 0%, transparent 100%)',
                                    maskImage: 'radial-gradient(circle at top right, black, transparent 70%)'
                                }}
                            />

                            <div className="relative z-10 flex items-start justify-between gap-4 sm:gap-8">
                                <div className="flex-1 min-w-0 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Готово к созданию</span>
                                        </div>
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-1">ID: DRAFT</div>
                                    </div>

                                    <div className="flex items-center gap-4 group/name relative">
                                        {(isEditingName && !isMobile) ? (
                                            <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={tempName}
                                                    onChange={(e) => setTempName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            updateFormData({ itemName: tempName });
                                                            setIsEditingName(false);
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setTempName(formData.itemName);
                                                            setIsEditingName(false);
                                                        }
                                                    }}
                                                    className="text-4xl sm:text-5xl font-black text-slate-900 bg-slate-50 border-b-2 border-slate-900 focus:outline-none w-full py-1 h-auto"
                                                />
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            updateFormData({ itemName: tempName });
                                                            setIsEditingName(false);
                                                        }}
                                                        className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg active:scale-90"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setTempName(formData.itemName);
                                                            setIsEditingName(false);
                                                        }}
                                                        className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-colors active:scale-90"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight pr-4">
                                                    {formData.itemName}
                                                </h1>
                                                <button
                                                    onClick={() => setIsEditingName(true)}
                                                    className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center opacity-0 group-hover/name:opacity-100 hover:text-slate-900 hover:border-slate-900 transition-all shrink-0 active:scale-90"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1">Артикул SKU</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/50">{formData.sku}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none mb-1">Категория</span>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm", getColorStyles(sub?.color || category.color))}>
                                                    {createElement(getCategoryIcon(sub || category), { className: "w-4 h-4", strokeWidth: 2.5 })}
                                                </div>
                                                <span className="text-base font-bold text-slate-600">{category.name} <span className="text-slate-300 mx-1">/</span> {sub?.name || "Основная"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Preview Thumbnail */}
                                {formData.imagePreview && (
                                    <div className="hidden sm:block shrink-0 relative">
                                        <div className="absolute inset-0 bg-slate-900/5 rounded-[24px] rotate-3" />
                                        <div className="relative w-44 h-44 rounded-[24px] overflow-hidden border-2 border-white shadow-2xl shadow-slate-200">
                                            <Image
                                                src={formData.imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bento Grid layout */}
                    <div className="grid grid-cols-12 gap-6 sm:gap-8">
                        {/* Attributes Section */}
                        <div className="col-span-12 lg:col-span-7 space-y-6 sm:space-y-8">
                            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                                            <LayoutGrid className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 ">Характеристики</h3>
                                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Атрибуты позиции</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-8">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                        {[
                                            { label: "Бренд", value: getAttrName("brand", formData.brandCode), icon: Tag },
                                            { label: "Цвет", value: selectedColor?.name, icon: () => <div className="w-2.5 h-2.5 rounded-full border border-black/10" style={{ backgroundColor: selectedColor?.hex }} /> },
                                            { label: "Размер", value: getAttrName("size", formData.sizeCode), icon: Ruler },
                                            { label: "Качество", value: getAttrName("quality", formData.qualityCode), icon: CheckCircle2 },
                                            { label: "Материал", value: getAttrName("material", formData.materialCode), icon: Shirt },
                                            { label: "Ед. изм.", value: formData.unit, icon: Scale }
                                        ].filter(i => i.value).map((item, idx) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={idx} className="flex flex-col p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                                            <Icon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{item.label}</span>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-900 tracking-tight">{item.value}</span>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Custom Extra Attributes if any */}
                                    {formData.attributes && Object.keys(formData.attributes).some(k => !["Бренд", "Цвет", "Размер", "Качество", "Материал"].includes(k)) && (
                                        <div className="mt-8 pt-8 border-t border-slate-100">
                                            <div className="flex flex-wrap gap-3">
                                                {Object.entries(formData.attributes)
                                                    .filter(([k]) => !["Бренд", "Цвет", "Размер", "Качество", "Материал"].includes(k))
                                                    .map(([key, val]) => (
                                                        <div key={key} className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200/50 flex items-center gap-3 shadow-sm group hover:border-slate-300 transition-all">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-900 transition-colors" />
                                                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{key}:</span>
                                                            <span className="text-sm font-bold text-slate-900">{String(val)}</span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Images Strip */}
                            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-6 sm:p-8 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                                            <Package className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 ">Галерея</h3>
                                            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Визуальные материалы</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8">
                                    <div className="flex flex-nowrap gap-4 overflow-x-auto pb-4 custom-scrollbar lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
                                        {[
                                            formData.imagePreview,
                                            formData.imageBackPreview,
                                            formData.imageSidePreview,
                                            ...(formData.imageDetailsPreviews || [])
                                        ].filter(Boolean).map((img, idx) => (
                                            <div key={idx} className="relative w-32 h-32 sm:w-40 sm:h-40 xl:w-full xl:aspect-square shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                                                <Image src={img!} alt="" fill className="object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Inventory & Financials Section */}
                        <div className="col-span-12 lg:col-span-5 space-y-8">
                            {/* Stock Card */}
                            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl shadow-slate-900/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-1000" />

                                <div className="relative z-10 flex flex-col h-full gap-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                                <Warehouse className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-white/40 leading-none mb-1">Склад</h4>
                                                <p className="text-sm font-bold text-white leading-none">
                                                    {storageLocations.find(l => l.id === formData.storageLocationId)?.name || 'Не выбран'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Остаток</div>
                                            <div className="text-3xl font-black leading-none">{formData.quantity} <span className="text-sm text-white/50">{formData.unit}</span></div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-white/10 w-full" />

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">Порог (Low)</span>
                                                </div>
                                                <div className="text-xl font-bold">{formData.lowStockThreshold || 0}</div>
                                            </div>
                                            <div className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 truncate">Порог (Crit)</span>
                                                </div>
                                                <div className="text-xl font-bold">{formData.criticalStockThreshold || 0}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financials Card */}
                            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 flex flex-col gap-6 ">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-100/50">
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 ">Финансы</h3>
                                        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Цены и маржин</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                                                <Tag className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">Себестоимость</span>
                                        </div>
                                        <div className="text-lg font-black text-slate-900">{parseFloat(formData.costPrice || "0").toLocaleString()} ₽</div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-transform">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                                                <Banknote className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-white/60">Цена продажи</span>
                                        </div>
                                        <div className="text-xl font-black">{parseFloat(formData.sellingPrice || "0").toLocaleString()} ₽</div>
                                    </div>

                                    {/* Profit Indicator */}
                                    {parseFloat(formData.sellingPrice || "0") > 0 && (
                                        <div className="mt-2 p-4 rounded-2xl bg-emerald-50 border border-emerald-100/50 flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                                <span>Прибыль с единицы</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="w-3 h-3" />
                                                    <span>Premium Meta</span>
                                                </div>
                                            </div>
                                            <div className="flex items-baseline justify-between">
                                                <div className="text-2xl font-black text-emerald-900">
                                                    {Math.max(0, parseFloat(formData.sellingPrice || "0") - parseFloat(formData.costPrice || "0")).toLocaleString()} ₽
                                                </div>
                                                <div className="text-sm font-black text-emerald-600 px-2 py-0.5 bg-white rounded-lg border border-emerald-100 shadow-sm">
                                                    +{Math.round(((parseFloat(formData.sellingPrice || "0") - parseFloat(formData.costPrice || "0")) / (parseFloat(formData.costPrice || "1") || 1)) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <StepFooter
                onBack={onBack}
                onNext={onSubmit}
                nextLabel="Создать позицию"
                isSubmitting={isSubmitting}
                validationError={validationError}
            />

            {/* Mobile Name Edit Sheet */}
            <ResponsiveModal
                isOpen={isEditingName && isMobile}
                onClose={() => setIsEditingName(false)}
                className="w-full sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl rounded-t-[32px] sm:rounded-[32px]"
                showVisualTitle={false}
            >
                <div className="flex flex-col overflow-hidden max-h-[90vh]">
                    {/* Visual Header Handle */}
                    <div className="flex justify-center pt-3 pb-1 sm:hidden">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                    </div>

                    {/* Standard Sheet Header Style */}
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-200">
                                <Pencil className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 leading-none">Название</h3>
                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-1">Редактирование</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsEditingName(false)}
                            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 p-6 space-y-6 overflow-y-auto min-h-0">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Текущее название</label>
                            <textarea
                                autoFocus
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="w-full min-h-[140px] p-5 rounded-[24px] bg-slate-50 border-2 border-slate-100 text-lg font-bold text-slate-900 shadow-inner focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all outline-none resize-none"
                                placeholder="Введите название..."
                            />
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                            <p className="text-xs font-bold text-amber-600 leading-relaxed">
                                Изменение названия вручную может повлиять на автоматическое обновление при смене характеристик.
                            </p>
                        </div>
                    </div>

                    {/* Sticky Footer with blur */}
                    <div className="p-6 pt-4 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0 z-20">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setTempName(formData.itemName);
                                    setIsEditingName(false);
                                }}
                                className="h-11 w-full sm:flex-1 rounded-[var(--radius-inner)] text-slate-500 font-bold hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={() => {
                                    updateFormData({ itemName: tempName });
                                    setIsEditingName(false);
                                }}
                                className="h-11 w-full sm:flex-1 btn-dark rounded-[var(--radius-inner)] text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                            >
                                <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
                                Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    );
}
