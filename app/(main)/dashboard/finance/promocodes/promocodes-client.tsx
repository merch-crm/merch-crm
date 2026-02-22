"use client";

import { useBranding } from "@/components/branding-provider";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePromocodes } from "./hooks/usePromocodes";
import { Promocode } from "./types";
import { PromocodesHeader } from "./components/PromocodesHeader";
import { PromocodesFilters } from "./components/PromocodesFilters";
import { PromocodesGrid } from "./components/PromocodesGrid";
import { PromocodeFormModal } from "./components/PromocodeFormModal";
import { PromocodeBulkModal } from "./components/PromocodeBulkModal";

export function PromocodesClient({ initialData }: { initialData: Promocode[] }) {
    const { currencySymbol = "₽" } = useBranding();
    const {
        data,
        ui,
        setUi,
        filters,
        setFilters,
        form,
        setForm,
        bulk,
        setBulk,
        handlers
    } = usePromocodes(initialData, currencySymbol);

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <PromocodesHeader
                searchQuery={ui.searchQuery}
                setSearchQuery={(query) => setUi(prev => ({ ...prev, searchQuery: query }))}
                onOpenBulk={() => setUi(prev => ({ ...prev, dialogs: { ...prev.dialogs, isBulkOpen: true } }))}
                onOpenCreate={handlers.handleOpenCreate}
                onExport={handlers.handleExport}
            />

            <PromocodesFilters
                filters={filters}
                setFilters={setFilters}
                filteredCount={data?.length || 0}
                currencySymbol={currencySymbol}
            />

            <PromocodesGrid
                data={data}
                currencySymbol={currencySymbol}
                onEdit={handlers.handleOpenEdit}
                onToggle={handlers.handleToggle}
                onDelete={handlers.handleDelete}
            />

            <PromocodeFormModal
                isOpen={ui.dialogs.isCreateOpen}
                onClose={() => setUi(prev => ({ ...prev, dialogs: { ...prev.dialogs, isCreateOpen: false } }))}
                isLoading={ui.isLoading}
                editingPromo={ui.editingPromo}
                form={form}
                setForm={setForm}
                handleNameChange={handlers.handleNameChange}
                handleCodeChange={handlers.handleCodeChange}
                onSubmit={handlers.handleFormSubmit}
                currencySymbol={currencySymbol}
            />

            <PromocodeBulkModal
                isOpen={ui.dialogs.isBulkOpen}
                onClose={() => setUi(prev => ({ ...prev, dialogs: { ...prev.dialogs, isBulkOpen: false } }))}
                isLoading={ui.isLoading}
                bulk={bulk}
                setBulk={setBulk}
                onSubmit={handlers.handleBulkSubmit}
                currencySymbol={currencySymbol}
            />

            <ConfirmDialog
                isOpen={!!ui.dialogs.deleteId}
                onClose={() => setUi(prev => ({ ...prev, dialogs: { ...prev.dialogs, deleteId: null } }))}
                onConfirm={handlers.confirmDelete}
                title="Удаление промокода"
                description="Вы уверены, что хотите удалить этот промокод? Это действие нельзя отменить."
                confirmText="Удалить"
                variant="destructive"
            />
        </div>
    );
}

// Re-export type to avoid breaking imports in other files
export type { Promocode } from "./types";
