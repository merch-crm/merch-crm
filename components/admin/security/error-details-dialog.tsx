import React from "react";
import { cn } from "@/lib/utils";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { translateErrorMessage } from "../utils";
import { SystemError } from "../types";

interface ErrorDetailsDialogProps {
    error: SystemError | null;
    onClose: () => void;
}

export function ErrorDetailsDialog({
    error,
    onClose,
}: ErrorDetailsDialogProps) {
    return (
        <ResponsiveModal
            isOpen={!!error}
            onClose={onClose}
            title="Детали ошибки"
            description="Техническая информация о сбое"
            className="max-w-2xl"
        >
            <div className="space-y-4">
                <div className="space-y-2 px-6">
                    <label className="text-xs font-bold text-slate-400">
                        Сообщение (перевод)
                    </label>
                    <div className="p-4 bg-rose-50 rounded-[18px] border border-rose-100 text-rose-800 font-bold text-sm">
                        {error && translateErrorMessage(error.message)}
                    </div>
                </div>

                <div className="space-y-2 px-6">
                    <label className="text-xs font-bold text-slate-400">
                        Оригинальное сообщение
                    </label>
                    <div className="p-4 bg-slate-50 rounded-[18px] border border-slate-200 font-mono text-xs text-slate-600 break-words whitespace-pre-wrap">
                        {error?.message}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 px-6 pb-6">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">
                            Путь / Метод
                        </label>
                        <div className="font-bold text-slate-700 text-sm">
                            {error?.method || "-"} {error?.path || "-"}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">
                            IP Адрес
                        </label>
                        <div className="font-bold text-slate-700 text-sm">
                            {error?.ipAddress || "Не определен"}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">
                            Критичность
                        </label>
                        <div
                            className={cn(
                                "inline-flex px-2 py-0.5 rounded-[18px] text-xs font-bold tracking-tight",
                                error?.severity === "critical"
                                    ? "bg-rose-100 text-rose-600"
                                    : "bg-amber-100 text-amber-600"
                            )}
                        >
                            {error?.severity === "critical"
                                ? "Критическая"
                                : "Предупреждение"}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">
                            Время возникновения
                        </label>
                        <div className="font-bold text-slate-700 text-sm">
                            {error?.createdAt
                                ? new Date(error.createdAt).toLocaleString(
                                    "ru-RU"
                                )
                                : "-"}
                        </div>
                    </div>
                </div>
            </div>
        </ResponsiveModal>
    );
}
