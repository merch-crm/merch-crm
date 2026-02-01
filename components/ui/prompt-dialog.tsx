"use client";

import { useState } from "react";
import { X, Edit3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PromptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    description?: string;
    label?: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    initialValue?: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function PromptDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    label,
    placeholder,
    confirmText = "Подтвердить",
    cancelText = "Отмена",
    isLoading = false,
    initialValue = "",
    inputProps
}: PromptDialogProps) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!value.trim()) {
            setError(true);
            return;
        }
        onConfirm(value);
        setValue(""); // Reset after confirm
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                            <Edit3 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">{title}</h3>
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
                    {(description) && (
                        <p className="text-sm font-bold text-slate-600 leading-relaxed">
                            {description}
                        </p>
                    )}

                    <div className="space-y-2">
                        {label && (
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                {label} <span className="text-rose-500">*</span>
                            </label>
                        )}
                        <input
                            autoFocus
                            type="text"
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                if (error) setError(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleConfirm();
                            }}
                            placeholder={placeholder}
                            className={cn(
                                "w-full h-12 px-5 rounded-2xl border text-sm font-semibold transition-all outline-none placeholder:text-slate-300",
                                error
                                    ? "bg-rose-50 border-rose-200 text-rose-900 focus:border-rose-300"
                                    : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"
                            )}
                            {...inputProps}
                        />
                        {error && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 ml-1 animate-in slide-in-from-top-1">
                                <AlertCircle className="w-3 h-3" />
                                <span>Поле не может быть пустым</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 h-11 rounded-[var(--radius-inner)] font-bold text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isLoading || !value.trim()}
                            className="flex-[2] h-11 rounded-[var(--radius-inner)] bg-primary shadow-xl shadow-primary/20 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 border-none"
                        >
                            {isLoading ? "Сохранение..." : confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
