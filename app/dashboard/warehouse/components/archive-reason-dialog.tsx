"use client";

import { useState } from "react";
import { X, Archive, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";

interface ArchiveReasonDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
    description?: string;
    isLoading?: boolean;
    itemCount?: number;
}

export function ArchiveReasonDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading = false,
    itemCount = 1
}: ArchiveReasonDialogProps) {
    const displayTitle = title || `Архивация ${pluralize(itemCount, 'позиции', 'позиций', 'позиций')}`;
    const displayDescription = description || `Укажите причину архивации ${pluralize(itemCount, 'выбранного товара', 'выбранных товаров', 'выбранных товаров')} (${itemCount}) для истории операций.`;
    const [reason, setReason] = useState("");
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError(true);
            return;
        }
        onConfirm(reason);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm">
                            <Archive className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">{displayTitle}</h3>
                            <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {pluralize(itemCount, 'Выбрана', 'Выбрано', 'Выбрано')} {itemCount} {pluralize(itemCount, 'позиция', 'позиции', 'позиций')}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-xl bg-slate-50 transition-all active:scale-95"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-8 pt-4 space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                            {displayDescription}
                        </p>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 ml-1">
                                Причина архивации <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                autoFocus
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (error) setError(false);
                                }}
                                placeholder="Например: Снято с производства, поврежденная партия..."
                                className={cn(
                                    "w-full min-h-[100px] p-5 rounded-2xl border text-sm font-semibold transition-all outline-none resize-none placeholder:text-slate-300",
                                    error
                                        ? "bg-rose-50 border-rose-200 text-rose-900 focus:border-rose-300"
                                        : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                                )}
                            />
                            {error && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Пожалуйста, укажите причину</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 h-14 rounded-2xl font-black text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isLoading || !reason.trim()}
                            className="flex-[2] h-14 rounded-2xl btn-primary shadow-xl shadow-primary/20 text-white font-black text-xs transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? "Архивация..." : "Архивировать"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
