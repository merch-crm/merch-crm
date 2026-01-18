"use client";

import { ArrowLeft, Download, Edit3, Package, Save, Trash2, X, RefreshCcw } from "lucide-react";
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
    clothing: { name: "Одежда", icon: Package, color: "bg-blue-500 text-white" },
    packaging: { name: "Упаковка", icon: Package, color: "bg-amber-500 text-white" },
    consumables: { name: "Расходники", icon: Package, color: "bg-emerald-500 text-white" }
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
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Склад", href: "/dashboard/warehouse", icon: Package },
                    ...(parentCategory ? [{ label: parentCategory.name, href: `/dashboard/warehouse/${parentCategory.id}` }] : []),
                    ...(currentCategory ? [{ label: currentCategory.name, href: `/dashboard/warehouse/${currentCategory.id}` }] : []),
                    { label: item.name }
                ]}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => router.back()}
                        className="group w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95 shrink-0 shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                    </button>

                    <div>
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <div className="relative flex-1 max-w-xl">
                                    <input
                                        value={editName}
                                        onChange={e => onEditNameChange(e.target.value)}
                                        className="text-3xl font-black text-slate-900 tracking-tight leading-tight bg-slate-50/30 border-b-2 border-indigo-500 focus:bg-indigo-50/50 outline-none px-3 py-1 w-full transition-all"
                                        placeholder="Название товара"
                                    />
                                </div>
                            ) : (
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{item.name}</h1>
                            )}
                            <Badge className={cn("px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-tighter shrink-0", typeConfig.color)}>
                                <typeConfig.icon className="w-3.5 h-3.5 mr-1.5 inline" />
                                {typeConfig.name}
                            </Badge>
                        </div>
                        <div className="mt-2 text-slate-400 uppercase tracking-[0.2em] font-black text-[10px]">
                            АРТИКУЛ: {item.sku || "БЕЗ АРТИКУЛА"}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                className="h-12 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Отмена
                            </Button>
                            <Button
                                onClick={onSave}
                                disabled={isSaving || isAnyUploading}
                                className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
                            >
                                {isSaving ? (
                                    <>
                                        <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {isAnyUploading ? "Загрузка фото..." : "Сохранить"}
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={onDownload}
                                className="h-12 w-12 p-0 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                            >
                                <Download className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onEdit}
                                className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 gap-2 shadow-sm"
                            >
                                <Edit3 className="w-4 h-4" />
                                Редактировать
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={onDelete}
                                className="h-12 w-12 p-0 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all shadow-sm"
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
