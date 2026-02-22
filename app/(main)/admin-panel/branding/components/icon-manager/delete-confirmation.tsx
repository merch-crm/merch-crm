"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    title?: string;
    description?: string;
}

export function DeleteConfirmation({
    isOpen,
    onClose,
    onConfirm,
    isDeleting = false,
    title = "Удалить категорию?",
    description = "Вы уверены, что хотите удалить эту категорию? Это действие нельзя будет отменить."
}: DeleteConfirmationProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-[var(--radius-outer)] shadow-2xl max-w-sm w-full p-6 border border-slate-100"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-500 font-medium mb-8">
                                {description}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full rounded-xl font-bold h-12 shadow-lg shadow-red-500/20 border-none text-white"
                                onClick={onConfirm}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Удаление..." : "Удалить"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full rounded-xl font-bold h-12 text-slate-500 border-slate-200"
                                onClick={onClose}
                            >
                                Отмена
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
