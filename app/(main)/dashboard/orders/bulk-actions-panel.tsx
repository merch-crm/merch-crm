"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    Trash2,
    X,
    Printer,
    FileDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    bulkUpdateOrderStatus,
    bulkUpdateOrderPriority,
    bulkDeleteOrders
} from "./actions";
import { PremiumSelect } from "@/components/ui/premium-select";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { pluralize, sentence } from "@/lib/pluralize";

interface BulkActionsPanelProps {
    selectedIds: string[];
    onClear: () => void;
    isAdmin: boolean;
    onExport?: () => void;
}

export function BulkActionsPanel({ selectedIds, onClear, isAdmin, onExport }: BulkActionsPanelProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (selectedIds.length === 0) return null;

    const handleStatusUpdate = async (status: "new" | "design" | "production" | "done" | "shipped" | "cancelled") => {
        setIsProcessing(true);
        const res = await bulkUpdateOrderStatus(selectedIds, status);
        if (res.success) {
            toast(`Статус обновлен для ${selectedIds.length} ${pluralize(selectedIds.length, 'заказа', 'заказов', 'заказов')}`, "success", { mutation: true });
            onClear();
        } else {
            toast(res.error || "Ошибка при обновлении", "error");
        }
        setIsProcessing(false);
    };

    const handlePriorityUpdate = async (priority: string) => {
        setIsProcessing(true);
        const res = await bulkUpdateOrderPriority(selectedIds, priority);
        if (res.success) {
            toast(`Приоритет обновлен для ${selectedIds.length} ${pluralize(selectedIds.length, 'заказа', 'заказов', 'заказов')}`, "success", { mutation: true });
            onClear();
        } else {
            toast(res.error || "Ошибка при обновлении", "error");
        }
        setIsProcessing(false);
    };

    const handleDelete = async () => {
        setIsProcessing(true);
        try {
            const res = await bulkDeleteOrders(selectedIds);
            if (res.success) {
                toast(sentence(selectedIds.length, 'm', { one: 'Удален', many: 'Удалено' }, { one: 'заказ', few: 'заказа', many: 'заказов' }), "success", { mutation: true });
                onClear();
            } else {
                toast(res.error || "Ошибка при удалении", "error");
            }
        } catch (error) {
            console.error(error);
            toast("Произошла ошибка", "error");
        } finally {
            setIsProcessing(false);
            setShowDeleteConfirm(false);
        }
    };

    // deleted mounted and useEffect from here to preserve hook order


    return (
        <AnimatePresence>
            {selectedIds.length > 0 && mounted && createPortal(
                <>
                    {/* Bottom Progressive Gradient Blur Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-x-0 bottom-0 h-80 pointer-events-none z-[80]"
                        style={{
                            maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                            background: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%)'
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                        exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.8 }}
                        className="fixed bottom-6 sm:bottom-10 left-1/2 z-[110] flex items-center bg-white p-2 sm:p-2.5 px-4 sm:px-8 gap-2 sm:gap-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 max-w-[95vw] sm:max-w-none"
                    >

                        {/* Selection Badge Section */}
                        <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg shadow-primary/20 text-white shrink-0">
                                {selectedIds.length}
                            </div>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 whitespace-nowrap hidden md:inline">Заказов выбрано</span>
                        </div>

                        <div className="w-px h-6 sm:h-8 bg-slate-200 mx-1 sm:mx-2" />

                        {/* Primary Actions Group */}
                        <div className="flex items-center gap-0.5 sm:gap-1">
                            {/* Status Select */}
                            <div className="w-[100px] sm:w-[140px]">
                                <PremiumSelect
                                    value=""
                                    onChange={(val) => handleStatusUpdate(val as "new" | "design" | "production" | "done" | "shipped" | "cancelled")}
                                    options={[
                                        { id: "new", title: "Новый", description: "Только что созданный", color: "text-blue-500" },
                                        { id: "design", title: "Дизайн", description: "Создание макета", color: "text-purple-500" },
                                        { id: "production", title: "Производство", description: "В процессе изготовления", color: "text-amber-500" },
                                        { id: "done", title: "Готов", description: "Ожидает отгрузки", color: "text-emerald-500" },
                                        { id: "shipped", title: "Отправлен", description: "Передан в доставку", color: "text-slate-500" },
                                        { id: "cancelled", title: "Отменен", description: "Заказ аннулирован", color: "text-rose-500" },
                                    ]}
                                    placeholder="Статус"
                                    variant="minimal"
                                    className="!bg-transparent !border-none !text-slate-900"
                                    compact
                                />
                            </div>

                            {/* Priority Select - Hidden on mobile, show on Desktop */}
                            <div className="w-[100px] sm:w-[140px] hidden sm:block">
                                <PremiumSelect
                                    value=""
                                    onChange={(val) => handlePriorityUpdate(val)}
                                    options={[
                                        { id: "high", title: "Срочный", description: "Максимальный приоритет", color: "text-rose-500" },
                                        { id: "normal", title: "Обычный", description: "Стандартный приоритет", color: "text-slate-500" },
                                    ]}
                                    placeholder="Приоритет"
                                    variant="minimal"
                                    className="!bg-transparent !border-none !text-slate-900"
                                    compact
                                />
                            </div>

                            {/* Quick Tools */}
                            <div className="h-6 sm:h-8 w-px bg-slate-200 mx-1 sm:mx-2" />

                            <button
                                title="Печать бланков"
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-all hidden xs:flex"
                                onClick={() => toast(`Печать бланков для ${selectedIds.length} ${pluralize(selectedIds.length, 'заказа', 'заказов', 'заказов')}...`, "info")}
                            >
                                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>

                            <button
                                title="Экспорт в Excel"
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-all"
                                onClick={onExport}
                            >
                                <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>

                            {isAdmin && (
                                <button
                                    title="Удалить выбранные"
                                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-slate-400 btn-destructive-ghost"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isProcessing}
                                >
                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                            )}

                            <div className="h-6 sm:h-8 w-px bg-slate-200 mx-1 sm:mx-2" />

                            <button
                                onClick={onClear}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
                                disabled={isProcessing}
                            >
                                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                        </div>

                        <ConfirmDialog
                            isOpen={showDeleteConfirm}
                            onClose={() => setShowDeleteConfirm(false)}
                            onConfirm={handleDelete}
                            title={`Удаление ${pluralize(selectedIds.length, 'заказа', 'заказов', 'заказов')}`}
                            description={`Вы уверены, что хотите удалить ${pluralize(selectedIds.length, 'выбранный заказ', 'выбранные заказа', 'выбранные заказов')} (${selectedIds.length})? Это действие необратимо.`}
                            confirmText="Удалить"
                            variant="destructive"
                            isLoading={isProcessing}
                        />
                    </motion.div>
                </>,
                document.body
            )}
        </AnimatePresence>
    );
}
