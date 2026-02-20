import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { deleteInventoryTransactions } from "../history-actions";;
import { sentence } from "@/lib/pluralize";
import { exportToCSV } from "@/lib/export-utils";
import type { Transaction } from "../history-types";

interface UseHistoryTableProps {
    transactions: Transaction[];
}

export function useHistoryTable({ transactions }: UseHistoryTableProps) {
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<"all" | "in" | "out" | "transfer" | "attribute_change" | "archive">("all");
    const itemsPerPage = 10;
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = activeFilter === "all"
            ? true
            : activeFilter === "archive"
                ? (t.type === "archive" || t.type === "restore")
                : t.type === activeFilter;
        const search = searchQuery.toLowerCase();
        const matchesSearch =
            t.id.toLowerCase().includes(search) ||
            (t.item?.name?.toLowerCase() || "").includes(search) ||
            (t.item?.sku?.toLowerCase() || "").includes(search) ||
            (t.reason?.toLowerCase() || "").includes(search) ||
            (t.creator?.name?.toLowerCase() || "").includes(search);
        return matchesFilter && matchesSearch;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    const isAllSelected = currentItems.length > 0 && currentItems.every(t => selectedIds.includes(t.id));

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(prev => prev.filter(id => !currentItems.some(t => t.id === id)));
        } else {
            const newSelected = currentItems.map(t => t.id);
            setSelectedIds(prev => Array.from(new Set([...prev, ...newSelected])));
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const handleDeleteSelected = () => {
        if (selectedIds.length === 0) return;
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteItems = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteInventoryTransactions(selectedIds);
            if (res.success) {
                toast(sentence(selectedIds.length, 'f', { one: 'Запись удалена', many: 'Записи удалены' }, { one: 'запись', few: 'записи', many: 'записей' }), "success");
                playSound("notification_success");
                setSelectedIds([]);
                setIsDeleteDialogOpen(false);
            } else {
                toast(res.error || "Ошибка при удалении", "error");
                playSound("notification_error");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExportSelected = () => {
        const transactionsToExport = transactions.filter(t => selectedIds.includes(t.id));
        exportToCSV(transactionsToExport, "history_export", [
            { header: "ID", key: "id" },
            { header: "Тип", key: (t) => t.type },
            { header: "Товар", key: (t) => t.item?.name || "Характеристики" },
            { header: "Артикул", key: (t) => t.item?.sku || "" },
            { header: "Количество", key: "changeAmount" },
            { header: "Причина", key: (t) => t.reason || "" },
            { header: "Склад", key: (t) => t.storageLocation?.name || "" },
            { header: "Создал", key: (t) => t.creator?.name || "Система" },
            { header: "Роль", key: (t) => t.creator?.role?.name || (t.creator ? "Оператор" : "Система") },
            { header: "Дата", key: (t) => new Date(t.createdAt) }
        ]);
        toast("Экспорт завершен", "success");
        playSound("notification_success");
    };

    return {
        mounted,
        selectedIds, setSelectedIds,
        isDeleting,
        isDeleteDialogOpen, setIsDeleteDialogOpen,
        currentPage, setCurrentPage,
        searchQuery, setSearchQuery,
        activeFilter, setActiveFilter,
        expandedId, setExpandedId,
        isMobileSearchExpanded, setIsMobileSearchExpanded,
        itemsPerPage,
        filteredTransactions,
        currentItems,
        isAllSelected,
        handleSelectAll,
        handleSelectRow,
        handleDeleteSelected,
        confirmDeleteItems,
        handleExportSelected
    };
}
