"use client";

import { useState } from "react";
import { Archive, ArchiveRestore, Trash2, Loader2 } from "lucide-react";
import { archiveOrder, deleteOrder } from "../actions";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface OrderActionsProps {
    orderId: string;
    isArchived: boolean;
    canDelete: boolean;
    canArchive: boolean;
}

export default function OrderActions({ orderId, isArchived, canDelete, canArchive }: OrderActionsProps) {
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleArchive = async () => {
        setLoading(true);
        try {
            const res = await archiveOrder(orderId, !isArchived);
            if (res.success) {
                toast(isArchived ? "Заказ восстановлен" : "Заказ архивирован", "success");
                router.refresh();
            } else {
                toast(res.error || "Ошибка", "error");
            }
        } catch {
            toast("Ошибка соединения", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await deleteOrder(orderId);
            if (res.success) {
                toast("Заказ удален", "success");
                router.push("/dashboard/orders");
            } else {
                toast(res.error || "Ошибка", "error");
            }
        } catch {
            toast("Ошибка соединения", "error");
        } finally {
            setLoading(false);
            setShowDeleteDialog(false);
        }
    };

    if (!canArchive && !canDelete) return null;

    return (
        <div className="flex items-center gap-2 sm:gap-3">
            {canArchive && (
                <button
                    onClick={handleArchive}
                    disabled={loading}
                    className="h-10 w-10 sm:h-11 sm:w-auto flex items-center justify-center gap-2 sm:px-6 rounded-full sm:rounded-[18px] bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all font-bold text-xs disabled:opacity-50 active:scale-95"
                    title={isArchived ? "Восстановить" : "В архив"}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isArchived ? (
                        <ArchiveRestore className="w-4 h-4" />
                    ) : (
                        <Archive className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{isArchived ? "Восстановить" : "В архив"}</span>
                </button>
            )}

            {canDelete && (
                <button
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={loading}
                    className="h-10 w-10 sm:h-11 sm:w-auto flex items-center justify-center gap-2 sm:px-8 rounded-full sm:rounded-[18px] btn-destructive group active:scale-95 transition-all"
                    title="Удалить"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Удалить</span>
                </button>
            )}

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                isLoading={loading}
                title="Удалить заказ?"
                description="Это действие нельзя отменить. Заказ будет полностью удален из базы данных, а зарезервированные товары будут возвращены на склад."
                confirmText="Удалить навсегда"
                variant="destructive"
            />
        </div>
    );
}
