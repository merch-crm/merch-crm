"use client";

import { useEffect, useState } from "react";
import { Plus, X, Shield, Loader2, Building, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createRole, getDepartments } from "../actions";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddRoleDialogProps {
    onSuccess: () => void;
}

const SECTIONS = [
    { id: "clients", label: "Клиенты" },
    { id: "orders", label: "Заказы" },
    { id: "inventory", label: "Склад" },
    { id: "tasks", label: "Задачи" },
    { id: "users", label: "Сотрудники" },
    { id: "roles", label: "Роли" },
    { id: "finance", label: "Финансы" },
    { id: "settings", label: "Настройки" },
];

const ACTIONS = [
    { id: "view", label: "Просмотр" },
    { id: "create", label: "Создание" },
    { id: "edit", label: "Редактирование" },
    { id: "delete", label: "Удаление" },
];

export function AddRoleDialog({ onSuccess }: AddRoleDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});

    useEffect(() => {
        if (isOpen) {
            getDepartments().then(res => {
                if (res.data) setDepartments(res.data);
            });
        }
    }, [isOpen]);

    const handleToggle = (sectionId: string, actionId: string) => {
        setPermissions((prev) => {
            const section = prev[sectionId] || {};
            const newValue = !section[actionId];

            return {
                ...prev,
                [sectionId]: {
                    ...section,
                    [actionId]: newValue
                }
            };
        });
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        // Add permissions as JSON string
        formData.append("permissions", JSON.stringify(permissions));

        const res = await createRole(formData);
        setLoading(false);
        if (res?.error) {
            setError(res.error);
        } else {
            setIsOpen(false);
            setPermissions({});
            onSuccess();
        }
    }

    const isMobile = useIsMobile();

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                size={isMobile ? "default" : "lg"}
                className={cn(
                    "rounded-full sm:rounded-[18px] shadow-xl shadow-primary/20 font-bold justify-center",
                    isMobile ? "w-11 h-11 p-0" : ""
                )}
                title="Добавить роль"
            >
                <Plus className={cn("h-5 w-5", !isMobile && "mr-2")} />
                <span className="hidden sm:inline">Добавить роль</span>
            </Button>
        );
    }

    const FormContent = (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Название роли</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Например: Оператор цеха"
                            className="block w-full pl-10 rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700 ml-1">Привязка к отделу</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            name="departmentId"
                            className="block w-full pl-10 h-[46px] rounded-[var(--radius-inner)] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all appearance-none"
                        >
                            <option value="">Общая роль (без отдела)</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Цвет роли (от отдела по умолчанию)</label>
                <div className="flex flex-wrap gap-2 p-3 md:p-4 bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200 shadow-inner">
                    {["indigo", "slate", "red", "orange", "emerald", "blue", "purple", "rose", "cyan", "amber"].map((c) => (
                        <label key={c} className="relative cursor-pointer group">
                            <input type="radio" name="color" value={c} className="peer sr-only" />
                            <div className={cn(
                                "w-8 h-8 rounded-[var(--radius-inner)] transition-all border-2 border-transparent peer-checked:border-white peer-checked:ring-2 shadow-sm group-hover:scale-110",
                                c === "indigo" ? "bg-primary peer-checked:ring-primary" :
                                    c === "slate" ? "bg-slate-500 peer-checked:ring-slate-500" :
                                        c === "red" ? "bg-red-500 peer-checked:ring-red-500" :
                                            c === "orange" ? "bg-orange-500 peer-checked:ring-orange-500" :
                                                c === "emerald" ? "bg-emerald-500 peer-checked:ring-emerald-500" :
                                                    c === "blue" ? "bg-blue-500 peer-checked:ring-blue-500" :
                                                        c === "purple" ? "bg-purple-500 peer-checked:ring-purple-500" :
                                                            c === "rose" ? "bg-rose-500 peer-checked:ring-rose-500" :
                                                                c === "cyan" ? "bg-cyan-500 peer-checked:ring-cyan-500" :
                                                                    "bg-amber-500 peer-checked:ring-amber-500"
                            )} />
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 ml-1">Права доступа</label>

                {isMobile ? (
                    <div className="space-y-3">
                        {SECTIONS.map(section => (
                            <div key={section.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                <h4 className="text-sm font-bold text-slate-900 mb-3">{section.label}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {ACTIONS.map(action => {
                                        const isChecked = permissions[section.id]?.[action.id] || false;
                                        return (
                                            <button
                                                key={action.id}
                                                type="button"
                                                onClick={() => handleToggle(section.id, action.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border transition-all",
                                                    isChecked
                                                        ? "bg-primary/10 border-primary/20 text-primary"
                                                        : "bg-white border-slate-200 text-slate-400"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 rounded border flex items-center justify-center transition-all",
                                                    isChecked ? "bg-primary border-primary text-white" : "bg-white border-slate-300"
                                                )}>
                                                    {isChecked && <Check className="w-3 h-3 stroke-[4px]" />}
                                                </div>
                                                {action.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-[var(--radius-inner)] overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100 text-slate-500 font-bold text-xs tracking-wider">
                                <tr>
                                    <th className="px-4 py-3">Раздел</th>
                                    {ACTIONS.map(action => (
                                        <th key={action.id} className="px-4 py-3 text-center">{action.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {SECTIONS.map(section => (
                                    <tr key={section.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 font-bold text-slate-700 text-xs">
                                            {section.label}
                                        </td>
                                        {ACTIONS.map(action => {
                                            const isChecked = permissions[section.id]?.[action.id] || false;
                                            return (
                                                <td key={action.id} className="px-4 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggle(section.id, action.id)}
                                                        className={cn(
                                                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all mx-auto active:scale-90",
                                                            isChecked
                                                                ? "bg-primary border-primary text-white shadow-sm"
                                                                : "bg-white border-slate-200 hover:border-primary/40"
                                                        )}
                                                    >
                                                        {isChecked && <Check className="w-3 h-3 stroke-[4px]" />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col md:flex-row gap-3">
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 inline-flex justify-center items-center rounded-[var(--radius-inner)] border border-slate-200 bg-white h-11 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] inline-flex justify-center items-center gap-2 rounded-[var(--radius-inner)] border border-transparent bg-primary h-11 px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 focus:outline-none focus:outline-none disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {loading ? "Создание..." : "Создать роль"}
                </button>
            </div>
        </form>
    );

    if (isMobile) {
        return (
            <BottomSheet
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Новая роль"
            >
                <div className="pb-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-[var(--radius-inner)] border border-red-100">
                            {error}
                        </div>
                    )}
                    {FormContent}
                </div>
            </BottomSheet>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" data-dialog-open="true">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

                <div className="relative transform overflow-hidden rounded-[18px] bg-white p-6 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-200">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-6 flex items-center gap-4 text-left border-b border-slate-200 pb-5">
                        <div className="h-12 w-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-inner">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 leading-tight">Новая роль</h3>
                            <p className="text-[11px] font-bold text-slate-500 mt-0.5">Определите параметры доступа и привязку к отделу</p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-[var(--radius-inner)] border border-red-100">
                            {error}
                        </div>
                    )}

                    {FormContent}
                </div>
            </div>
        </div>
    );
}
