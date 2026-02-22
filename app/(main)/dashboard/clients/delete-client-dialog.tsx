"use client";

import { useState } from "react";
import { deleteClient } from "./actions/core.actions";;
import { Loader2, AlertTriangle } from "lucide-react";
import { playSound } from "@/lib/sounds";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";

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
            if (!result.success) {
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

    if (!client) return null;

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Удалить клиента?"
            description="Это действие нельзя отменить"
            className="max-w-lg"
        >
            <div className="p-6 md:p-6 flex flex-col items-center text-center bg-white">
                <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7" />
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200 w-full text-left">
                    <p className="text-sm font-bold text-slate-700 mb-1">Клиент:</p>
                    <p className="text-lg font-bold text-slate-900">
                        {client.lastName} {client.firstName} {client.patronymic || ""}
                    </p>
                    <p className="text-xs text-red-600 font-bold mt-2">
                        Все данные будут безвозвратно удалены.
                    </p>
                </div>

                {error && (
                    <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-md border border-rose-100 mb-4 font-bold w-full">
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 w-full mt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 md:flex-none border-slate-200"
                    >
                        Отмена
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="flex-1 md:flex-none"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {isLoading ? "Удаление..." : "Удалить"}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    );
}
