import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-[32px] border-none bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] [&>button:last-child]:hidden">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col"
                        >
                            {/* Header with Icon */}
                            <div className="p-8 pb-3 flex flex-col items-center text-center">
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
                                            isDestructive ? "bg-rose-500" : "bg-primary"
                                        )}
                                    />

                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={cn(
                                            "w-16 h-16 rounded-[22px] flex items-center justify-center relative z-10 shadow-sm transition-colors",
                                            isDestructive ? "bg-rose-50 text-rose-500" : "bg-primary/5 text-primary"
                                        )}
                                    >
                                        {isDestructive ? <AlertCircle className="w-8 h-8" /> : <HelpCircle className="w-8 h-8" />}
                                    </motion.div>
                                </motion.div>

                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{
                                        y: 0,
                                        opacity: 1,
                                    }}
                                >
                                    <DialogTitle className="text-xl font-black text-slate-900 tracking-tight leading-tight px-4 text-center">
                                        {title}
                                    </DialogTitle>
                                </motion.div>

                                <motion.p
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{
                                        y: 0,
                                        opacity: 1,
                                    }}
                                    className="mt-3 text-[14px] font-bold text-slate-400 leading-relaxed px-6"
                                >
                                    {description}
                                </motion.p>
                            </div>

                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{
                                    y: 0,
                                    opacity: 1,
                                }}
                                className="px-8 pb-3"
                            >
                                {children}
                            </motion.div>

                            {/* Footer Actions */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{
                                    y: 0,
                                    opacity: 1,
                                }}
                                className="p-8 pt-4 flex flex-col sm:flex-row gap-3"
                            >
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="flex-1 h-12 rounded-full font-black text-[13px] text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    disabled={isLoading || isConfirmDisabled}
                                    className={cn(
                                        "flex-[1.5] h-12 rounded-full font-black text-[13px] text-white transition-all active:scale-95 shadow-xl border-none",
                                        isDestructive
                                            ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/25"
                                            : "bg-primary hover:brightness-110 shadow-primary/25"
                                    )}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Загрузка</span>
                                        </div>
                                    ) : confirmText}
                                </Button>
                            </motion.div>

                            {/* Close Button X */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={onClose}
                                className="absolute top-5 right-5 w-9 h-9 rounded-2xl bg-slate-50 text-slate-300 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-all group"
                            >
                                <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
