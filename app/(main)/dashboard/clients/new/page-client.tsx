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
import { addClient } from "../actions/core.actions";;
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { FormInput } from "@/components/ui/form-input";

interface NewClientPageClientProps {
    managers: { id: string; name: string }[];
}

export function NewClientPageClient({ managers }: NewClientPageClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [logicState, setLogicState] = useState({
        step: 0,
        loading: false,
        clientType: "b2c" as "b2c" | "b2b",
        validationError: "",
        duplicates: [] as { id: string; firstName: string; lastName: string; phone: string }[],
        ignoreDuplicates: false
    });

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
        if (logicState.validationError) setLogicState(prev => ({ ...prev, validationError: "" }));
    };

    const handleReset = () => {
        setLogicState({
            step: 0,
            loading: false,
            clientType: "b2c",
            validationError: "",
            duplicates: [],
            ignoreDuplicates: false
        });
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
        toast("Форма сброшена", "info");
    };

    const validateStep = (s: number) => {
        if (s === 0) {
            if (!formData.lastName) {
                setLogicState(prev => ({ ...prev, validationError: "Введите фамилию" }));
                return false;
            }
            if (!formData.firstName) {
                setLogicState(prev => ({ ...prev, validationError: "Введите имя" }));
                return false;
            }
            if (logicState.clientType === "b2b" && !formData.company) {
                setLogicState(prev => ({ ...prev, validationError: "Введите название компании" }));
                return false;
            }
        }
        if (s === 1) {
            if (!formData.phone) {
                setLogicState(prev => ({ ...prev, validationError: "Введите номер телефона" }));
                return false;
            }
        }
        setLogicState(prev => ({ ...prev, validationError: "" }));
        return true;
    };

    const handleNext = () => {
        if (validateStep(logicState.step)) {
            setLogicState(prev => ({ ...prev, step: prev.step + 1 }));
        }
    };

    const handleBack = () => {
        if (logicState.step > 0) {
            setLogicState(prev => ({ ...prev, step: prev.step - 1 }));
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(logicState.step)) return;
        setLogicState(prev => ({ ...prev, loading: true }));

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });
        data.append("clientType", logicState.clientType);
        if (logicState.ignoreDuplicates) data.append("ignoreDuplicates", "true");

        const res = await addClient(data);
        setLogicState(prev => ({ ...prev, loading: false }));

        if (!res.success) {
            toast(res.error, "error");
            playSound("notification_error");
        } else if (res.data?.duplicates) {
            setLogicState(prev => ({
                ...prev,
                duplicates: (res.data?.duplicates || []).map(d => ({
                    id: d.id,
                    firstName: d.firstName || "",
                    lastName: d.lastName || "",
                    phone: d.phone
                }))
            }));
            toast("Найдены похожие клиенты", "warning");
            playSound("notification_warning");
        } else {
            toast("Клиент успешно добавлен", "success");
            playSound("client_created");
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
        <div className="flex-1 flex flex-col md:flex-row min-h-0 gap-4 px-4 sm:px-8 pb-8 pt-4">
            {/* Sidebar */}
            <aside className="w-full md:w-[320px] bg-white border border-slate-200 rounded-3xl flex flex-col shrink-0 relative z-20 shadow-lg overflow-hidden h-auto md:h-full">
                <div className="p-6 shrink-0">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-4 transition-all group text-sm p-0 h-auto hover:bg-transparent"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Назад
                    </Button>

                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">
                        Новый клиент
                    </h1>
                    <p className="text-xs text-slate-500 font-bold opacity-60 mt-1">
                        Создание карточки в CRM
                    </p>
                </div>

                <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
                    {steps.map((s, idx) => {
                        const isActive = logicState.step === s.id;
                        const isCompleted = logicState.step > s.id;

                        return (
                            <Button
                                key={idx}
                                variant="ghost"
                                onClick={() => {
                                    if (isActive) return;
                                    if (s.id < logicState.step || validateStep(logicState.step)) {
                                        setLogicState(prev => ({
                                            ...prev,
                                            step: s.id,
                                            validationError: ""
                                        }));
                                    }
                                }}
                                className={cn(
                                    "relative w-full justify-start p-4 h-auto rounded-[var(--radius)] transition-all duration-300 flex items-center gap-3 group",
                                    isActive ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary" : "text-slate-400 hover:bg-slate-50 active:scale-[0.98]"
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
                                <div className="min-w-0 text-left">
                                    <div className={cn("text-xs font-bold leading-none mb-1", isActive ? "text-white" : "text-slate-900")}>
                                        {s.title}
                                    </div>
                                    <div className={cn("text-xs font-bold truncate", isActive ? "text-white/60" : "text-slate-400")}>
                                        {s.desc}
                                    </div>
                                </div>
                            </Button>
                        );
                    })}
                </div>

                <div className="h-[80px] shrink-0 border-t border-slate-200 bg-white z-30 px-7 flex items-center">
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-2 h-auto rounded-2xl hover:bg-slate-50 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all text-xs font-bold text-slate-400 hover:text-slate-900 group"
                    >
                        <RotateCcw className="w-3 h-3 group-hover:rotate-[-90deg] transition-transform duration-300" />
                        Начать заново
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 overflow-visible md:overflow-hidden h-full flex flex-col gap-3">
                {/* Hidden title for E2E tests */}
                <h1 className="sr-only" data-testid="page-title">Новый клиент</h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (logicState.step === 2) {
                            handleSubmit();
                        } else {
                            handleNext();
                        }
                    }}
                    className="bg-white rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden flex flex-col h-full min-h-[400px]"
                >
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-4">
                        {logicState.step === 0 && (
                            <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-4">
                                    <span className="text-sm font-bold text-slate-700 ml-1">Тип клиента</span>
                                    <SegmentedControl
                                        options={[
                                            { value: "b2c", label: "Физическое лицо" },
                                            { value: "b2b", label: "Юридическое лицо" },
                                        ]}
                                        value={logicState.clientType}
                                        onChange={(val) => setLogicState(prev => ({ ...prev, clientType: val as "b2c" | "b2b" }))}
                                        bgClassName="bg-slate-50"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FormInput
                                        label="Фамилия"
                                        required
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => updateFormData({ lastName: e.target.value })}
                                    />
                                    <FormInput
                                        label="Имя"
                                        required
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => updateFormData({ firstName: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FormInput
                                        label="Отчество"
                                        type="text"
                                        value={formData.patronymic}
                                        onChange={(e) => updateFormData({ patronymic: e.target.value })}
                                    />
                                    <FormInput
                                        label={`Компания ${logicState.clientType === "b2b" ? "*" : ""}`.trim()}
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => updateFormData({ company: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {logicState.step === 1 && (
                            <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <FormInput
                                        label="Телефон"
                                        required
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => updateFormData({ phone: e.target.value })}
                                    />
                                    <FormInput
                                        label="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateFormData({ email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <FormInput
                                        label="Telegram"
                                        type="text"
                                        value={formData.telegram}
                                        onChange={(e) => updateFormData({ telegram: e.target.value })}
                                        placeholder="@username"
                                    />
                                    <FormInput
                                        label="Instagram"
                                        type="text"
                                        value={formData.instagram}
                                        onChange={(e) => updateFormData({ instagram: e.target.value })}
                                    />
                                    <FormInput
                                        label="Соцсеть"
                                        type="text"
                                        value={formData.socialLink}
                                        onChange={(e) => updateFormData({ socialLink: e.target.value })}
                                        placeholder="vk.com/..."
                                    />
                                </div>
                            </div>
                        )}

                        {logicState.step === 2 && (
                            <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Менеджер</label>
                                        <Select
                                            value={formData.managerId}
                                            onChange={(val) => updateFormData({ managerId: val })}
                                            options={[
                                                { id: "", title: "Не назначен" },
                                                ...managers.map(m => ({ id: m.id, title: m.name }))
                                            ]}
                                            className="w-full"
                                            triggerClassName="h-12 bg-slate-50 border-slate-200 border-0"
                                        />
                                    </div>
                                    <FormInput
                                        label="Город"
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => updateFormData({ city: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Источник (откуда пришел)</label>
                                        <Select
                                            value={formData.acquisitionSource}
                                            onChange={(val) => updateFormData({ acquisitionSource: val })}
                                            options={[
                                                { id: "", title: "Не указано" },
                                                { id: "instagram", title: "Instagram" },
                                                { id: "telegram", title: "Telegram" },
                                                { id: "recommendation", title: "Рекомендация" },
                                                { id: "ads", title: "Реклама" },
                                                { id: "other", title: "Другое" },
                                            ]}
                                            className="w-full"
                                            triggerClassName="h-12 bg-slate-50 border-slate-200 border-0"
                                        />
                                    </div>
                                    <FormInput
                                        label="Адрес"
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => updateFormData({ address: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="client-comments" className="text-sm font-bold text-slate-700 ml-1">Комментарии</label>
                                    <textarea
                                        id="client-comments"
                                        value={formData.comments}
                                        onChange={(e) => updateFormData({ comments: e.target.value })}
                                        rows={4}
                                        className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-bold text-sm focus:border-slate-900 focus:bg-white transition-all outline-none resize-none"
                                    />
                                </div>

                                {logicState.duplicates.length > 0 && (
                                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 space-y-3">
                                        <div className="text-amber-800 font-bold text-xs">
                                            Найдены похожие клиенты ({logicState.duplicates.length})
                                        </div>
                                        <div className="space-y-2">
                                            {logicState.duplicates.map(dup => (
                                                <div key={dup.id} className="flex items-center justify-between bg-white/50 p-2 rounded-2xl border border-amber-200/50">
                                                    <div className="text-xs font-bold text-slate-700">
                                                        {dup.lastName} {dup.firstName} ({dup.phone})
                                                    </div>
                                                    <a href={`/dashboard/clients?id=${dup.id}`} target="_blank" className="text-xs font-bold text-slate-900 ">Открыть</a>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 pt-1">
                                            <Checkbox
                                                id="ignore-duplicates"
                                                checked={logicState.ignoreDuplicates}
                                                onChange={(val) => setLogicState(prev => ({ ...prev, ignoreDuplicates: val }))}
                                            />
                                            <label htmlFor="ignore-duplicates" className="text-xs font-bold text-amber-900 cursor-pointer">
                                                Всё равно создать
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 md:px-10 py-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-3">
                        <div className="flex flex-col">
                            {logicState.validationError && (
                                <span className="text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-left-2">{logicState.validationError}</span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                className="px-6 py-3 h-auto rounded-[var(--radius-inner)] border-slate-200 text-sm font-bold text-slate-400 hover:text-slate-900 bg-white transition-all"
                            >
                                Назад
                            </Button>
                            {logicState.step < 2 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="px-8 py-3 h-auto btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 transition-all border-none"
                                >
                                    Далее
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={logicState.loading}
                                    className="px-8 py-3 h-auto btn-dark rounded-[var(--radius-inner)] text-sm font-bold disabled:opacity-50 transition-all border-none"
                                >
                                    {logicState.loading ? "Создание..." : "Создать клиента"}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
