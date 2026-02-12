"use client";

import { useEffect, useState } from "react";
import { User, Phone, Mail, MapPin, Loader2, Building2, Link as LinkIcon, MessageSquare } from "lucide-react";
import { updateClient, getManagers } from "./actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumSelect } from "@/components/ui/premium-select";


interface EditClientDialogProps {
    client: {
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
    };
    isOpen: boolean;
    onClose: () => void;
}

export function EditClientDialog({ client, isOpen, onClose }: EditClientDialogProps) {
    const [loading, setLoading] = useState(false);
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const { toast } = useToast();

    const [acquisitionSource, setAcquisitionSource] = useState(client.acquisitionSource || "");
    const [managerId, setManagerId] = useState(client.managerId || "");

    const [prevClient, setPrevClient] = useState(client);
    if (client.id !== prevClient.id) {
        setPrevClient(client);
        setAcquisitionSource(client.acquisitionSource || "");
        setManagerId(client.managerId || "");
    }

    useEffect(() => {
        if (isOpen) {
            getManagers().then(res => {
                if (res.data) setManagers(res.data);
            });
        }
    }, [isOpen]);

    if (!client) return null;

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const res = await updateClient(client.id, formData);
        setLoading(false);
        if (res?.error) {
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
            <form action={handleSubmit} className="flex flex-col h-full bg-white">
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                    {/* Name Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <User className="w-3.5 h-3.5 inline mr-1" /> Фамилия <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="lastName"
                                defaultValue={client.lastName}
                                required
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <User className="w-3.5 h-3.5 inline mr-1" /> Имя <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="firstName"
                                defaultValue={client.firstName}
                                required
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <Building2 className="w-3.5 h-3.5 inline mr-1" /> Компания
                            </label>
                            <Input
                                type="text"
                                name="company"
                                defaultValue={client.company || ""}
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                    </div>

                    {/* Contact Group */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <Phone className="w-3.5 h-3.5 inline mr-1" /> Телефон <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="phone"
                                defaultValue={client.phone || ""}
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
                                defaultValue={client.email || ""}
                                className="w-full h-12 px-4 rounded-2xl border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white transition-all shadow-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                Источник
                            </label>
                            <PremiumSelect
                                name="acquisitionSource"
                                value={acquisitionSource}
                                onChange={setAcquisitionSource}
                                options={[
                                    { id: "", title: "Не указан" },
                                    { id: "instagram", title: "Instagram" },
                                    { id: "website", title: "Сайт" },
                                    { id: "recommendation", title: "Рекомендация" },
                                    { id: "other", title: "Другое" },
                                ]}
                                triggerClassName="h-12 bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Менеджер
                            </label>
                            <PremiumSelect
                                name="managerId"
                                value={managerId}
                                onChange={setManagerId}
                                options={[
                                    { id: "", title: "Не назначен" },
                                    ...managers.map(m => ({ id: m.id, title: m.name }))
                                ]}
                                triggerClassName="h-12 bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="p-6 md:p-8 pt-4 flex items-center justify-end gap-3 bg-white border-t border-slate-200 mt-auto flex-shrink-0">
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
