"use client";

import { useState } from "react";
import { Archive, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

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

    const footerContent = (
        <div className="p-5 pt-3 flex items-center justify-end gap-3 bg-white/95 backdrop-blur-md border-t border-slate-100">
            <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex h-11 text-slate-400 hover:text-slate-600 font-bold text-sm px-6"
            >
                Отмена
            </Button>
            <Button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading || !reason.trim()}
                className="h-11 flex-1 sm:flex-none sm:px-10 rounded-[var(--radius-inner)] bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-40"
            >
                {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                ) : "Архивировать"}
            </Button>
        </div>
    );

    return (
        <ResponsiveModal isOpen={isOpen} onClose={onClose} footer={footerContent} showVisualTitle={false}>
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header Section */}
                <div className="p-6 pb-2 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-12 h-12 rounded-[var(--radius-inner)] bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 shadow-sm border border-amber-100">
                            <Archive className="w-6 h-6" />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                            {displayTitle}
                        </h3>
                    </div>
                </div>

                <div className="px-6 pb-20 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-700 leading-relaxed px-4">
                            {displayDescription}
                        </p>

                        <div className="space-y-1.5 pt-2">
                            <label htmlFor="archive-reason" className="text-sm font-bold text-slate-700 ml-1">
                                Причина архивации <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                id="archive-reason"
                                autoFocus
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (error) setError(false);
                                }}
                                placeholder="…"
                                className={cn(
                                    "w-full min-h-[140px] p-4 rounded-[var(--radius-inner)] border text-sm font-semibold transition-all outline-none resize-none placeholder:text-slate-300",
                                    error
                                        ? "bg-rose-50 border-rose-200 text-rose-900 focus:border-rose-300"
                                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-sm"
                                )}
                            />
                            {error && (
                                <div className="flex items-center gap-2 text-xs font-bold text-rose-500 ml-2 animate-in slide-in-from-top-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Укажите причину</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    );
}
