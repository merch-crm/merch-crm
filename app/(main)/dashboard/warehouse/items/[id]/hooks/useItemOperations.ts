import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { InventoryItem, ItemHistoryTransaction, Category, StorageLocation, DialogState } from "@/app/(main)/dashboard/warehouse/types";
import { archiveInventoryItems, restoreInventoryItems, updateInventoryItem, checkDuplicateItem } from "@/app/(main)/dashboard/warehouse/actions";
import { createItemFormData, ItemUploads, ThumbnailSettings } from "@/app/(main)/dashboard/warehouse/items/[id]/utils/form-utils";

interface UseItemOperationsProps {
    item: InventoryItem;
    editData: InventoryItem;
    uploads: ItemUploads;
    thumbSettings: ThumbnailSettings;
    history: ItemHistoryTransaction[];
    categories: Category[];
    storageLocations: StorageLocation[];
    setIsSaving: (loading: boolean) => void;
    setIsEditing: (editing: boolean) => void;
    setEditData: React.Dispatch<React.SetStateAction<InventoryItem>>;
    setDialogs: React.Dispatch<React.SetStateAction<DialogState>>;
    resetUploads: () => void;
    fetchData: () => Promise<void>;
}

export function useItemOperations({
    item,
    editData,
    uploads,
    thumbSettings,
    history,
    categories,
    storageLocations,
    setIsSaving,
    setIsEditing,
    setEditData,
    setDialogs,
    resetUploads,
    fetchData
}: UseItemOperationsProps) {
    const router = useRouter();
    const { toast } = useToast();

    const handleSave = async (forceDuplicate = false) => {
        if (!editData || !uploads || !thumbSettings || !setIsEditing || !resetUploads) {
            console.error("Missing required props for handleSave");
            return;
        }

        setIsSaving(true);
        try {
            // Duplicate Detection
            if (!forceDuplicate && (editData.name !== item.name || editData.sku !== item.sku)) {
                const dup = await checkDuplicateItem(editData.name || "", editData.sku || undefined, item.id);
                if (dup.duplicate) {
                    setDialogs((prev: DialogState) => ({ ...prev, duplicateConfirm: { open: true, item: dup.duplicate as { id: string; name: string; sku: string | null } } }));
                    setIsSaving(false);
                    return;
                }
            }

            const formData = createItemFormData(item, editData, uploads, thumbSettings);

            const res = await updateInventoryItem(item.id, formData);
            if (res.success) {
                toast("Товар успешно обновлен", "success");
                playSound("item_updated");
                setIsEditing(false);
                localStorage.removeItem(`item_draft_${item.id}`);
                if (navigator.vibrate) navigator.vibrate(50);
                await fetchData();
            } else {
                toast(res.error || "Ошибка при обновлении товара", "error");
                playSound("notification_error");
            }
            resetUploads();
            router.refresh();
        } catch (error) {
            console.error("Save error:", error);
            const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
            toast(`Ошибка при сохранении: ${errorMessage}`, "error");
            playSound("notification_error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleArchive = async (reason: string) => {
        setIsSaving(true);
        try {
            const res = await archiveInventoryItems([item.id], reason || "Ручная архивация");
            if (res.success) {
                toast("Товар перемещен в архив", "success");
                playSound("notification_success");
                setDialogs((prev: DialogState) => ({ ...prev, archiveReason: false }));
                await fetchData();
            } else {
                toast(res.error || "Ошибка при архивации", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Ошибка при архивации", "error");
            playSound("notification_error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestore = async () => {
        setIsSaving(true);
        try {
            const res = await restoreInventoryItems([item.id], "Восстановление из архива");
            if (res.success) {
                toast("Товар восстановлен из архива", "success");
                playSound("notification_success");
                await fetchData();
            } else {
                toast(res.error || "Ошибка при восстановлении", "error");
                playSound("notification_error");
            }
        } catch {
            toast("Ошибка при восстановлении", "error");
            playSound("notification_error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (item.quantity > 0) {
            toast("Нельзя архивировать товар с остатком > 0", "error");
            return;
        }
        setDialogs((prev: DialogState) => ({ ...prev, archiveReason: true }));
    };

    const handleDownload = () => {
        toast("Формирование Excel файла...", "info");

        // Prepare CSV content
        const headers = ["ID", "Название", "Артикул (SKU)", "Категория", "Количество", "Ед. изм.", "Себестоимость", "Склад", "Описание"];
        const categoryName = item.category ? item.category.name : (categories.find(c => c.id === item.categoryId)?.name || "");
        const locationName = item.stocks && item.stocks.length > 0 && item.stocks[0]
            ? storageLocations.find(l => l.id === item.stocks![0].storageLocationId)?.name || ""
            : "";

        const row = [
            item.id,
            `"${item.name.replace(/"/g, '""')}"`,
            item.sku || "",
            `"${categoryName.replace(/"/g, '""')}"`,
            item.quantity,
            item.unit,
            item.costPrice || 0,
            `"${locationName.replace(/"/g, '""')}"`,
            `"${(item.description || "").replace(/"/g, '""')}"`
        ];

        const csvContent = "\uFEFF" + headers.join(";") + "\n" + row.join(";");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `item_${item.sku || item.id}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast("Файл загружен", "success");
    };

    const handleExportHistory = () => {
        if (!history || history.length === 0) {
            toast("История пуста", "error");
            return;
        }

        const headers = ["ID", "Дата", "Тип", "Изменение", "Локация", "Причина", "Автор", "Роль"];
        const rows = history.map(h => {
            const typeMap = {
                in: "Приход",
                out: "Расход",
                transfer: "Перемещение",
                attribute_change: "Обновление",
                archive: "Архив",
                restore: "Восстановление"
            };

            return [
                h.id,
                (() => {
                    const d = new Date(h.createdAt);
                    return isNaN(d.getTime()) ? "—" : format(d, "dd.MM.yyyy HH:mm", { locale: ru });
                })(),
                typeMap[h.type as keyof typeof typeMap] || h.type,
                h.changeAmount,
                h.storageLocation?.name || "—",
                h.reason || "—",
                h.creator?.name || "Система",
                (h.creator as { role?: { name?: string } } | null)?.role?.name || (h.creator ? "Оператор" : "Система")
            ].map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(";");
        });

        const csvContent = "\uFEFF" + headers.join(";") + "\n" + rows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `history_${item.sku || item.id}_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast("История операций загружена", "success");
    };

    const handleStartEdit = () => {
        setEditData({
            ...item,
            sku: item.sku || "",
            description: item.description || "",
            attributes: (item.attributes as Record<string, string>) || {},
            categoryId: item.categoryId || "",
            qualityCode: item.qualityCode || "",
            attributeCode: item.attributeCode || "",
            sizeCode: item.sizeCode || "",
            materialCode: item.materialCode || "",
            brandCode: item.brandCode || "",
            thumbnailSettings: item.thumbnailSettings || { zoom: 1, x: 0, y: 0 },
            costPrice: item.costPrice !== null ? Number(item.costPrice) : 0,
            sellingPrice: Number(item.sellingPrice) || 0,
            isArchived: item.isArchived || false,
            materialComposition: item.materialComposition || {},
        });
        setIsEditing(true);
    };

    const handleAttributeChange = (key: string, value: string) => {
        const skuFieldMap: Record<string, string> = {
            'quality': 'qualityCode',
            'brand': 'brandCode',
            'material': 'materialCode',
            'size': 'sizeCode',
            'color': 'attributeCode'
        };

        setEditData((prev) => {
            if (skuFieldMap[key]) {
                const newAttributes = { ...prev.attributes };
                delete (newAttributes as Record<string, string>)[key];

                return {
                    ...prev,
                    [skuFieldMap[key]]: value,
                    attributes: newAttributes
                };
            }

            return {
                ...prev,
                attributes: { ...prev.attributes, [key]: value }
            };
        });
    };

    const handleRemoveAttribute = (key: string) => {
        const skuFieldMap: Record<string, string> = {
            'quality': 'qualityCode',
            'brand': 'brandCode',
            'material': 'materialCode',
            'size': 'sizeCode',
            'color': 'attributeCode'
        };

        setEditData((prev) => {
            if (skuFieldMap[key]) {
                const newAttributes = { ...prev.attributes };
                delete (newAttributes as Record<string, string>)[key];

                return {
                    ...prev,
                    [skuFieldMap[key]]: null,
                    attributes: newAttributes
                };
            }

            const newAttributes = { ...prev.attributes };
            delete (newAttributes as Record<string, string>)[key];
            return {
                ...prev,
                attributes: newAttributes
            };
        });
    };

    return {
        handleSave,
        handleArchive,
        handleRestore,
        handleDelete,
        handleDownload,
        handleExportHistory,
        handleStartEdit,
        handleAttributeChange,
        handleRemoveAttribute
    };
}
