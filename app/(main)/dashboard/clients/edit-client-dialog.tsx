"use client";

import { useEffect, useState } from "react";
import { User, Phone, Mail, MapPin, Loader2, Building2, Link as LinkIcon, MessageSquare } from "lucide-react";
import { updateClient, getManagers } from "./actions/core.actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ClientTypeSwitch } from "./components/client-type-switch";
import { AnimatePresence, motion } from "framer-motion";
import { useDuplicateCheck } from "./hooks/use-duplicate-check";
import { DuplicateWarningBanner } from "./components/duplicate-warning-banner";

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

interface EditClientDialogProps {
    client: ClientData;
    isOpen: boolean;
    onClose: () => void;
}

// Предустановленные источники привлечения
const ACQUISITION_SOURCES = [
    { id: "", title: "Не указан" },
    { id: "Instagram", title: "📸 Instagram" },
    { id: "Telegram", title: "✈️ Telegram" },
    { id: "WhatsApp", title: "💬 WhatsApp" },
    { id: "VK", title: "🔵 VK" },
    { id: "Сайт", title: "🌐 Сайт" },
    { id: "Рекомендация", title: "👥 Рекомендация" },
    { id: "Выставка", title: "🎪 Выставка" },
    { id: "Реклама", title: "📢 Реклама" },
    { id: "Другое", title: "📍 Другое" },
];

