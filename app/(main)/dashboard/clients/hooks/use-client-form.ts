import { useState, useCallback } from "react";
import { updateClient } from "../actions/core.actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { useDuplicateCheck } from "./use-duplicate-check";

interface ClientData {
    id: string;
    lastName: string;
    firstName: string;
    patronymic?: string | null;
    company?: string | null;
    phone?: string | null;
    telegram?: string | null;
    instagram?: string | null;
    email?: string | null;
    city?: string | null;
    address?: string | null;
    comments?: string | null;
    socialLink?: string | null;
    acquisitionSource?: string | null;
    managerId?: string | null;
    clientType?: "b2c" | "b2b" | null;
}

export function useClientForm(client: ClientData, onClose: () => void) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const {
        duplicates,
        checkDuplicates,
        clearDuplicates,
        dismissDuplicates,
        hasDuplicates,
    } = useDuplicateCheck({
        excludeClientId: client.id,
    });

    const [form, setForm] = useState({
        clientType: (client.clientType || "b2c") as "b2c" | "b2b",
        acquisitionSource: client.acquisitionSource || "",
        managerId: client.managerId || "",
        phone: client.phone || "",
        email: client.email || "",
        lastName: client.lastName || "",
        firstName: client.firstName || "",
        company: client.company || "",
        city: client.city || "",
        address: client.address || "",
        comments: client.comments || "",
        telegram: client.telegram || "",
        instagram: client.instagram || "",
        socialLink: client.socialLink || "",
    });

    const handleFieldChange = useCallback((name: string, value: string) => {
        setForm(prev => {
            const newForm = { ...prev, [name]: value };
            
            // Проверяем дубликаты
            const keyFields = ["phone", "email", "lastName", "firstName", "company"];
            if (keyFields.includes(name)) {
                checkDuplicates({
                    phone: newForm.phone,
                    email: newForm.email,
                    lastName: newForm.lastName,
                    firstName: newForm.firstName,
                    company: newForm.clientType === "b2b" ? newForm.company : undefined,
                });
            }
            return newForm;
        });
    }, [checkDuplicates]);

    const resetForm = useCallback((newClient: ClientData) => {
        setForm({
            clientType: (newClient.clientType || "b2c") as "b2c" | "b2b",
            acquisitionSource: newClient.acquisitionSource || "",
            managerId: newClient.managerId || "",
            phone: newClient.phone || "",
            email: newClient.email || "",
            lastName: newClient.lastName || "",
            firstName: newClient.firstName || "",
            company: newClient.company || "",
            city: newClient.city || "",
            address: newClient.address || "",
            comments: newClient.comments || "",
            telegram: newClient.telegram || "",
            instagram: newClient.instagram || "",
            socialLink: newClient.socialLink || "",
        });
        clearDuplicates();
    }, [clearDuplicates]);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (form.clientType === "b2b" && (!form.company || form.company.trim() === "")) {
            toast("Для организации обязательно укажите название компании", "error");
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.set("clientType", form.clientType);

        const res = await updateClient(client.id, formData);
        setLoading(false);

        if (!res.success) {
            toast(res.error, "error");
            playSound("notification_error");
        } else {
            toast("Данные клиента обновлены", "success");
            playSound("client_updated");
            onClose();
        }
    }, [client.id, form, onClose, toast]);

    return {
        form,
        setForm,
        loading,
        duplicates,
        hasDuplicates,
        dismissDuplicates,
        handleFieldChange,
        handleSubmit,
        resetForm
    };
}
