"use client";

import { useRef, useEffect } from "react";

import { Edit3, Save, Trash2, X, RefreshCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { InventoryItem } from "../../../types";
import { cn } from "@/lib/utils";

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
    onUnarchive: () => void;
}

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
    onUnarchive,
}: ItemHeaderProps) {
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [isEditing, editName]);

    return (
        <div className={cn(
            "space-y-6 animate-in fade-in duration-700 w-full",
            item.isArchived && "opacity-80"
        )}>
            {/* Status Banner for Archive */}
            {item.isArchived && (
                <div className="w-full bg-rose-50 border border-rose-100 p-4 rounded-[var(--radius-outer)] flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[var(--radius-inner)] bg-rose-500 text-white flex items-center justify-center">
                            <Trash2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-rose-900 leading-none mb-1 uppercase tracking-wide">Архив товара</p>
                            <p className="text-[11px] font-medium text-rose-500/80 leading-none">Этот товар не отображается в общем каталоге и заказах.</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={onUnarchive}
                        className="h-11 px-8 rounded-[var(--radius-inner)] bg-rose-900 hover:bg-black text-white text-sm font-bold shadow-lg shadow-rose-900/10 transition-all active:scale-95"
                    >
                        Восстановить
                    </Button>
                </div>
            )}

            {/* Main Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">
                <div className="space-y-4 flex-1 min-w-0">

                    <div className="flex flex-wrap items-center gap-4">
                        {isEditing ? (
                            <div className="relative group w-full max-w-4xl">
                                <textarea
                                    ref={textareaRef}
                                    value={editName}
                                    onChange={e => onEditNameChange(e.target.value)}
                                    className="text-2xl md:text-4xl font-bold text-slate-900 bg-transparent outline-none w-full border-b-2 border-primary/30 focus:border-primary transition-colors pb-2 placeholder:text-slate-200 resize-none overflow-hidden tracking-tight"
                                    placeholder="Название..."
                                    rows={1}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push('/dashboard/warehouse')}
                                    className="hidden md:flex w-10 h-10 rounded-[var(--radius-inner)] text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all items-center justify-center mr-2 shrink-0 group"
                                >
                                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                                </Button>
                                <h1
                                    className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight line-clamp-2 pr-4 cursor-pointer tracking-tight"
                                    onDoubleClick={onEdit}
                                >
                                    {(() => {
                                        // Auto-convert to singular if category metadata allows
                                        // This handles "Футболки ..." -> "Футболка ..."
                                        const cat = item.category as { singularName?: string; name?: string } | null;
                                        if (cat?.singularName && cat?.name && item.name.startsWith(cat.name)) {
                                            return item.name.replace(cat.name, cat.singularName);
                                        }
                                        return item.name;
                                    })()}
                                </h1>

                                {item.isArchived && (
                                    <div className="h-8 px-4 rounded-full bg-slate-900 text-white flex items-center gap-2">
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">Архив</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    {isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                className="h-11 px-8 rounded-[var(--radius-inner)] font-bold text-[13px] text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Отмена
                            </Button>
                            <Button
                                onClick={onSave}
                                disabled={isSaving || isAnyUploading}
                                className="h-11 px-10 rounded-[var(--radius-inner)] btn-dark font-bold text-[13px] border-none"
                            >
                                {isSaving ? (
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-3" />
                                        {isAnyUploading ? "Загрузка..." : "Сохранить"}
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Tools Group */}


                            {!item.isArchived && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={onEdit}
                                        className="h-11 px-10 rounded-[var(--radius-inner)] btn-dark font-bold text-[13px] group border-none"
                                    >
                                        <Edit3 className="w-5 h-5 mr-3 transition-transform" />
                                        Редактировать
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
