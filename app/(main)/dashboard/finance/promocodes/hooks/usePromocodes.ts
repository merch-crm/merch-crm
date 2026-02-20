import { useState } from "react";
import { useRouter } from "next/navigation";
import { Promocode } from "../types";
import {
    togglePromocodeActive,
    deletePromocode,
    createPromocode,
    updatePromocode,
    bulkCreatePromocodes
} from "../actions";
import { formatDate } from "@/lib/formatters";

export function usePromocodes(initialData: Promocode[], currencySymbol: string) {
    const router = useRouter();
    const [data, setData] = useState(initialData);
    const [ui, setUi] = useState({
        isLoading: false,
        searchQuery: "",
        dialogs: {
            isCreateOpen: false,
            isBulkOpen: false,
            deleteId: null as string | null
        },
        editingPromo: null as Promocode | null
    });

    const [filters, setFilters] = useState({
        status: "all",
        type: "all"
    });

    const [form, setForm] = useState({
        name: "",
        code: "",
        isAuto: true,
        discountType: "percentage"
    });

    const [bulk, setBulk] = useState({
        discountType: "percentage"
    });

    const generateCode = (name: string) => {
        return name
            .toUpperCase()
            .replace(/[\s\-_]+/g, "")
            .replace(/[^A-Z0-9А-Я]/gi, "")
            .slice(0, 12);
    };

    const handleNameChange = (val: string) => {
        setForm(prev => {
            const newName = val;
            const newCode = prev.isAuto ? generateCode(val) : prev.code;
            return { ...prev, name: newName, code: newCode };
        });
    };

    const handleCodeChange = (val: string) => {
        const newCode = val.toUpperCase();
        setForm(prev => ({
            ...prev,
            code: newCode,
            isAuto: newCode === "" || newCode === generateCode(prev.name)
        }));
    };

    const handleToggle = async (id: string, current: boolean) => {
        const res = await togglePromocodeActive(id, !current);
        if (res.success) {
            setData(prev => prev.map(p => p.id === id ? { ...p, isActive: !current } : p));
        }
    };

    const handleDelete = (id: string) => {
        setUi(prev => ({ ...prev, dialogs: { ...prev.dialogs, deleteId: id } }));
    };

    const confirmDelete = async () => {
        if (!ui.dialogs.deleteId) return;
        const deletedId = ui.dialogs.deleteId;
        const res = await deletePromocode(deletedId);
        setUi(prev => ({ ...prev, dialogs: { ...prev.dialogs, deleteId: null } }));
        if (res.success) {
            setData(prev => prev.filter(p => p.id !== deletedId));
        }
    };

    const handleOpenEdit = (promo: Promocode) => {
        setUi(prev => ({
            ...prev,
            editingPromo: promo,
            dialogs: { ...prev.dialogs, isCreateOpen: true }
        }));
        setForm({
            name: promo.name || "",
            code: promo.code,
            isAuto: false,
            discountType: promo.discountType === 'fixed_amount' ? 'fixed' : promo.discountType
        });
    };

    const handleOpenCreate = () => {
        setUi(prev => ({
            ...prev,
            editingPromo: null,
            dialogs: { ...prev.dialogs, isCreateOpen: true }
        }));
        setForm({
            name: "",
            code: "",
            isAuto: true,
            discountType: "percentage"
        });
    };

    const filteredData = data?.filter(p => {
        const matchesSearch = p.code?.toLowerCase().includes(ui.searchQuery.toLowerCase()) ||
            (p.name && p.name.toLowerCase().includes(ui.searchQuery.toLowerCase()));

        const matchesStatus = filters.status === "all" ||
            (filters.status === "active" ? p.isActive : !p.isActive);

        const matchesType = filters.type === "all" || p.discountType === filters.type;

        return matchesSearch && matchesStatus && matchesType;
    }) || [];

    const handleExport = () => {
        const headers = ["Название", "Код", "Тип", "Значение", "Активен", "Использовано", "Лимит", `Сэкономлено (${currencySymbol})`, "Истекает", "Комментарий"];
        const rows = filteredData.map(p => [
            p.name || "",
            p.code,
            p.discountType,
            p.value,
            p.isActive ? "Да" : "Нет",
            p.usageCount,
            p.usageLimit || "∞",
            p.totalSaved,
            p.expiresAt ? formatDate(p.expiresAt, "dd.MM.yyyy") : "Бессрочно",
            p.adminComment || ""
        ]);

        const csvContent = [
            headers.join(","),
            ...(rows?.map(r => r.map(cell => `"${cell}"`).join(",")) || [])
        ].join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `promocodes_export_${formatDate(new Date(), "yyyy-MM-dd")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFormSubmit = async (formData: FormData) => {
        setUi(prev => ({ ...prev, isLoading: true }));
        const values = {
            name: formData.get("name") as string,
            code: (formData.get("code") as string).toUpperCase(),
            discountType: formData.get("discountType") as "percentage" | "fixed" | "free_shipping" | "gift",
            value: Number(formData.get("value")),
            minOrderAmount: Number(formData.get("minOrderAmount")),
            usageLimit: formData.get("usageLimit")?.toString(),
            expiresAt: formData.get("expiresAt")?.toString() || null,
            adminComment: formData.get("adminComment") as string
        };

        const res = ui.editingPromo
            ? await updatePromocode(ui.editingPromo.id, values)
            : await createPromocode(values);

        setUi(prev => ({ ...prev, isLoading: false }));
        if (res.success) {
            setUi(prev => ({ ...prev, dialogs: { ...prev.dialogs, isCreateOpen: false } }));
            router.refresh();
        }
    };

    const handleBulkSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUi(prev => ({ ...prev, isLoading: true }));
        const formData = new FormData(e.currentTarget);

        const count = Number(formData.get("count"));
        const prefix = (formData.get("prefix") as string).toUpperCase();
        const values = {
            name: formData.get("name") as string,
            code: "BULK", // Not used for bulk
            discountType: formData.get("discountType") as "percentage" | "fixed" | "free_shipping" | "gift",
            value: Number(formData.get("value")),
            minOrderAmount: Number(formData.get("minOrderAmount")),
            usageLimit: "1", // One-time use for each bulk code
            expiresAt: formData.get("expiresAt")?.toString() || null,
        };

        const res = await bulkCreatePromocodes(count, prefix, values);
        setUi(prev => ({ ...prev, isLoading: false }));
        if (res.success) {
            setUi(prev => ({ ...prev, dialogs: { ...prev.dialogs, isBulkOpen: false } }));
            router.refresh();
        }
    };

    return {
        data: filteredData,
        ui,
        setUi,
        filters,
        setFilters,
        form,
        setForm,
        bulk,
        setBulk,
        handlers: {
            handleNameChange,
            handleCodeChange,
            handleToggle,
            handleDelete,
            confirmDelete,
            handleOpenEdit,
            handleOpenCreate,
            handleExport,
            handleFormSubmit,
            handleBulkSubmit
        }
    };
}
