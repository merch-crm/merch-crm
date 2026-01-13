"use client";

import { useEffect, useState } from "react";
import { Plus, X, Shield, Loader2, Building, ChevronDown, Check } from "lucide-react";
import { createRole, getDepartments } from "../actions";
import { cn } from "@/lib/utils";

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

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 gap-2 font-black shadow-xl shadow-indigo-200 transition-all active:scale-95 inline-flex items-center"
            >
                <Plus className="w-5 h-5" />
                Добавить роль
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />

                <div className="relative transform overflow-hidden rounded-xl bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-slate-200">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 text-center border-b border-slate-100 pb-6">
                        <div className="h-14 w-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                            <Shield className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Новая роль</h3>
                        <p className="text-slate-500 mt-1">Определите параметры доступа и привязку к отделу</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Название роли</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="Например: Оператор цеха"
                                        className="block w-full pl-10 rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Привязка к отделу</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        name="departmentId"
                                        className="block w-full pl-10 h-[46px] rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2.5 border transition-all appearance-none"
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
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Права доступа</label>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-tighter">
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
                                                <td className="px-4 py-3 font-medium text-slate-700 text-xs">
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
                                                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                                                        : "bg-white border-slate-200 hover:border-indigo-400"
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
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 inline-flex justify-center items-center rounded-lg border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 focus:outline-none focus:outline-none disabled:opacity-50 transition-all active:scale-[0.98]"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                                {loading ? "Создание..." : "Создать роль"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
