"use client";

import { useState, useMemo, useEffect } from "react";
import { Transaction } from "../history-types";
import { deleteInventoryTransactions } from "../history-actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { sentence } from "@/lib/pluralize";

export type FilterType = "all" | "in" | "out" | "transfer" | "other";

interface UseHistoryTableProps {
    transactions: Transaction[];
}

export function useHistoryTable({ transactions }: UseHistoryTableProps) {
    const { toast } = useToast();
    const [mounted, setMounted] = useState(false);

    // UI State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

    const itemsPerPage = 10;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesFilter = activeFilter === "all"
                ? true
                : activeFilter === "in"
                    ? ["in", "stock_in"].includes(t.type)
                    : activeFilter === "out"
                        ? ["out", "stock_out"].includes(t.type)
                        : activeFilter === "other"
                            ? ["archive", "restore", "attribute_change", "adjustment"].includes(t.type)
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
    }, [transactions, activeFilter, searchQuery]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
    const isAllSelected = currentItems.length > 0 && currentItems.every(t => selectedIds.includes(t.id));

    // Handlers
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
                // Refresh logic usually handled by re-fetching or optimistic update, 
                // but since data comes from prop, parent needs to refresh or router.refresh() 
                // assuming parent component handles router refresh on success implicitly or explicitly.
                // In current implementation, we are just returning success. 
                // However, the original component didn't explicitly call router.refresh() inside `confirmDeleteItems`. 
                // It seems `deleteInventoryTransactions` is a server action that revalidates path.
            } else {
                toast(res.error || "Ошибка при удалении", "error");
                playSound("notification_error");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const resetFilters = () => {
        setSearchQuery("");
        setCurrentPage(1);
    };

    return {
        state: {
            mounted,
            selectedIds,
            isDeleting,
            isDeleteDialogOpen,
            currentPage,
            searchQuery,
            activeFilter,
            expandedId,
            isMobileSearchExpanded,
            filteredTransactions,
            currentItems,
            isAllSelected,
            itemsPerPage
        },
        actions: {
            setSelectedIds,
            setIsDeleteDialogOpen,
            setCurrentPage,
            setSearchQuery,
            setActiveFilter,
            setExpandedId,
            setIsMobileSearchExpanded,
            handleSelectAll,
            handleSelectRow,
            handleDeleteSelected,
            confirmDeleteItems,
            resetFilters,
            handleExportSelected: async () => {
                if (selectedIds.length === 0) {
                    toast("Не выбраны записи для экспорта", "warning");
                    return;
                }

                toast("Подготовка данных для экспорта...", "info");

                // Simulate a small delay for better UX
                await new Promise(resolve => setTimeout(resolve, 300));

                const transactionsToExport = transactions.filter(t => selectedIds.includes(t.id));

                // Dynamically import exportToCSV to avoid polluting the file top if the import path gets messy. Actually better to just use dynamic import for this util because the file doesn't have it imported.
                const { exportToCSV } = await import("@/lib/export-utils");

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

                playSound("notification_success");
                toast("Экспорт завершен", "success");
            }
        }
    };
}
