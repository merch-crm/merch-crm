"use client";

import { ArrowLeft, Download, Edit3, Package, Save, Trash2, X, RefreshCcw, LayoutGrid } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";
import { InventoryItem } from "../../../types";

interface ItemHeaderProps {
    item: InventoryItem;
    isEditing: boolean;
    isSaving: boolean;
    isAnyUploading: boolean;
    editName: string;
    onEditNameChange: (name: string) => void;
    onCancel: () => void;
    onSave: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onDownload: () => void;
}

const ITEM_TYPE_CONFIG: Record<string, { name: string, icon: React.ElementType, color: string }> = {
    clothing: { name: "Одежда", icon: Package, color: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100" },
    packaging: { name: "Упаковка", icon: Package, color: "bg-slate-50 text-slate-600 ring-1 ring-slate-100" },
    consumables: { name: "Расходники", icon: Package, color: "bg-slate-900 text-white" }
};

export function ItemHeader({
    item,
    isEditing,
    isSaving,
    isAnyUploading,
    editName,
    onEditNameChange,
    onCancel,
    onSave,
    onEdit,
    onDelete,
    onDownload
}: ItemHeaderProps) {
    const router = useRouter();
    const typeConfig = ITEM_TYPE_CONFIG[item.itemType] || ITEM_TYPE_CONFIG.clothing;
    const parentCategory = item.category?.parent;
    const currentCategory = item.category;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 py-2 px-4 rounded-[18px] bg-white border border-slate-200 text-slate-500 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-[12px] font-semibold">Назад</span>
                    </button>

                    <div className="hidden md:block">
                        <Breadcrumbs
                            items={[
                                { label: "Склад", href: "/dashboard/warehouse" },
                                ...(parentCategory ? [{ label: parentCategory.name }] : []),
                                ...(currentCategory ? [{ label: currentCategory.name }] : []),
                            ]}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-[18px] bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all shadow-sm">
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <div className="w-10 h-10 rounded-[18px] bg-slate-900 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://ui-avatars.com/api/?name=Admin&background=0a0a0a&color=fff" alt="User" />
                    </div>
                </div>
            </div>

            {/* Main Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-4 border-b border-slate-200/60">
                <div className="space-y-4 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge className={cn("px-4 py-1.5 rounded-[18px] text-[10px] font-bold border-none shadow-sm", typeConfig.color)}>
                            {typeConfig.name}
                        </Badge>
                        <div className="px-3 py-1 rounded-[18px] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600 leading-none">Активно</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {isEditing ? (
                            <div className="relative group">
                                <input
                                    value={editName}
                                    onChange={e => onEditNameChange(e.target.value)}
                                    className="text-4xl md:text-5xl font-bold text-slate-900 bg-transparent outline-none w-full border-b-2 border-indigo-500/30 focus:border-indigo-600 transition-colors pb-2"
                                    placeholder="Название..."
                                />
                            </div>
                        ) : (
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-[1.1] drop-shadow-sm">
                                {item.name}
                            </h1>
                        )}
                        <div className="flex items-center gap-4 text-slate-400 font-mono text-xs font-medium opacity-80 pt-2">
                            <span>{item.sku || "NO-SKU-ASSIGNED"}</span>
                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>ID: {item.id.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                className="h-14 px-8 rounded-[18px] font-semibold text-[13px] text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Отмена
                            </Button>
                            <Button
                                onClick={onSave}
                                disabled={isSaving || isAnyUploading}
                                className="h-14 px-10 rounded-[18px] bg-slate-900 hover:bg-black text-white font-semibold text-[13px] shadow-lg transition-all active:scale-95 border-none"
                            >
                                {isSaving ? (
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-3" />
                                        {isAnyUploading ? "Uploading..." : "Сохранить"}
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={onDownload}
                                className="h-14 w-14 rounded-[18px] bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 hover:scale-105 transition-all shadow-sm flex items-center justify-center p-0"
                            >
                                <Download className="w-5 h-5" />
                            </Button>
                            <Button
                                onClick={onEdit}
                                className="h-14 px-10 rounded-[18px] bg-slate-900 hover:bg-black text-white font-semibold text-[13px] shadow-lg transition-all active:scale-95 group"
                            >
                                <Edit3 className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
                                Редактировать
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onDelete}
                                className="h-14 w-14 rounded-[18px] bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm flex items-center justify-center p-0"
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
