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
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-white/20 animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col">
                {/* Header Section */}
                <div className="p-10 pb-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-[28px] bg-amber-50 text-amber-500 flex items-center justify-center mb-6 shadow-sm shadow-amber-500/10">
                        <Archive className="w-10 h-10" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight px-4">
                        {displayTitle}
                    </h3>

                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        {pluralize(itemCount, 'Выбрана', 'Выбрано', 'Выбрано')} {itemCount} {pluralize(itemCount, 'позиция', 'позиции', 'позиций')}
                    </div>
                </div>

                <div className="px-10 space-y-6">
                    <div className="space-y-4">
                        <p className="text-[15px] font-bold text-slate-400 leading-relaxed text-center">
                            {displayDescription}
                        </p>

                        <div className="space-y-3 pt-2">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
                                Причина архивации <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                autoFocus
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    if (error) setError(false);
                                }}
                                placeholder="Например: Снято с производства или технический брак..."
                                className={cn(
                                    "w-full min-h-[120px] p-6 rounded-[28px] border text-[14px] font-semibold transition-all outline-none resize-none placeholder:text-slate-200",
                                    error
                                        ? "bg-rose-50 border-rose-200 text-rose-900 focus:border-rose-300"
                                        : "bg-slate-50 border-slate-100 text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-inner"
                                )}
                            />
                            {error && (
                                <div className="flex items-center gap-2 text-[11px] font-black text-rose-500 ml-2 animate-in slide-in-from-top-1">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Укажите причину для продолжения</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-10 flex flex-col sm:flex-row gap-4 pt-8">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-14 rounded-2xl font-black text-[13px] text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={isLoading || !reason.trim()}
                        className="flex-[1.5] h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/20 text-white font-black text-[13px] transition-all active:scale-95 disabled:opacity-40"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Обработка</span>
                            </div>
                        ) : "Архивировать"}
                    </Button>
                </div>

                {/* Top Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all group"
                >
                    <X className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                </button>
            </div>
        </div>
    );
}
