"use client";

import { useEffect, useState } from "react";
import { X, Shield, Loader2, Building, ChevronDown } from "lucide-react";
import { updateRole, getDepartments } from "../actions";
import { cn } from "@/lib/utils";

interface EditRoleDialogProps {
    role: {
        id: string;
        name: string;
        departmentId: string | null;
        color: string | null;
    } | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditRoleDialog({ role, isOpen, onClose, onSuccess }: EditRoleDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            getDepartments().then(res => {
                if (res.data) setDepartments(res.data);
            });
        }
    }, [isOpen]);

    async function handleSubmit(formData: FormData) {
        if (!role) return;

        setLoading(true);
        setError(null);

        const res = await updateRole(role.id, formData);
        setLoading(false);

        if (res?.error) {
            setError(res.error);
        } else {
            onClose();
            onSuccess();
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

                <div className="relative transform overflow-hidden rounded-xl bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
                    <div className="absolute top-0 right-0 pt-6 pr-6">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="mb-8 text-center border-b border-slate-100 pb-6">
                        <div className="h-14 w-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-inner">
                            <Shield className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">Редактировать роль</h3>
                        <p className="text-slate-500 mt-1">Измените параметры роли</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Название роли</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    defaultValue={role?.name}
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
                                    defaultValue={role?.departmentId || ""}
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

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Цвет роли (наследуется от отдела по умолчанию)</label>
                            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
                                {["indigo", "slate", "red", "orange", "emerald", "blue", "purple", "rose", "cyan", "amber"].map((c) => (
                                    <label key={c} className="relative cursor-pointer group">
                                        <input type="radio" name="color" value={c} defaultChecked={role?.color === c} className="peer sr-only" />
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg transition-all border-2 border-transparent peer-checked:border-white peer-checked:ring-2 shadow-sm group-hover:scale-110",
                                            c === "indigo" ? "bg-indigo-500 peer-checked:ring-indigo-500" :
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

                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
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
                                {loading ? "Сохранение..." : "Сохранить изменения"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