export function EditClientDialog({ client, isOpen, onClose }: EditClientDialogProps) {
    const [loading, setLoading] = useState(false);
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const { toast } = useToast();

    // === НОВОЕ: Хук проверки дубликатов ===
    const {
        duplicates,
        checkDuplicates,
        clearDuplicates,
        dismissDuplicates,
        hasDuplicates,
    } = useDuplicateCheck({
        excludeClientId: client.id,
    });

    // Текущие значения полей для проверки дубликатов
    const [form, setForm] = useState({
        clientType: (client.clientType || "b2c") as "b2c" | "b2b",
        acquisitionSource: client.acquisitionSource || "",
        managerId: client.managerId || "",
        phone: client.phone || "",
        email: client.email || "",
        lastName: client.lastName || "",
        firstName: client.firstName || "",
        company: client.company || "",
    });

    const handleFieldChange = (name: string, value: string) => {
        const newForm = { ...form, [name]: value };
        setForm(newForm);

        // Проверяем дубликаты
        const keyFields = ["phone", "email", "lastName", "firstName", "company"];
        if (keyFields.includes(name)) {
            checkDuplicates({
                phone: newForm.phone,
                email: newForm.email,
                lastName: newForm.lastName,
                firstName: newForm.firstName,
                company: form.clientType === "b2b" ? newForm.company : undefined,
            });
        }
    };

    // Синхронизация при смене клиента
    const [prevClient, setPrevClient] = useState(client);
    if (client.id !== prevClient.id) {
        setPrevClient(client);
        setForm({
            clientType: (client.clientType || "b2c") as "b2c" | "b2b",
            acquisitionSource: client.acquisitionSource || "",
            managerId: client.managerId || "",
            phone: client.phone || "",
            email: client.email || "",
            lastName: client.lastName || "",
            firstName: client.firstName || "",
            company: client.company || "",
        });
        clearDuplicates();
    }

    useEffect(() => {
        if (isOpen) {
            getManagers().then(res => {
                if (res.success && res.data) setManagers(res.data);
            });
        }
    }, [isOpen]);

    if (!client) return null;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // === НОВОЕ: Валидация для B2B ===
        const formData = new FormData(e.currentTarget);
        if (form.clientType === "b2b") {
            const company = formData.get("company") as string;
            if (!company || company.trim() === "") {
                toast("Для организации обязательно укажите название компании", "error");
                return;
            }
        }

        setLoading(true);
        // === НОВОЕ: Добавляем clientType в formData ===
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
    }

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Редактировать клиента"
            description="Измените необходимые поля"
            className="max-w-2xl max-h-[90vh]"
        >
            <form onSubmit={handleSubmit} className="flex flex-col h-full bg-white">
                <div className="flex-1 overflow-y-auto p-6 md:p-6 space-y-3 custom-scrollbar">
                    {/* === НОВОЕ: Баннер с дубликатами === */}
                    <AnimatePresence>
                        {hasDuplicates && (
                            <DuplicateWarningBanner
                                duplicates={duplicates}
                                onOpenClient={(id) => window.open(`/dashboard/clients?id=${id}`, "_blank")}
                                onDismiss={dismissDuplicates}
                            />
                        )}
                    </AnimatePresence>

                    {/* === НОВОЕ: Переключатель типа клиента === */}
                    <ClientTypeSwitch
                        value={form.clientType}
                        onChange={(val) => setForm(prev => ({ ...prev, clientType: val as "b2c" | "b2b" }))}
                    />

                    {/* Разделитель */}
                    <div className="border-t border-slate-100 pt-3" />

                    {/* === УСЛОВНОЕ ОТОБРАЖЕНИЕ: Название организации (только для B2B) === */}
                    <AnimatePresence mode="wait">
                        {form.clientType === "b2b" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="space-y-2 pb-3">
                                    <label className="text-sm font-bold text-slate-700 ml-1">
                                        <Building2 className="w-3.5 h-3.5 inline mr-1" />
                                        Название организации <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="company"
                                        value={form.company}
                                        onChange={(e) => handleFieldChange("company", e.target.value)}
                                        required={form.clientType === "b2b"}
                                        placeholder="ООО «Компания»"
                                        className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Name Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <User className="w-3.5 h-3.5 inline mr-1" />
                                {form.clientType === "b2b" ? "Фамилия контактного лица" : "Фамилия"}
                                <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="lastName"
                                value={form.lastName}
                                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                                required
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <User className="w-3.5 h-3.5 inline mr-1" />
                                {form.clientType === "b2b" ? "Имя контактного лица" : "Имя"}
                                <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="firstName"
                                value={form.firstName}
                                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                                required
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                    </div>

                    {/* === УСЛОВНОЕ ОТОБРАЖЕНИЕ: Отчество (только для B2C) === */}
                    <AnimatePresence mode="wait">
                        {form.clientType === "b2c" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">
                                            Отчество
                                        </label>
                                        <Input
                                            type="text"
                                            name="patronymic"
                                            defaultValue={client.patronymic || ""}
                                            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                                        />
                                    </div>
                                    {/* Пустая ячейка для выравнивания сетки */}
                                    <div />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* === Компания для B2C (необязательное поле) === */}
                    <AnimatePresence mode="wait">
                        {form.clientType === "b2c" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">
                                            <Building2 className="w-3.5 h-3.5 inline mr-1" /> Компания
                                        </label>
                                        <Input
                                            type="text"
                                            name="company"
                                            value={form.company}
                                            onChange={(e) => handleFieldChange("company", e.target.value)}
                                            placeholder="Необязательно"
                                            className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                                        />
                                    </div>
                                    <div />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Contact Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <Phone className="w-3.5 h-3.5 inline mr-1" /> Телефон <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={(e) => handleFieldChange("phone", e.target.value)}
                                required
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <Mail className="w-3.5 h-3.5 inline mr-1" /> Email
                            </label>
                            <Input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={(e) => handleFieldChange("email", e.target.value)}
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Telegram
                            </label>
                            <Input
                                type="text"
                                name="telegram"
                                defaultValue={client.telegram || ""}
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                                placeholder="@username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Instagram
                            </label>
                            <Input
                                type="text"
                                name="instagram"
                                defaultValue={client.instagram || ""}
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                                placeholder="insta_link"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <LinkIcon className="w-3.5 h-3.5 inline mr-1" /> Ссылка на соцсеть
                            </label>
                            <Input
                                type="text"
                                name="socialLink"
                                defaultValue={client.socialLink || ""}
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                                placeholder="vk.com/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Источник привлечения
                            </label>
                            <Select
                                name="acquisitionSource"
                                value={form.acquisitionSource}
                                onChange={(val) => setForm(prev => ({ ...prev, acquisitionSource: val }))}
                                options={ACQUISITION_SOURCES}
                                triggerClassName="h-12 bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Менеджер
                            </label>
                            <Select
                                name="managerId"
                                value={form.managerId}
                                onChange={(val) => setForm(prev => ({ ...prev, managerId: val }))}
                                options={[
                                    { id: "", title: "Не назначен" },
                                    ...managers.map(m => ({ id: m.id, title: m.name }))
                                ]}
                                triggerClassName="h-12 bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <MapPin className="w-3.5 h-3.5 inline mr-1" /> Город
                            </label>
                            <Input
                                type="text"
                                name="city"
                                defaultValue={client.city || ""}
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Адрес
                            </label>
                            <Input
                                type="text"
                                name="address"
                                defaultValue={client.address || ""}
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                            <MessageSquare className="w-3.5 h-3.5 inline mr-1" /> Комментарии
                        </label>
                        <textarea
                            name="comments"
                            defaultValue={client.comments || ""}
                            rows={3}
                            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none resize-none"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 md:p-6 pt-3 flex items-center justify-end gap-3 bg-white border-t border-slate-200 mt-auto flex-shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="hidden md:flex h-11 px-8 border border-slate-200 text-slate-600 font-bold rounded-2xl bg-slate-50 hover:bg-white transition-all active:scale-[0.98] shadow-sm items-center justify-center"
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-11 w-full md:w-auto md:px-10 inline-flex items-center justify-center gap-2 rounded-[var(--radius-inner)] border border-transparent btn-dark text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98]"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? "Сохранение..." : "Сохранить изменения"}
                    </Button>
                </div>
            </form>
        </ResponsiveModal>
    );
}
