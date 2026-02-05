"use client";

import { Button } from "@/components/ui/button";
import { Trash2, HelpCircle } from "lucide-react";
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
                            "w-16 h-16 rounded-3xl flex items-center justify-center relative z-10 shadow-sm transition-colors text-slate-900 border",
                            isDestructive ? "bg-rose-50 text-[#ff463c] border-rose-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        )}>
                            {isDestructive ? <Trash2 className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
                        </div>
                    </motion.div>

                    {/* Main Title - Swapped to be below icon */}
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight px-4 text-center">
                        {title}
                    </h3>

                    <p className={cn(
                        "mt-2 md:mt-3 text-[13px] font-bold leading-relaxed px-6",
                        isDestructive ? "text-rose-400" : "text-slate-500"
                    )}>
                        {description}
                    </p>
                </div>

                {children && (
                    <div className="px-8 pb-3 text-center">
                        {children}
                    </div>
                )}

                {/* Footer Actions */}
                <div className={cn(
                    "p-6 md:p-8 pt-2 flex gap-3 shrink-0",
                    isDestructive ? "flex-col md:flex-row items-center" : "flex-row"
                )}>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className={cn(
                            "h-11 rounded-[var(--radius-inner)] font-bold text-sm transition-all w-full",
                            isDestructive
                                ? "text-slate-400 hover:text-slate-600 border-none hover:bg-transparent md:flex-1 md:order-1 md:border md:border-slate-200 md:hover:bg-slate-50 md:text-slate-400"
                                : "flex-1 text-slate-400 hover:text-slate-900 border border-slate-200"
                        )}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={isDestructive ? "destructive" : "btn-dark"}
                        onClick={onConfirm}
                        disabled={isLoading || isConfirmDisabled}
                        className={cn(
                            "h-11 rounded-[var(--radius-inner)] font-bold text-sm text-white transition-all active:scale-[0.98] border-none shadow-lg w-full",
                            isDestructive ? "bg-[#ff463c] hover:bg-[#ff463c]/90 shadow-red-500/20 md:flex-[1.5] order-first md:order-2" : "flex-[1.5] shadow-black/10"
                        )}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2 justify-center w-full">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Загрузка</span>
                            </div>
                        ) : confirmText}
                    </Button>
                </div>

            </div>
        </ResponsiveModal>
    );
}
