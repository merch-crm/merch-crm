"use client";

import { useState } from "react";
import { useHistoryTable } from "./hooks/useHistoryTable";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { formatPlural } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { History } from "lucide-react";

import { HistoryToolbar } from "./components/HistoryToolbar";
import { HistorySelectionBar } from "./components/HistorySelectionBar";
import { HistoryDisplay } from "./components/HistoryDisplay";

import { type Transaction } from "./history-types";

interface HistoryTableProps {
    transactions: Transaction[];
    isAdmin: boolean;
}

export function HistoryTable({ transactions, isAdmin }: HistoryTableProps) {
    const { state, actions } = useHistoryTable({ transactions });
    const {
        mounted,
        searchQuery,
        activeFilter,
        currentItems,
        currentPage,
        selectedIds,
        isAllSelected,
        isDeleting,
        isDeleteDialogOpen: showDeleteConfirm,
        expandedId,
        itemsPerPage,
        filteredTransactions
    } = state;

    const {
        setSearchQuery,
        setActiveFilter,
        setCurrentPage,
        setSelectedIds,
        setExpandedId,
        handleSelectAll,
        handleSelectRow,
        setIsDeleteDialogOpen: setShowDeleteConfirm,
        confirmDeleteItems: confirmDelete
    } = actions;

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
    const { toast } = useToast();

    if (!mounted) {
        return <div className="min-h-[400px]" data-testid="history-container" />;
    }

    if (transactions.length === 0) {
        return (
            <EmptyState
                icon={History}
                title="История операций пуста"
                description="Все действия с товарами на складе будут отображаться здесь."
                className="py-24"
            />
        );
    }

    const handleExportSelected = () => {
        toast("Экспорт будет доступен в следующем обновлении", "info");
    };

    return (
        <div className="space-y-3 relative pb-0" data-testid="history-container">
            <HistoryToolbar
                isMobileSearchExpanded={isMobileSearchExpanded}
                setIsMobileSearchExpanded={setIsMobileSearchExpanded}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setCurrentPage={setCurrentPage}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
            />

            <HistorySelectionBar
                mounted={mounted}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                isAdmin={isAdmin}
                handleExportSelected={handleExportSelected}
                handleDeleteSelected={() => setShowDeleteConfirm(true)}
            />

            {/* Adaptive Data Display */}
            <HistoryDisplay
                currentItems={currentItems}
                selectedIds={selectedIds}
                isAllSelected={isAllSelected}
                handleSelectAll={handleSelectAll}
                handleSelectRow={handleSelectRow}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
                    <div className="text-[13px] font-bold text-slate-400 order-2 sm:order-1">
                        Показано <span className="text-slate-900">{currentItems.length}</span> из <span className="text-slate-900">{transactions.length}</span> записей
                    </div>
                    <div className="order-1 sm:order-2">
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredTransactions.length}
                            pageSize={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="УДАЛИТЬ ЗАПИСИ ИЗ ИСТОРИИ?"
                description={`Вы уверены, что хотите безвозвратно удалить ${selectedIds.length} выбр. ${formatPlural(selectedIds.length, ["запись", "записи", "записей"])}? Это действие нельзя отменить.`}
                confirmText="Удалить"
                variant="destructive"
            />
        </div>
    );
}
