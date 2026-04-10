"use client";

import { useState } from "react";
import { useHistoryTable } from "./hooks/useHistoryTable";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatPlural } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { History } from "lucide-react";

import { HistoryToolbar } from "./components/history/HistoryToolbar";
import { HistorySelectionBar } from "./components/history/HistorySelectionBar";
import { HistoryDisplay } from "./components/history/HistoryDisplay";

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
    confirmDeleteItems: confirmDelete,
    handleExportSelected
  } = actions;

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  if (!mounted) {
    return <div className="min-h-[400px]" data-testid="history-container" />;
  }

  if (transactions.length === 0) {
    return (
      <div data-testid="history-container">
        <EmptyState icon={History} title="Операций не найдено" description="Все действия с товарами на складе будут отображаться здесь." className="py-24" />
      </div>
    );
  }



  return (
    <div className="crm-card bg-white p-0" data-testid="history-container">
      <div className="flex flex-col gap-0 pb-2">
        <HistoryToolbar isMobileSearchExpanded={isMobileSearchExpanded} setIsMobileSearchExpanded={setIsMobileSearchExpanded} searchQuery={searchQuery} setSearchQuery={setSearchQuery} setCurrentPage={setCurrentPage} activeFilter={activeFilter} setActiveFilter={(val) => setActiveFilter(val)}
        />

        <HistorySelectionBar mounted={mounted} selectedIds={selectedIds} setSelectedIds={setSelectedIds} isAdmin={isAdmin} handleExportSelected={handleExportSelected} handleDeleteSelected={() => setShowDeleteConfirm(true)}
        />
      </div>

      {/* Adaptive Data Display */}
      <div className="pt-2">
        <HistoryDisplay currentItems={currentItems} selectedIds={selectedIds} isAllSelected={isAllSelected} handleSelectAll={handleSelectAll} handleSelectRow={handleSelectRow} expandedId={expandedId} setExpandedId={setExpandedId} />
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 pb-2">
          <div className="text-[13px] font-bold text-slate-400 order-2 sm:order-1">
            Показано <span className="text-slate-900">{currentItems.length}</span> из <span className="text-slate-900">{transactions.length}</span> записей
          </div>
          <div className="order-1 sm:order-2">
            <Pagination currentPage={currentPage} totalItems={filteredTransactions.length} pageSize={itemsPerPage} onPageChange={setCurrentPage} />
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Удалить записи из истории?"
        description={`Вы уверены, что хотите безвозвратно удалить ${selectedIds.length} ${formatPlural(selectedIds.length, ["выбранную запись", "выбранные записи", "выбранных записей"])}? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="destructive"
      />
    </div>
  );
}
