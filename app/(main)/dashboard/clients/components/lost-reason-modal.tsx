"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    XCircle,
    DollarSign,
    Clock,
    ThumbsDown,
    Users,
    HelpCircle,
    Building2,
    Ban,
    Check
} from "lucide-react";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface LostReasonModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string, comment?: string) => Promise<void> | void;
}

const lostReasons = [
    { key: "price", label: "Не устроила цена", icon: DollarSign, color: "text-red-500", bgColor: "bg-red-50" },
    { key: "timing", label: "Не устроили сроки", icon: Clock, color: "text-orange-500", bgColor: "bg-orange-50" },
    { key: "quality", label: "Не устроило качество", icon: ThumbsDown, color: "text-amber-500", bgColor: "bg-amber-50" },
    { key: "competitor", label: "Ушёл к конкуренту", icon: Users, color: "text-blue-500", bgColor: "bg-blue-50" },
    { key: "no_need", label: "Отпала потребность", icon: Ban, color: "text-slate-500", bgColor: "bg-slate-50" },
    { key: "company_closed", label: "Компания закрылась", icon: Building2, color: "text-purple-500", bgColor: "bg-purple-50" },
    { key: "other", label: "Другое", icon: HelpCircle, color: "text-slate-400", bgColor: "bg-slate-50" },
];

export function LostReasonModal({ open, onClose, onConfirm }: LostReasonModalProps) {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!selectedReason) return;

        setIsSubmitting(true);
        try {
            await onConfirm(selectedReason, comment || undefined);
            setSelectedReason(null);
            setComment("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedReason(null);
        setComment("");
        onClose();
    };

    return (
        <ResponsiveModal
            isOpen={open}
            onClose={handleClose}
            title="Причина потери клиента"
            description="Укажите причину, чтобы анализировать причины оттока"
        >
            <div className="space-y-3 py-2">
                {/* Причины */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lostReasons.map((reason) => {
                        const Icon = reason.icon;
                        const isSelected = selectedReason === reason.key;

                        return (
                            <motion.button
                                key={reason.key}
                                onClick={() => setSelectedReason(reason.key)}
                                className={cn(
                                    "relative flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all group overflow-hidden",
                                    isSelected
                                        ? "border-red-500 bg-red-50/50"
                                        : "border-slate-100 bg-white hover:border-slate-200"
                                )}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                        isSelected ? "bg-red-100" : reason.bgColor
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isSelected ? "text-red-600" : reason.color)} />
                                </div>
                                <span
                                    className={cn(
                                        "font-bold text-sm ",
                                        isSelected ? "text-red-900" : "text-slate-700"
                                    )}
                                >
                                    {reason.label}
                                </span>

                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm"
                                    >
                                        <Check className="w-3 h-3 text-white stroke-[3px]" />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Комментарий */}
                <div className="space-y-3">
                    <label className="text-xs font-bold  text-slate-400 px-1">
                        Комментарий (необязательно)
                    </label>
                    <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Опишите ситуацию подробнее..."
                        rows={3}
                        className="rounded-2xl border-slate-200 focus:border-red-200 focus:ring-red-100/50 resize-none transition-all placeholder:text-slate-300"
                    />
                </div>

                {/* Действия */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedReason || isSubmitting}
                        className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-700 font-bold shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <Clock className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Подтвердить
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}
