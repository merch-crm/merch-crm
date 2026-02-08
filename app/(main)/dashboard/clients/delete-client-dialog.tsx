"use client";

import { useState } from "react";
import { deleteClient } from "./actions";
import { Loader2, AlertTriangle, X } from "lucide-react";
import { playSound } from "@/lib/sounds";

interface DeleteClientDialogProps {
    client: {
        id: string;
        lastName: string;
        firstName: string;
        patronymic?: string | null;
    } | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DeleteClientDialog({ client, isOpen, onClose }: DeleteClientDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        if (!client) return;

        setIsLoading(true);
        setError("");

        try {
            const result = await deleteClient(client.id);
            if (result.error) {
                setError(result.error);
                playSound("notification_error");
            } else {
                playSound("client_deleted");
                onClose();
            }
        } catch {
            setError("Произошла ошибка при удалении");
            playSound("notification_error");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" data-dialog-open="true">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-2xl bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 text-center">
                        <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Удалить клиента?</h3>
                        <p className="text-slate-500 mt-2">Вы действительно хотите удалить данного клиента?</p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200">
                        <p className="text-sm font-bold text-slate-700 mb-1">Клиент:</p>
                        <p className="text-lg font-bold text-slate-900">
                            {client.lastName} {client.firstName} {client.patronymic || ""}
                        </p>
                        <p className="text-xs text-red-600 font-bold mt-2">
                            Это действие нельзя отменить. Все данные клиента будут безвозвратно удалены.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-md border border-rose-100 mb-4 text-center font-bold">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="hidden md:flex h-11 px-8 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-white rounded-2xl transition-all disabled:opacity-50 shadow-sm items-center justify-center"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="h-11 w-full md:w-auto md:px-8 inline-flex justify-center items-center gap-2 bg-red-600 text-white text-sm font-bold rounded-2xl hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isLoading ? "Удаление..." : "Удалить"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
