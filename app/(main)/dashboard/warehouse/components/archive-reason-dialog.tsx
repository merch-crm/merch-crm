"use client";

import { useState } from "react";
import { X, Archive, AlertCircle, RefreshCw } from "lucide-react";
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-sm bg-white rounded-[var(--radius-outer)] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                {/* Header Section */}
                <div className="p-6 pb-2 flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
                        <Archive className="w-6 h-6" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                        {displayTitle}
                    </h3>
                </div>

                <div className="px-6 space-y-4">
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-500 leading-relaxed text-center px-4">
                            {displayDescription}
                        </p>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-bold text-slate-500 ml-1">
                                Причина архивации <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                autoFocus
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (error) setError(false);
                                }}
                                placeholder="..."
                                className={cn(
                                    "w-full min-h-[80px] p-4 rounded-[var(--radius-inner)] border text-sm font-semibold transition-all outline-none resize-none placeholder:text-slate-200",
                                    error
                                        ? "bg-rose-50 border-rose-200 text-rose-900 focus:border-rose-300"
                                        : "bg-slate-50/50 border-slate-200 text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-inner"
                                )}
                            />
                            {error && (
                                <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 ml-2 animate-in slide-in-from-top-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Укажите причину</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 flex gap-3 pt-6">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-[var(--radius-inner)] font-bold text-xs text-slate-400 hover:bg-slate-50 transition-all border border-transparent"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || !reason.trim()}
                        className="flex-[1.5] h-11 rounded-[var(--radius-inner)] bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 text-white font-bold text-xs transition-all active:scale-95 disabled:opacity-40"
                    >
                        {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : "Архивировать"}
                    </Button>
                </div>

                {/* Top Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-[var(--radius-inner)] bg-slate-50 text-slate-300 hover:text-slate-900 flex items-center justify-center transition-all group"
                >
                    <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                </button>
            </div>
        </div>
    );
}
