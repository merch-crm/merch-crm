"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Check,
    User,
    Phone,
    MessageSquare,
    RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addClient } from "../actions";
import { useToast } from "@/components/ui/toast";

interface NewClientPageClientProps {
    managers: { id: string; name: string }[];
}

export function NewClientPageClient({ managers }: NewClientPageClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [clientType, setClientType] = useState<"b2c" | "b2b">("b2c");
    interface DuplicateClient {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
    }
    const [duplicates, setDuplicates] = useState<DuplicateClient[]>([]);
    const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);
    const [validationError, setValidationError] = useState("");

    const [formData, setFormData] = useState({
        lastName: "",
        firstName: "",
        patronymic: "",
        company: "",
        phone: "",
        email: "",
        telegram: "",
        instagram: "",
        socialLink: "",
        managerId: "",
        city: "",
        address: "",
        comments: "",
        acquisitionSource: ""
    });

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
        if (validationError) setValidationError("");
    };

    const handleReset = () => {
        setStep(0);
        setFormData({
            lastName: "",
            firstName: "",
            patronymic: "",
            company: "",
            phone: "",
            email: "",
            telegram: "",
            instagram: "",
            socialLink: "",
            managerId: "",
            city: "",
            address: "",
            comments: "",
            acquisitionSource: ""
        });
        setClientType("b2c");
        setDuplicates([]);
        setIgnoreDuplicates(false);
        setValidationError("");
        toast("Форма сброшена", "info");
    };

    const validateStep = (s: number) => {
        setValidationError("");
        if (s === 0) {
            if (!formData.lastName) {
                setValidationError("Введите фамилию");
                return false;
            }
            if (!formData.firstName) {
                setValidationError("Введите имя");
                return false;
            }
            if (clientType === "b2b" && !formData.company) {
                setValidationError("Введите название компании");
                return false;
            }
        }
        if (s === 1) {
            if (!formData.phone) {
                setValidationError("Введите номер телефона");
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;
        setLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        data.append("clientType", clientType);
        if (ignoreDuplicates) data.append("ignoreDuplicates", "true");

        const res = await addClient(data);
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
            router.push("/dashboard/clients");
            router.refresh();
        }
    };

    const steps = [
        { id: 0, title: "Основное", desc: "Тип и имя", icon: User },
        { id: 1, title: "Контакты", desc: "Связь с клиентом", icon: Phone },
        { id: 2, title: "Дополнительно", desc: "Детали и менеджер", icon: MessageSquare }
    ];

    return (
        <div className="flex-1 flex min-h-0 gap-6 px-8 pb-8 pt-4">
            {/* Sidebar */}
            <aside className="w-[320px] bg-white border border-slate-200 rounded-[24px] flex flex-col shrink-0 relative z-20 h-full shadow-lg overflow-hidden">
                <div className="p-6 shrink-0">
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-4 transition-all group text-sm"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </button>

                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                        Новый клиент
                    </h1>
                    <p className="text-[11px] text-slate-500 font-bold opacity-60 mt-1  tracking-wider">
                        Создание карточки в CRM
                    </p>
                </div>

                <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
                    {steps.map((s, idx) => {
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;

                        return (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (isActive) return;
                                    if (s.id < step || validateStep(step)) {
                                        setStep(s.id);
                                        setValidationError("");
                                    }
                                }}
                                className={cn(
                                    "relative w-full text-left p-4 rounded-[var(--radius)] transition-all duration-300 flex items-center gap-4 group",
                                    isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-50 active:scale-[0.98]"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-[var(--radius)] flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                                    isActive ? "bg-white/10 border-white/20" : isCompleted ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50 border-slate-200"
                                )}>
                                    {isCompleted ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <s.icon className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className={cn("text-xs font-bold leading-none mb-1", isActive ? "text-white" : "text-slate-900")}>
                                        {s.title}
                                    </div>
                                    <div className={cn("text-[10px] font-bold truncate", isActive ? "text-white/60" : "text-slate-400")}>
                                        {s.desc}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="h-[80px] shrink-0 border-t border-slate-200 bg-white z-30 px-7 flex items-center">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-[18px] hover:bg-slate-50 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-[10px] font-bold text-slate-400 hover:text-slate-900 group"
                    >
                        <RotateCcw className="w-3 h-3 group-hover:rotate-[-90deg] transition-transform duration-300" />
                        Начать заново
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden h-full flex flex-col gap-4">
                <div className="bg-white rounded-[24px] shadow-lg border border-slate-200/60 overflow-hidden flex flex-col h-full min-h-0">
                    <div className="flex-1 overflow-y-auto p-10 space-y-8">
                        {step === 0 && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-slate-500 ml-1">Тип клиента</label>
                                    <div className="flex p-1 bg-slate-100 rounded-[var(--radius)]">
                                        <button
                                            type="button"
                                            onClick={() => setClientType("b2c")}
                                            className={cn(
                                                "flex-1 py-3 text-[11px] font-bold  tracking-normal rounded-[var(--radius)] transition-all",
                                                clientType === "b2c" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            Физическое лицо
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setClientType("b2b")}
                                            className={cn(
                                                "flex-1 py-3 text-[11px] font-bold  tracking-normal rounded-[var(--radius)] transition-all",
                                                clientType === "b2b" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            Юридическое лицо
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Фамилия *</label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => updateFormData({ lastName: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Имя *</label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => updateFormData({ firstName: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Отчество</label>
                                        <input
                                            type="text"
                                            value={formData.patronymic}
                                            onChange={(e) => updateFormData({ patronymic: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">
                                            Компания {clientType === "b2b" && "*"}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => updateFormData({ company: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Телефон *</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => updateFormData({ phone: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateFormData({ email: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Telegram</label>
                                        <input
                                            type="text"
                                            value={formData.telegram}
                                            onChange={(e) => updateFormData({ telegram: e.target.value })}
                                            placeholder="@username"
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Instagram</label>
                                        <input
                                            type="text"
                                            value={formData.instagram}
                                            onChange={(e) => updateFormData({ instagram: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Соцсеть</label>
                                        <input
                                            type="text"
                                            value={formData.socialLink}
                                            onChange={(e) => updateFormData({ socialLink: e.target.value })}
                                            placeholder="vk.com/..."
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Менеджер</label>
                                        <select
                                            value={formData.managerId}
                                            onChange={(e) => updateFormData({ managerId: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Не назначен</option>
                                            {managers.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Город</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => updateFormData({ city: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Источник (откуда пришел)</label>
                                        <select
                                            value={formData.acquisitionSource}
                                            onChange={(e) => updateFormData({ acquisitionSource: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Не указано</option>
                                            <option value="instagram">Instagram</option>
                                            <option value="telegram">Telegram</option>
                                            <option value="recommendation">Рекомендация</option>
                                            <option value="ads">Реклама</option>
                                            <option value="other">Другое</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-500 ml-1">Адрес</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => updateFormData({ address: e.target.value })}
                                            className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-500 ml-1">Комментарии</label>
                                    <textarea
                                        value={formData.comments}
                                        onChange={(e) => updateFormData({ comments: e.target.value })}
                                        rows={4}
                                        className="w-full p-4 rounded-[18px] border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none resize-none"
                                    />
                                </div>

                                {duplicates.length > 0 && (
                                    <div className="p-4 rounded-[18px] bg-amber-50 border border-amber-100 space-y-3">
                                        <div className="text-amber-800 font-bold text-xs  tracking-wider">
                                            Найдены похожие клиенты ({duplicates.length})
                                        </div>
                                        <div className="space-y-2">
                                            {duplicates.map(dup => (
                                                <div key={dup.id} className="flex items-center justify-between bg-white/50 p-2 rounded-[18px] border border-amber-200/50">
                                                    <div className="text-xs font-bold text-slate-700">
                                                        {dup.lastName} {dup.firstName} ({dup.phone})
                                                    </div>
                                                    <a href={`/dashboard/clients?id=${dup.id}`} target="_blank" className="text-[10px] font-bold text-slate-900 ">Открыть</a>
                                                </div>
                                            ))}
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer pt-1">
                                            <input
                                                type="checkbox"
                                                checked={ignoreDuplicates}
                                                onChange={(e) => setIgnoreDuplicates(e.target.checked)}
                                                className="w-4 h-4 rounded border-amber-300 text-amber-600"
                                            />
                                            <span className="text-xs font-bold text-amber-900">Всё равно создать</span>
                                        </label>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-10 py-6 border-t border-slate-200 flex justify-between items-center bg-slate-50/30">
                        <div className="flex flex-col">
                            {validationError && (
                                <span className="text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-left-2">{validationError}</span>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 rounded-[var(--radius-inner)] border border-slate-200 text-sm font-bold text-slate-400 hover:text-slate-900 bg-white transition-all"
                            >
                                Назад
                            </button>
                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-3 btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 transition-all border-none"
                                >
                                    Далее
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-8 py-3 btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 transition-all border-none"
                                >
                                    {loading ? "Создание..." : "Создать клиента"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
