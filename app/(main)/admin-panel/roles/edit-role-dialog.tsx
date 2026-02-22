"use client";

import { useEffect, useState } from "react";
import { Shield, Loader2, Building } from "lucide-react";
import { updateRole } from "../actions/roles.actions";
import { getDepartments } from "../actions/departments.actions";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import { IconSelect } from "@/components/ui/icon-select";
import { RoleColorPicker } from "@/components/ui/role-color-picker";

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
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(role?.departmentId || "none");

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

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(new FormData(e.currentTarget));
                    }}
                    className="space-y-3 pb-2"
                >
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700  pl-1">Название роли</label>
                        <IconInput
                            startIcon={Shield}
                            type="text"
                            name="name"
                            required
                            defaultValue={role?.name}
                            placeholder="Например: Оператор цеха"
                            className="block w-full rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all placeholder:text-slate-300 h-12"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700  pl-1">Привязка к отделу</label>
                        <IconSelect
                            startIcon={Building}
                            name="departmentId"
                            value={selectedDepartmentId || ""}
                            options={[
                                { id: "none", title: "Общая роль (без отдела)" },
                                ...departments.map(dept => ({ id: dept.id, title: dept.name }))
                            ]}
                            className="pl-10 h-11"
                            onChange={(val: string) => setSelectedDepartmentId(val)}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700  pl-1">Цвет роли (наследуется от отдела по умолчанию)</label>
                        <RoleColorPicker defaultValue={role.color || undefined} />
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3 sticky bottom-0 bg-white">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 inline-flex justify-center items-center rounded-[18px] border border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98] h-12 border-none"
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] inline-flex justify-center items-center gap-2 rounded-[var(--radius-inner)] font-bold text-white shadow-lg transition-all active:scale-[0.98] h-12"
                        >
                            {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                            {loading ? "Сохранение..." : "Сохранить изменения"}
                        </Button>
                    </div>
                </form>
            </div>
        </ResponsiveModal>
    );
}
