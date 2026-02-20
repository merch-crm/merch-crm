import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { restoreInventoryItems, deleteInventoryItems } from "../bulk-actions";;
import { pluralize } from "@/lib/pluralize";

export function useArchiveActions() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
    const [password, setPassword] = useState("");

    const updateUrl = useCallback((params: Record<string, string | null>) => {
        const url = new URL(window.location.href);
        Object.entries(params).forEach(([key, value]) => {
            if (value) url.searchParams.set(key, value);
            else url.searchParams.delete(key);
        });
        router.push(url.pathname + url.search);
    }, [router]);

    const handleRestore = async (ids: string[]) => {
        setIsRestoring(true);
        try {
            const res = await restoreInventoryItems(ids, "Восстановление из архива");
            if (res.success) {
                toast(`Восстановлено: ${ids.length} ${pluralize(ids.length, 'позиция', 'позиции', 'позиций')}`, "success");
                playSound("notification_success");
                setSelectedIds([]);
                router.refresh();
            } else {
                toast(res.error || "Ошибка при восстановлении", "error");
                playSound("notification_error");
            }
        } finally {
            setIsRestoring(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        if (!password) {
            toast("Введите пароль для удаления", "error");
            return;
        }
        setIsDeleting(true);
        try {
            const res = await deleteInventoryItems(ids);
            if (res.success) {
                toast(`Удалено: ${ids.length} ${pluralize(ids.length, 'позиция', 'позиции', 'позиций')}`, "success");
                playSound("client_deleted");
                setSelectedIds([]);
                setIdsToDelete([]);
                setPassword("");
                router.refresh();
            } else {
                toast(res.error || "Ошибка при удалении", "error");
                playSound("notification_error");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        state: { searchQuery, selectedIds, isRestoring, isDeleting, idsToDelete, password },
        actions: { setSearchQuery, setSelectedIds, setIdsToDelete, setPassword, updateUrl, handleRestore, handleDelete }
    };
}
