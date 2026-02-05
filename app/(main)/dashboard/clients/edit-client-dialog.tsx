"use client";

import { useEffect, useState } from "react";
import { X, User, Phone, Mail, MapPin, Loader2, Building2, Link as LinkIcon, MessageSquare } from "lucide-react";
import { updateClient, getManagers } from "./actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";

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

    useEffect(() => {
        if (isOpen) {
            getManagers().then(res => {
                if (res.data) setManagers(res.data);
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    if (!isOpen || !client) return null;

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" data-dialog-open="true">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-200">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-normal">Редактировать клиента</h3>
                        <p className="text-sm text-slate-700 font-medium">Измените необходимые поля</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[18px] bg-slate-50 hover:bg-white transition-all shadow-sm"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form action={handleSubmit} className="p-8 pt-6 space-y-6 overflow-y-auto">
                    {/* Name Group */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <User className="w-3.5 h-3.5" /> Фамилия <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                defaultValue={client.lastName}
                                required
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <User className="w-3.5 h-3.5" /> Имя <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                defaultValue={client.firstName}
                                required
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Отчество
                            </label>
                            <input
                                type="text"
                                name="patronymic"
                                defaultValue={client.patronymic || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <Building2 className="w-3.5 h-3.5" /> Компания
                            </label>
                            <input
                                type="text"
                                name="company"
                                defaultValue={client.company || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Contact Group */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <Phone className="w-3.5 h-3.5" /> Телефон <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="phone"
                                defaultValue={client.phone || ""}
                                required
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <Mail className="w-3.5 h-3.5" /> Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                defaultValue={client.email || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Telegram
                            </label>
                            <input
                                type="text"
                                name="telegram"
                                defaultValue={client.telegram || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                                placeholder="@username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Instagram
                            </label>
                            <input
                                type="text"
                                name="instagram"
                                defaultValue={client.instagram || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                                placeholder="insta_link"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <LinkIcon className="w-3.5 h-3.5" /> Ссылка на соцсеть
                            </label>
                            <input
                                type="text"
                                name="socialLink"
                                defaultValue={client.socialLink || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                                placeholder="vk.com/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Источник
                            </label>
                            <select
                                name="acquisitionSource"
                                defaultValue={client.acquisitionSource || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Не указан</option>
                                <option value="instagram">Instagram</option>
                                <option value="website">Сайт</option>
                                <option value="recommendation">Рекомендация</option>
                                <option value="other">Другое</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Менеджер
                            </label>
                            <select
                                name="managerId"
                                defaultValue={client.managerId || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none appearance-none cursor-pointer"
                            >
                                <option value="">Не назначен</option>
                                {managers.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                <MapPin className="w-3.5 h-3.5" /> Город
                            </label>
                            <input
                                type="text"
                                name="city"
                                defaultValue={client.city || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">
                                Адрес
                            </label>
                            <input
                                type="text"
                                name="address"
                                defaultValue={client.address || ""}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">
                            <MessageSquare className="w-3.5 h-3.5" /> Комментарии
                        </label>
                        <textarea
                            name="comments"
                            defaultValue={client.comments || ""}
                            rows={3}
                            className="w-full p-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary transition-all outline-none resize-none"
                        />
                    </div>

                    <div className="sticky bottom-0 z-20 p-8 pt-4 flex items-center justify-end gap-3 bg-white border-t border-slate-200 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="hidden md:flex h-11 px-8 border border-slate-200 text-slate-600 font-bold rounded-[18px] bg-slate-50 hover:bg-white transition-all active:scale-[0.98] shadow-sm items-center justify-center"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-11 w-full md:w-auto md:px-10 inline-flex items-center justify-center gap-2 rounded-[var(--radius-inner)] border border-transparent btn-dark text-sm font-bold text-white shadow-xl transition-all active:scale-[0.98]"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {loading ? "Сохранение..." : "Сохранить изменения"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
