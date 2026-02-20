import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { moveInventoryItem } from "../stock-actions";;
import type { InventoryItem } from "../types";
import type { StorageLocation } from "../storage-locations-tab";

interface UseMoveInventoryProps {
    items: InventoryItem[];
    locations: StorageLocation[];
    externalIsOpen?: boolean;
    externalOnClose?: () => void;
    defaultItemId?: string;
}

export function useMoveInventory({ items, locations, externalIsOpen, externalOnClose, defaultItemId }: UseMoveInventoryProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = (val: boolean) => {
        if (externalOnClose && !val) externalOnClose();
        setInternalIsOpen(val);
    };

    const [selectedItemId, setSelectedItemId] = useState(defaultItemId || "");
    const [fromLocationId, setFromLocationId] = useState(() => (locations || [])[0]?.id || "");
    const [toLocationId, setToLocationId] = useState(() => (locations || [])[1]?.id || (locations || [])[0]?.id || "");
    const [quantity, setQuantity] = useState("");
    const [comment, setComment] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("itemId", selectedItemId);
        formData.set("fromLocationId", fromLocationId);
        formData.set("toLocationId", toLocationId);

        const itemId = formData.get("itemId") as string;
        const fromLocId = formData.get("fromLocationId") as string;
        const toLocId = formData.get("toLocationId") as string;
        const qty = parseInt(formData.get("quantity") as string);
        const commentValue = formData.get("comment") as string;

        const newErrors: Record<string, string> = {};

        if (!itemId) newErrors.itemId = "Выберите товар";
        if (!fromLocId) newErrors.fromLocationId = "Выберите склад отправитель";
        if (!toLocId) newErrors.toLocationId = "Выберите склад получатель";
        if (fromLocId && toLocId && fromLocId === toLocId) newErrors.toLocationId = "Склады должны быть разными";

        if (!qty || qty <= 0) {
            newErrors.quantity = "Введите количество";
        } else {
            const item = (items || []).find(i => i.id === itemId);
            if (item && qty > item.quantity) {
                newErrors.quantity = `На складе всего ${item.quantity}`;
            }
        }

        if (!commentValue || commentValue.trim().length < 3) {
            newErrors.comment = "Обязательно укажите причину перемещения";
        }

        if (Object.keys(newErrors).length > 0) {
            setFieldErrors(newErrors);
            return;
        }

        setIsPending(true);
        setFieldErrors({});
        const res = await moveInventoryItem(formData);
        if (!res?.success) {
            toast(res.error || "Ошибка", "error");
        } else {
            setIsOpen(false);
            setQuantity("");
            setComment("");
            toast("Товар перемещен", "success");
            router.refresh();
        }
        setIsPending(false);
    }

    return {
        isOpen, setIsOpen,
        selectedItemId, setSelectedItemId,
        fromLocationId, setFromLocationId,
        toLocationId, setToLocationId,
        quantity, setQuantity,
        comment, setComment,
        fieldErrors, setFieldErrors,
        isPending,
        handleSubmit
    };
}
