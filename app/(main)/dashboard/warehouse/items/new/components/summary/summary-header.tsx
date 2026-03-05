import { createElement } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Category, ItemFormData, AttributeType, InventoryAttribute } from "@/app/(main)/dashboard/warehouse/types";
import { getCategoryIcon, getCategoryCardStyles } from "@/app/(main)/dashboard/warehouse/category-utils";

interface NameEditState {
    isEditing: boolean;
    tempName: string;
    onEditClick: () => void;
    onNameChange: (val: string) => void;
    onSaveName: () => void;
    onCancelName: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface SummaryHeaderProps {
    formData: ItemFormData;
    category: Category;
    attributeTypes: AttributeType[];
    dynamicAttributes: InventoryAttribute[];
    activeSubcategory?: Category;
    accentColor?: string;
    isMobile: boolean;
    nameEdit: NameEditState;
}

export function SummaryHeader({
    formData,
    category,
    attributeTypes,
    dynamicAttributes,
    activeSubcategory,
    accentColor,
    isMobile,
    nameEdit,
}: SummaryHeaderProps) {
    const { isEditing: isEditingName, tempName, onEditClick, onNameChange, onSaveName, onCancelName, onKeyDown } = nameEdit;
    const cardStyles = getCategoryCardStyles(category?.color || "#000");
    const categoryIcon = getCategoryIcon(category);

    return (
        <div className="relative bg-white rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            {/* Status Bar */}
            <div className="h-2 w-full flex">
                <div className="flex-1 bg-emerald-500" />
                <div className="w-1/3 bg-emerald-500/30" />
            </div>

            <div className="p-6 sm:p-6">
                <div
                    className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none z-0"
                    style={{
                        background: accentColor
                            ? `linear-gradient(135deg, ${accentColor} 0%, transparent 100%)`
                            : 'linear-gradient(135deg, #000 0%, transparent 100%)',
                        maskImage: 'radial-gradient(circle at top right, black, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(circle at top right, black, transparent 70%)'
                    }}
                />

                <div className="relative z-10 flex items-start justify-between gap-3 sm:gap-3">
                    <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 shadow-sm ring-4 ring-emerald-50/30">
                                <div className="relative flex items-center justify-center w-3 h-3">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.6, 1],
                                            opacity: [0.4, 0.1, 0.4],
                                        }}
                                        transition={{
                                            duration: 2.2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute inset-0 rounded-full bg-emerald-400"
                                    />
                                    <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                </div>
                                <span className="text-xs font-black text-emerald-600 leading-none">Готово к созданию</span>
                            </div>
                            <div className="text-xs font-black text-slate-300 px-1">ID: DRAFT</div>
                        </div>

                        <div className="flex items-start gap-3 group/name relative">
                            {(isEditingName && !isMobile) ? (
                                <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <Input
                                        autoFocus
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => onNameChange(e.target.value)}
                                        onKeyDown={onKeyDown}
                                        className="text-3xl sm:text-4xl font-black text-slate-900 bg-slate-50 border-none border-b-2 border-slate-900 focus-visible:ring-0 shadow-none w-full py-1 h-auto rounded-none"
                                    />
                                    <div className="flex items-center gap-1">
                                        <Button
                                            onClick={onSaveName}
                                            size="icon"
                                            variant="default"
                                            className="w-10 h-10 rounded-full bg-slate-900 hover:bg-emerald-600 shadow-lg active:scale-90"
                                        >
                                            <CheckCircle2 className="w-5 h-5" strokeWidth={3} />
                                        </Button>
                                        <Button
                                            onClick={onCancelName}
                                            size="icon"
                                            variant="ghost"
                                            className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 active:scale-95"
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-[1.1] pr-4 tracking-tight">
                                        {formData.itemName}
                                    </h1>
                                    <Button
                                        onClick={onEditClick}
                                        size="icon"
                                        variant="ghost"
                                        className="w-10 h-10 mt-1 rounded-full bg-slate-50 border border-slate-100 text-slate-400 opacity-0 group-hover/name:opacity-100 hover:text-slate-900 hover:border-slate-900 transition-all shrink-0 active:scale-90 hidden sm:flex"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                                    <span className="text-xs font-black text-slate-400 tracking-wider leading-none">Артикул</span>
                                    <span className="w-px h-3 bg-slate-200" />
                                    <span className="text-sm font-mono font-bold text-indigo-500 tracking-wider leading-none">{formData.sku || "---"}</span>
                                </div>

                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                                    <span className="text-xs font-black text-slate-400 tracking-wider leading-none">Категория</span>
                                    <span className="w-px h-3 bg-slate-200" />
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className="w-4 h-4 rounded-[4px] flex items-center justify-center shrink-0 shadow-sm text-white"
                                            style={cardStyles.icon}
                                        >
                                            {createElement(categoryIcon, { className: "w-2.5 h-2.5", "aria-label": category.name })}
                                        </div>
                                        <span className="text-xs font-bold text-slate-700 leading-none pb-[1px]">
                                            {category.name}: {activeSubcategory?.name || "Основная"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Standardized Chips Display (Styled Reference) */}
                            <div className="flex flex-wrap gap-2 pt-1">
                                {(() => {
                                    const filteredEntries = Object.entries(formData.attributes || {}).map(([key, value]) => {
                                        if (!value || typeof value !== 'string') return null;
                                        if (/^[a-f0-9-]{36}$/.test(value) || /^[a-f0-9-]{36}$/.test(key)) return null;

                                        // Resolve Type
                                        const type = attributeTypes?.find(t => t.slug === key);
                                        if (!type) return null;

                                        // Resolve Value Name
                                        const attr = dynamicAttributes?.find(a => a.type === key && a.value === value);
                                        const displayValue = attr?.name || value;

                                        return {
                                            label: type.name,
                                            displayValue,
                                            slug: key,
                                            sortOrder: type.sortOrder || 0,
                                            showInName: type.showInName !== false
                                        };
                                    }).filter((chip): chip is NonNullable<typeof chip> => {
                                        if (!chip) return false;
                                        if (!chip.showInName) return false;

                                        const lowerSlug = chip.slug.toLowerCase();
                                        if (lowerSlug.endsWith('code')) return false;
                                        if (["thumbnailsettings"].includes(lowerSlug)) return false;

                                        return true;
                                    }).sort((a, b) => a.sortOrder - b.sortOrder);

                                    if (filteredEntries.length === 0) return null;

                                    return filteredEntries.map((chip) => (
                                        <div
                                            key={chip.slug}
                                            className="inline-flex items-baseline gap-1.5 bg-white border border-slate-200/80 rounded-[10px] sm:rounded-[12px] px-2.5 sm:px-3 py-1.5 sm:py-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] transition-all"
                                        >
                                            <span className="text-[11px] sm:text-xs font-black text-slate-400/80 tracking-wide">{chip.label}</span>
                                            <span className="text-xs sm:text-[13px] font-bold text-slate-800">{chip.displayValue}</span>
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Main Preview Thumbnail */}
                    {formData.imagePreview && (
                        <div className="hidden sm:block shrink-0 relative">
                            <div className="absolute inset-0 bg-slate-900/5 rounded-3xl rotate-3" />
                            <div className="relative w-44 h-44 rounded-3xl overflow-hidden border-2 border-white shadow-2xl shadow-slate-200">
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
    );
}
