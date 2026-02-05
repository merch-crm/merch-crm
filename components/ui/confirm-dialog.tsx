"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    isLoading?: boolean;
    isConfirmDisabled?: boolean;
    children?: React.ReactNode;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Подтвердить",
    cancelText = "Отмена",
    variant = "default",
    isLoading = false,
    isConfirmDisabled = false,
    children
}: ConfirmDialogProps) {
    const isDestructive = variant === "destructive";

    return (
        <ResponsiveModal isOpen={isOpen} onClose={onClose} title={title} showVisualTitle={false}>
            <div className="flex flex-col relative pt-4">
                {/* Header with Icon */}
                <div className="p-6 md:p-8 pb-3 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                        animate={{
                            scale: 1,
                            rotate: 0,
                            opacity: 1,
                            transition: { type: "spring", stiffness: 300, damping: 20 }
                        }}
                        className="relative mb-6"
                    >
                        {/* Pulse background effect */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0, 0.1]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className={cn(
                                "absolute inset-0 rounded-[28px] blur-xl",
                                isDestructive ? "bg-[#ff463c]" : "bg-indigo-500"
                            )}
                        />

                        <div className={cn(
                            "w-16 h-16 rounded-[var(--radius-inner)] flex items-center justify-center relative z-10 shadow-sm transition-colors text-slate-900 border border-slate-200",
                            isDestructive ? "bg-red-50 text-[#ff463c] border-red-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        )}>
                            {isDestructive ? <AlertCircle className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
                        </div>
                    </motion.div>

                    {/* Main Title - Swapped to be below icon */}
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight px-4 text-center">
                        {title}
                    </h3>

                    <p className="mt-2 md:mt-3 text-sm font-medium text-slate-500 leading-relaxed px-6">
                        {description}
                    </p>
                </div>

                {children && (
                    <div className="px-8 pb-3 text-center">
                        {children}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="p-8 pt-4 flex flex-col-reverse sm:flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="hidden lg:inline-flex flex-1 h-11 rounded-[var(--radius-inner)] font-bold text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={isDestructive ? "destructive" : "btn-dark"}
                        onClick={onConfirm}
                        disabled={isLoading || isConfirmDisabled}
                        className={cn(
                            "flex-[1.5] w-full h-11 rounded-[var(--radius-inner)] font-bold text-sm text-white transition-all active:scale-[0.98] border-none shadow-lg",
                            isDestructive ? "btn-destructive shadow-red-500/20" : "btn-dark shadow-black/10"
                        )}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Загрузка</span>
                            </div>
                        ) : confirmText}
                    </Button>
                </div>

                {/* Close Button X (Desktop Only) */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-9 h-9 rounded-[var(--radius-inner)] bg-slate-50 text-slate-300 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all group hover:scale-110 active:scale-95 md:flex hidden"
                >
                    <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                </button>
            </div>
        </ResponsiveModal>
    );
}
