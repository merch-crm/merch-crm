"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ExternalLink, UserCheck, Phone, Mail, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { cn } from "@/lib/utils";

interface DuplicateClient {
    id: string;
    firstName: string;
    lastName: string;
    patronymic?: string | null;
    company?: string | null;
    phone: string;
    email?: string | null;
    clientType?: "b2c" | "b2b" | null;
}

interface DuplicateWarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    onIgnore: () => void;
    onOpenClient: (clientId: string) => void;
    duplicates: DuplicateClient[];
    isLoading?: boolean;
}

export const DuplicateWarningModal = memo(function DuplicateWarningModal({
    isOpen,
    onClose,
    onIgnore,
    onOpenClient,
    duplicates,
    isLoading = false,
}: DuplicateWarningModalProps) {
    if (duplicates.length === 0) return null;

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            className="max-w-lg"
        >
            <div className="p-6 space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Найдены похожие клиенты
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            В базе уже есть {duplicates.length} {duplicates.length === 1 ? "клиент" : duplicates.length < 5 ? "клиента" : "клиентов"} с похожими данными.
                            Возможно, вы хотите открыть существующую карточку?
                        </p>
                    </div>
                </div>

                {/* Duplicates List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {duplicates.map((dup, index) => (
                        <motion.div
                            key={dup.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative p-4 rounded-2xl border-2 border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer"
                            onClick={() => onOpenClient(dup.id)}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    {/* Name and Type */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                            dup.clientType === "b2b"
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-emerald-100 text-emerald-600"
                                        )}>
                                            {dup.clientType === "b2b"
                                                ? <Building2 className="w-4 h-4" />
                                                : <UserCheck className="w-4 h-4" />
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900 truncate">
                                                {dup.lastName} {dup.firstName} {dup.patronymic || ""}
                                            </p>
                                            {dup.company && (
                                                <p className="text-xs text-slate-500 truncate">
                                                    {dup.company}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="flex flex-wrap gap-3 text-xs">
                                        {dup.phone && (
                                            <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                                <Phone className="w-3 h-3" />
                                                {dup.phone}
                                            </span>
                                        )}
                                        {dup.email && (
                                            <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                                                <Mail className="w-3 h-3" />
                                                {dup.email}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Open Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0 h-8 px-3 rounded-lg text-xs font-bold text-slate-400 group-hover:text-primary group-hover:bg-white transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenClient(dup.id);
                                    }}
                                >
                                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                                    Открыть
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-11 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    >
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        onClick={onIgnore}
                        disabled={isLoading}
                        className="flex-1 h-11 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white border-none"
                    >
                        {isLoading ? "Создание..." : "Всё равно создать"}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
});
