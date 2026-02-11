"use client";

import { useEffect, useState } from "react";
import { Shield, Loader2, Building, ChevronDown } from "lucide-react";
import { updateRole, getDepartments } from "../actions";
import { cn } from "@/lib/utils";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

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

    if (!role) return null;

    return (
        <ResponsiveModal
            isOpen={isOpen}
            onClose={onClose}
            title="Редактировать роль"
            description="Измените параметры роли"
            className="items-start"
        >
            <div>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-medium rounded-[18px] border border-red-100">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-6 pb-2">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700  tracking-normal pl-1">Название роли</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                name="name"
                                required
                                defaultValue={role?.name}
                                placeholder="Например: Оператор цеха"
                                className="block w-full pl-10 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700  tracking-normal pl-1">Привязка к отделу</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                name="departmentId"
                                defaultValue={role?.departmentId || ""}
                                className="block w-full pl-10 h-[46px] rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all appearance-none"
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
                        <label className="text-xs font-bold text-slate-700  tracking-normal pl-1">Цвет роли (наследуется от отдела по умолчанию)</label>
                        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-[18px] border border-slate-200 shadow-inner">
                            {["indigo", "slate", "red", "orange", "emerald", "blue", "purple", "rose", "cyan", "amber"].map((c) => (
                                <label key={c} className="relative cursor-pointer group">
                                    <input type="radio" name="color" value={c} defaultChecked={role?.color === c} className="peer sr-only" />
                                    <div className={cn(
                                        "w-8 h-8 rounded-[18px] transition-all border-2 border-transparent peer-checked:border-white peer-checked:ring-2 shadow-sm group-hover:scale-110",
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

                    <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3 sticky bottom-0 bg-white">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 inline-flex justify-center items-center rounded-[18px] border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] inline-flex justify-center items-center gap-2 rounded-[var(--radius-inner)] border border-transparent btn-dark py-3 px-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98]"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {loading ? "Сохранение..." : "Сохранить изменения"}
                        </button>
                    </div>
                </form>
            </div>
        </ResponsiveModal>
    );
}
