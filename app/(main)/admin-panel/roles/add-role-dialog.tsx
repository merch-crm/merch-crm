"use client";

import { useEffect, useState } from "react";
import { Plus, Shield, Loader2, Building, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconInput } from "@/components/ui/icon-input";
import { IconSelect } from "@/components/ui/icon-select";
import { createRole } from "../actions/roles.actions";
import { getDepartments } from "../actions/departments.actions";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { RoleColorPicker } from "@/components/ui/role-color-picker";

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
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("none");
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
            const isNewValue = !section[actionId];

            return {
                ...prev,
                [sectionId]: {
                    ...section,
                    [actionId]: isNewValue
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

    const PermissionButton = ({ sectionId, actionId, label, isDesktop = false }: { sectionId: string, actionId: string, label?: string, isDesktop?: boolean }) => {
        const isChecked = permissions[sectionId]?.[actionId] || false;

        if (isDesktop) {
            return (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggle(sectionId, actionId)}
                    className={cn(
                        "w-6 h-6 rounded-md border flex items-center justify-center transition-all mx-auto active:scale-90 p-0 hover:bg-transparent",
                        isChecked
                            ? "bg-primary border-primary text-white shadow-sm hover:text-white"
                            : "bg-white border-slate-200 hover:border-primary/40"
                    )}
                >
                    {isChecked && <Check className="w-3 h-3 stroke-[4px]" />}
                </Button>
            );
        }

        return (
            <Button
                type="button"
                variant="ghost"
                onClick={() => handleToggle(sectionId, actionId)}
                className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all h-auto",
                    isChecked
                        ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                        : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                )}
            >
                <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-all",
                    isChecked ? "bg-primary border-primary text-white" : "bg-white border-slate-300"
                )}>
                    {isChecked && <Check className="w-3 h-3 stroke-[4px]" />}
                </div>
                {label}
            </Button>
        );
    };

    return (
        <>
            <Button
                type="button"
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

            <ResponsiveModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Новая роль"
                description="Определите параметры доступа и привязку к отделу"
                className="max-w-2xl"
            >
                <div>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-[var(--radius-inner)] border border-red-100">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">Название роли</label>
                                <IconInput
                                    startIcon={Shield}
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Например: Оператор цеха"
                                    className="crm-dialog-field"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700 ml-1">Привязка к отделу</label>
                                <IconSelect
                                    startIcon={Building}
                                    name="departmentId"
                                    value={selectedDepartmentId}
                                    options={[
                                        { id: "none", title: "Общая роль (без отдела)" },
                                        ...departments.map(dept => ({ id: dept.id, title: dept.name }))
                                    ]}
                                    placeholder="Выбрать отдел"
                                    className="h-11"
                                    onChange={(val: string) => setSelectedDepartmentId(val)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">Цвет роли (от отдела по умолчанию)</label>
                            <RoleColorPicker />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-bold text-slate-700 ml-1">Права доступа</label>

                            {isMobile ? (
                                <div className="space-y-3">
                                    {SECTIONS.map(section => (
                                        <div key={section.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                            <h4 className="text-sm font-bold text-slate-900 mb-3">{section.label}</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {ACTIONS.map(action => (
                                                    <PermissionButton
                                                        key={action.id}
                                                        sectionId={section.id}
                                                        actionId={action.id}
                                                        label={action.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 rounded-[var(--radius-inner)] overflow-hidden shadow-sm">
                                    <table className="crm-table">
                                        <thead className="crm-thead">
                                            <tr>
                                                <th className="crm-th">Раздел</th>
                                                {ACTIONS.map(action => (
                                                    <th key={action.id} className="crm-th text-center">{action.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="crm-tbody">
                                            {SECTIONS.map(section => (
                                                <tr key={section.id} className="crm-tr">
                                                    <td className="crm-td font-bold text-slate-700 text-xs">
                                                        {section.label}
                                                    </td>
                                                    {ACTIONS.map(action => (
                                                        <td key={action.id} className="crm-td text-center">
                                                            <PermissionButton
                                                                sectionId={section.id}
                                                                actionId={action.id}
                                                                isDesktop={true}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 pt-5 border-t border-slate-200 flex flex-col md:flex-row gap-3 sticky bottom-0 bg-white">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 inline-flex justify-center items-center rounded-[var(--radius-inner)] border border-slate-200 bg-white h-11 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] inline-flex justify-center items-center gap-2 rounded-[var(--radius-inner)] font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] h-11"
                            >
                                {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                                {loading ? "Создание..." : "Создать роль"}
                            </Button>
                        </div>
                    </form>
                </div>
            </ResponsiveModal>
        </>
    );
}
