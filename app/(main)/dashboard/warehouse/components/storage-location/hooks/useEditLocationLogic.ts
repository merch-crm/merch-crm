import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { updateStorageLocation } from "@/app/(main)/dashboard/warehouse/storage-actions";
import { StorageLocation, StorageLocationItem } from "@/app/(main)/dashboard/warehouse/storage-locations-tab";

interface UseEditLocationLogicProps {
    location: StorageLocation;
}

export function useEditLocationLogic({ location }: UseEditLocationLogicProps) {
    const { toast } = useToast();
    const router = useRouter();

    const [ui, setUi] = useState({
        currentPage: 1,
        transferItem: null as StorageLocationItem | null,
        isSaving: false,
        prevId: location.id
    });

    const [form, setForm] = useState({
        name: location.name,
        description: location.description || "",
        address: location.address || "",
        responsibleUserId: location.responsibleUserId || "",
        isDefault: !!location.isDefault,
        isActive: location.isActive ?? true,
        type: location.type || "warehouse" as "warehouse" | "production" | "office"
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [localItems, setLocalItems] = useState<StorageLocationItem[]>(location.items || []);

    // Sync state when location ID changes
    useEffect(() => {
        if (location.id !== ui.prevId) {
            setUi(prev => ({ ...prev, prevId: location.id, currentPage: 1, transferItem: null }));
            setForm({
                name: location.name,
                description: location.description || "",
                address: location.address || "",
                responsibleUserId: location.responsibleUserId || "",
                isDefault: !!location.isDefault,
                isActive: location.isActive ?? true,
                type: location.type || "warehouse"
            });
            setLocalItems(location.items || []);
            setFieldErrors({});
        }
    }, [location.id, location, ui.prevId]);

    async function handleAutoSave(updates: Partial<StorageLocation>) {
        setUi(prev => ({ ...prev, isSaving: true }));
        const formData = new FormData();
        formData.append("name", updates.name ?? form.name);
        formData.append("address", updates.address ?? form.address);
        formData.append("description", updates.description ?? form.description);
        formData.append("responsibleUserId", updates.responsibleUserId ?? form.responsibleUserId);
        formData.append("type", (updates.type as string) ?? form.type);

        if (updates.isDefault !== undefined) {
            if (updates.isDefault) formData.append("isDefault", "on");
        } else if (form.isDefault) {
            formData.append("isDefault", "on");
        }

        if (updates.isActive !== undefined) {
            if (updates.isActive) formData.append("isActive", "on");
        } else if (form.isActive) {
            formData.append("isActive", "on");
        }

        const res = await updateStorageLocation(location.id, formData);

        if (!res?.success) {
            toast(res.error, "error");
            playSound("notification_error");
        }

        setUi(prev => ({ ...prev, isSaving: false }));
        router.refresh();
    }

    const setFormValue = (key: keyof typeof form, value: string | boolean) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const clearFieldError = (key: string) => {
        setFieldErrors(prev => ({ ...prev, [key]: "" }));
    };

    return {
        ui,
        setUi,
        form,
        setForm,
        setFormValue,
        fieldErrors,
        clearFieldError,
        localItems,
        setLocalItems,
        handleAutoSave,
        location
    };
}
