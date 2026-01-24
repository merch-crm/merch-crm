"use client";

import { useEffect, useState } from "react";
import { Plus, X, User, Phone, Mail, Building2, MapPin, MessageSquare, Link as LinkIcon } from "lucide-react";
import { addClient, getManagers, checkClientDuplicates } from "./actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface DuplicateClient {
    id: string;
    lastName: string;
    firstName: string;
    phone: string;
}

export function AddClientDialog({ variant = "default" }: { variant?: "default" | "minimal" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const [clientType, setClientType] = useState<"b2c" | "b2b">("b2c");
    const [duplicates, setDuplicates] = useState<DuplicateClient[]>([]);
    const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            getManagers().then(res => {
                if (res.data) setManagers(res.data);
            });
        }
    }, [isOpen]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        if (ignoreDuplicates) {
            formData.append("ignoreDuplicates", "true");
        }
        const res = await addClient(formData);
        setLoading(false);
        if (res?.error) {
            if (res.duplicates) {
                setDuplicates(res.duplicates);
                toast("Найдены похожие клиенты", "warning");
            } else {
                toast(res.error, "error");
            }
        } else {
            toast("Клиент успешно добавлен", "success");
            setIsOpen(false);
            setDuplicates([]);
            setIgnoreDuplicates(false);
        }
    }

    const checkDuplicates = async (data: { phone?: string, email?: string, lastName?: string, firstName?: string }) => {
        const res = await checkClientDuplicates(data);
        if (res.data) {
            setDuplicates(res.data as DuplicateClient[]);
        }
    };

    // Simple debounce for inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const form = e.target.form;
        if (!form) return;

        const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value;
        const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value;
        const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;

        if (phone.length > 5 || email.length > 5 || (lastName.length > 2 && firstName.length > 2)) {
            checkDuplicates({ phone, email, lastName, firstName });
        } else {
            setDuplicates([]);
        }
    };

    if (!isOpen) {
        if (variant === "minimal") {
            return (
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-[10px] font-bold text-#5d00ff hover:text-indigo-700  tracking-wider flex items-center transition-colors px-2 py-1 hover:bg-indigo-50 rounded-[18px]"
                >
                    <Plus className="mr-1 h-3 w-3" /> Создать
                </button>
            );
        }
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="h-12 bg-#5d00ff hover:bg-indigo-700 text-white rounded-[18px] px-6 gap-2 font-bold shadow-xl shadow-indigo-200 transition-all active:scale-95 inline-flex items-center"
            >
                <Plus className="w-5 h-5" />
                Добавить клиента
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsOpen(false)}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Новый клиент</h3>
                        <p className="text-sm text-slate-500 font-medium">Заполните данные для CRM</p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-[18px] bg-slate-50 hover:bg-slate-100 transition-all"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form action={handleSubmit} className="p-8 pt-6 space-y-6 overflow-y-auto">
                    {/* Client Type Toggle */}
                    <div className="flex p-1 bg-slate-100 rounded-[var(--radius)]">
                        <button
                            type="button"
                            onClick={() => setClientType("b2c")}
                            className={cn(
                                "flex-1 py-3 text-[11px] font-bold  tracking-normal rounded-[var(--radius)] transition-all",
                                clientType === "b2c" ? "bg-white text-#5d00ff shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            Физическое лицо (B2C)
                        </button>
                        <button
                            type="button"
                            onClick={() => setClientType("b2b")}
                            className={cn(
                                "flex-1 py-3 text-[11px] font-bold  tracking-normal rounded-[var(--radius)] transition-all",
                                clientType === "b2b" ? "bg-white text-indigo-1000 shadow-sm" : "text-slate-400 hover:text-slate-600" // Typo in text-indigo-1000, should be 600
                            )}
                        >
                            Юридическое лицо (B2B)
                        </button>
                    </div>
                    <input type="hidden" name="clientType" value={clientType} />

                    {/* Name Group */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Фамилия <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                onChange={handleInputChange}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Имя <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                onChange={handleInputChange}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                Отчество
                            </label>
                            <input
                                type="text"
                                name="patronymic"
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5" /> Компания
                            </label>
                            <input
                                type="text"
                                name="company"
                                required={clientType === "b2b"}
                                className={cn(
                                    "w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none",
                                    clientType === "b2b" && "border-indigo-100 bg-indigo-50/10"
                                )}
                            />
                        </div>
                    </div>

                    {/* Contact Group */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5" /> Телефон <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="phone"
                                required
                                onChange={handleInputChange}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" /> Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                onChange={handleInputChange}
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                Telegram
                            </label>
                            <input
                                type="text"
                                name="telegram"
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                placeholder="@username"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                Instagram
                            </label>
                            <input
                                type="text"
                                name="instagram"
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                placeholder="insta_link"
                            />
                        </div>
                    </div>

                    {/* New Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                <LinkIcon className="w-3.5 h-3.5" /> Ссылка на соцсеть
                            </label>
                            <input
                                type="text"
                                name="socialLink"
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                                placeholder="vk.com/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                Менеджер
                            </label>
                            <select
                                name="managerId"
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none appearance-none cursor-pointer"
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
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5" /> Город
                            </label>
                            <input
                                type="text"
                                name="city"
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                                Адрес
                            </label>
                            <input
                                type="text"
                                name="address"
                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1 flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5" /> Комментарии
                        </label>
                        <textarea
                            name="comments"
                            rows={3}
                            className="w-full p-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none resize-none"
                        />
                    </div>

                    {duplicates.length > 0 && (
                        <div className="p-4 rounded-[18px] bg-amber-50 border border-amber-100 space-y-3">
                            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs  tracking-wider">
                                <Plus className="w-4 h-4 rotate-45" />
                                Найдены похожие клиенты ({duplicates.length})
                            </div>
                            <div className="space-y-2">
                                {duplicates.map(dup => (
                                    <div key={dup.id} className="flex items-center justify-between bg-white/50 p-2 rounded-[18px] border border-amber-200/50">
                                        <div className="text-xs font-bold text-slate-700">
                                            {dup.lastName} {dup.firstName} ({dup.phone})
                                        </div>
                                        <a
                                            href={`/dashboard/clients?id=${dup.id}`}
                                            target="_blank"
                                            className="text-[10px] font-bold text-#5d00ff  hover:underline"
                                        >
                                            Открыть
                                        </a>
                                    </div>
                                ))}
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={ignoreDuplicates}
                                    onChange={(e) => setIgnoreDuplicates(e.target.checked)}
                                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                                />
                                <span className="text-xs font-bold text-amber-900">Всё равно создать этого клиента</span>
                            </label>
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex justify-center rounded-[18px] border border-transparent bg-#5d00ff py-4 px-4 text-base font-bold text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            {loading ? "Сохранение..." : "Создать клиента"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
