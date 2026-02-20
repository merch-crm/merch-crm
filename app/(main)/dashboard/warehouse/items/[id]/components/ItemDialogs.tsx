import { useItemDetail } from "../context/ItemDetailContext";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamic imports for performance with typed props
const AdjustStockDialog = dynamic(() => import("@/app/(main)/dashboard/warehouse/adjust-stock-dialog").then(m => m.AdjustStockDialog));
const TransferItemDialog = dynamic(() => import("../transfer-item-dialog").then(m => m.TransferItemDialog));
const ConfirmDialog = dynamic(() => import("@/components/ui/confirm-dialog").then(m => m.ConfirmDialog));
const ArchiveReasonDialog = dynamic(() => import("@/app/(main)/dashboard/warehouse/components/archive-reason-dialog").then(m => m.ArchiveReasonDialog));
const LabelPrinterDialog = dynamic(() => import("@/app/(main)/dashboard/warehouse/components/LabelPrinterDialog").then(m => m.LabelPrinterDialog));
const QRScanner = dynamic(() => import("@/components/ui/qr-scanner").then(m => m.QRScanner));

export function ItemDialogs() {
    const router = useRouter();
    const {
        item,
        storageLocations,
        stocks,
        adjustType,
        setAdjustType,
        user,
        dialogs,
        setDialogs,
        isSaving,
        fetchData,
        handleArchive,
        handleDelete,
        handleSave,
        handleScan,
        pendingDraft,
        pendingExitAction,
        setEditData,
        handleStartEdit,
        attributeTypes,
        allAttributes
    } = useItemDetail();

    return (
        <>
            <AdjustStockDialog
                item={item}
                locations={storageLocations}
                itemStocks={stocks}
                initialType={(adjustType as "in" | "out") || "in"}
                user={user}
                isOpen={!!adjustType}
                onClose={() => {
                    setAdjustType(null);
                    fetchData();
                    router.refresh();
                }}
            />

            <TransferItemDialog
                item={item}
                locations={storageLocations}
                itemStocks={stocks}
                isOpen={dialogs.transfer}
                onClose={() => {
                    setDialogs(prev => ({ ...prev, transfer: false }));
                    fetchData();
                    router.refresh();
                }}
            />

            <ArchiveReasonDialog
                isOpen={dialogs.archiveReason}
                onClose={() => setDialogs(prev => ({ ...prev, archiveReason: false }))}
                onConfirm={handleArchive}
                isLoading={isSaving}
            />

            <ConfirmDialog
                isOpen={dialogs.deleteConfirm}
                onClose={() => setDialogs(prev => ({ ...prev, deleteConfirm: false }))}
                onConfirm={handleDelete}
                isLoading={isSaving}
                title="АРХИВИРОВАТЬ ТОВАР?"
                description="Товар будет перемещен в архив. Вы сможете восстановить его позже."
            />

            <ConfirmDialog
                isOpen={dialogs.duplicateConfirm.open}
                onClose={() => setDialogs(prev => ({ ...prev, duplicateConfirm: { ...prev.duplicateConfirm, open: false } }))}
                onConfirm={() => {
                    setDialogs(prev => ({ ...prev, duplicateConfirm: { ...prev.duplicateConfirm, open: false } }));
                    handleSave(true);
                }}
                isLoading={isSaving}
                title="ПОХОЖИЙ ТОВАР УЖЕ ЕСТЬ"
                confirmText="Всё равно сохранить"
                cancelText="Отмена"
                description={`Найден товар с похожим названием или SKU: «${dialogs.duplicateConfirm.item?.name}». Вы уверены, что хотите создать/обновить этот товар?`}
            />

            <ConfirmDialog
                isOpen={dialogs.draftConfirm}
                onClose={() => {
                    setDialogs(prev => ({ ...prev, draftConfirm: false }));
                    localStorage.removeItem(`item_draft_${item.id}`);
                }}
                onConfirm={() => {
                    if (pendingDraft) {
                        setEditData(prev => ({ ...prev, ...pendingDraft }));
                        handleStartEdit();
                    }
                    setDialogs(prev => ({ ...prev, draftConfirm: false }));
                    localStorage.removeItem(`item_draft_${item.id}`);
                }}
                title="Восстановление черновика"
                description="Найден черновик с несохраненными изменениями. Восстановить его?"
                confirmText="Восстановить"
            />

            <ConfirmDialog
                isOpen={dialogs.unsavedChanges}
                onClose={() => setDialogs(prev => ({ ...prev, unsavedChanges: false }))}
                onConfirm={() => {
                    pendingExitAction?.();
                    setDialogs(prev => ({ ...prev, unsavedChanges: false }));
                }}
                title="Несохраненные изменения"
                description="У вас есть несохраненные изменения. Выйти без сохранения?"
                confirmText="Выйти без сохранения"
                variant="destructive"
            />

            <QRScanner
                isOpen={dialogs.scanner}
                onClose={() => setDialogs(prev => ({ ...prev, scanner: false }))}
                onResult={handleScan}
            />

            <LabelPrinterDialog
                item={item}
                isOpen={dialogs.label}
                onClose={() => setDialogs(prev => ({ ...prev, label: false }))}
                attributeTypes={attributeTypes}
                allAttributes={allAttributes}
            />
        </>
    );
}
