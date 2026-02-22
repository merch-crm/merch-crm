import { createElement } from "react";
import Image from "next/image";
import { CheckCircle2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Category, ItemFormData } from "@/app/(main)/dashboard/warehouse/types";
import { getCategoryIcon, getColorStyles } from "@/app/(main)/dashboard/warehouse/category-utils";

interface SummaryHeaderProps {
    formData: ItemFormData;
    category: Category;
    activeSubcategory?: Category;
    accentColor?: string;
    isMobile: boolean;
    isEditingName: boolean;
    tempName: string;
    onEditClick: () => void;
    onNameChange: (val: string) => void;
    onSaveName: () => void;
    onCancelName: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function SummaryHeader({
    formData,
    category,
    activeSubcategory,
    accentColor,
    isMobile,
    isEditingName,
    tempName,
    onEditClick,
    onNameChange,
    onSaveName,
    onCancelName,
    onKeyDown
}: SummaryHeaderProps) {
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
                            <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-black text-emerald-600 leading-none">Готово к созданию</span>
                            </div>
                            <div className="text-xs font-black text-slate-300 px-1">ID: DRAFT</div>
                        </div>

                        <div className="flex items-center gap-3 group/name relative">
                            {(isEditingName && !isMobile) ? (
                                <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <Input
                                        autoFocus
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => onNameChange(e.target.value)}
                                        onKeyDown={onKeyDown}
                                        className="text-4xl sm:text-5xl font-black text-slate-900 bg-slate-50 border-none border-b-2 border-slate-900 focus-visible:ring-0 shadow-none w-full py-1 h-auto rounded-none"
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
                                    <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] tracking-tight pr-4">
                                        {formData.itemName}
                                    </h1>
                                    <Button
                                        onClick={onEditClick}
                                        size="icon"
                                        variant="ghost"
                                        className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-400 opacity-0 group-hover/name:opacity-100 hover:text-slate-900 hover:border-slate-900 transition-all shrink-0 active:scale-90 hidden sm:flex"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-700 leading-none mb-1">Артикул SKU</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200/50">{formData.sku || "---"}</span>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-700 leading-none mb-1">Категория</span>
                                <div className="flex items-center gap-2">
                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm", getColorStyles(activeSubcategory?.color || category.color))}>
                                        {createElement(getCategoryIcon(activeSubcategory || category), { className: "w-4 h-4", strokeWidth: 2.5 })}
                                    </div>
                                    <span className="text-base font-bold text-slate-600">
                                        {category.name} <span className="text-slate-300 mx-1">/</span> {activeSubcategory?.name || "Основная"}
                                    </span>
                                </div>
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
