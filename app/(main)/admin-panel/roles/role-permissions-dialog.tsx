"use client";

import { useEffect, useState } from "react";
import { updateRolePermissions, updateRole, deleteRole } from "../actions/roles.actions";
import { getDepartments } from "../actions/departments.actions";
import { Loader2, Save, Shield, Building, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

import type { RoleDetail, DepartmentDetail } from "@/lib/types";

interface RolePermissionsDialogProps {
    role: RoleDetail | null;
    isOpen: boolean;
    onClose: () => void;
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

export function RolePermissionsDialog({ role, isOpen, onClose }: RolePermissionsDialogProps) {
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState<DepartmentDetail[]>([]);
    const [roleName, setRoleName] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            getDepartments().then(res => {
                if (res.data) setDepartments(res.data);
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (role) {
            setPermissions(role.permissions || {});
            setRoleName(role.name || "");
            setDepartmentId(role.departmentId || "");
        } else {
            setPermissions({});
            setRoleName("");
            setDepartmentId("");
        }
    }, [role]);

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

    const handleDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const onConfirmDelete = async () => {
        if (!role) return;
        setLoading(true);
        try {
            const res = await deleteRole(role.id);
            if (res.error) {
                toast(res.error, "error");
                setLoading(false);
            } else {
                toast("Роль успешно удалена", "success");
                setShowDeleteConfirm(false);
                onClose();
            }
        } catch {
            toast("Произошла ошибка при удалении", "error");
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!role) return;
        setLoading(true);
        try {
            // Update role name and department
            const formData = new FormData();
            formData.append("name", roleName);
            formData.append("departmentId", departmentId);
            const roleUpdateRes = await updateRole(role.id, formData);

            if (!roleUpdateRes.success) {
                toast(roleUpdateRes.error || "Ошибка при обновлении параметров роли", "error");
                setLoading(false);
                return;
            }

            // Update permissions
            const permsUpdateRes = await updateRolePermissions(role.id, permissions);

            if (!permsUpdateRes.success) {
                toast(permsUpdateRes.error || "Ошибка при обновлении прав доступа", "error");
            } else {
                toast("Роль успешно обновлена", "success");
                onClose();
            }
        } catch {
            toast("Произошла непредвиденная ошибка", "error");
        } finally {
            setLoading(false);
        }
    };

    const isMobile = useIsMobile();

    const FormContent = (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 pl-1">Название роли</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                        <Input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="block w-full pl-10 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 transition-all font-bold h-11"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 pl-1">Отдел</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                        <Select
                            value={departmentId || "none"}
                            options={[
                                { id: "none", title: "Без отдела" },
                                ...departments.map(dept => ({ id: dept.id, title: dept.name }))
                            ]}
                            placeholder="Выбрать отдел"
                            className="pl-10 h-11"
                            onChange={(val) => setDepartmentId(val === "none" ? "" : val)}
                        />
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Права доступа</h3>

                {isMobile ? (
                    <div className="space-y-3">
                        {SECTIONS.map(section => (
                            <div key={section.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                <h4 className="text-sm font-bold text-slate-900 mb-3">{section.label}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {ACTIONS.map(action => {
                                        const isChecked = permissions[section.id]?.[action.id] || false;
                                        return (
                                            <Button
                                                key={action.id}
                                                variant="ghost"
                                                onClick={() => handleToggle(section.id, action.id)}
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
                                                {action.label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-[18px] overflow-hidden">
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
                                        <td className="crm-td font-medium text-slate-900">
                                            {section.label}
                                        </td>
                                        {ACTIONS.map(action => {
                                            const isChecked = permissions[section.id]?.[action.id] || false;
                                            return (
                                                <td key={action.id} className="crm-td text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleToggle(section.id, action.id)}
                                                        className={cn(
                                                            "w-6 h-6 rounded border flex items-center justify-center transition-all mx-auto p-0 hover:bg-transparent",
                                                            isChecked
                                                                ? "bg-primary border-primary text-white hover:text-white"
                                                                : "bg-white border-slate-300 hover:border-primary/40"
                                                        )}
                                                    >
                                                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[4px]" />}
                                                    </Button>
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
        </div>
    );

    const ActionsContent = (
        <div className="flex items-center justify-between gap-3 w-full">
            {role && role.name !== "Администратор" && (
                <Button
                    variant="ghost"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-11 text-rose-600 bg-rose-50 hover:bg-rose-100/50 text-sm font-bold rounded-[var(--radius-inner)] transition-all active:scale-95 disabled:opacity-50 border-none"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Удалить роль</span>
                    <span className="sm:hidden">Удалить</span>
                </Button>
            )}
            <div className="flex items-center gap-3 flex-1 justify-end">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="hidden sm:flex h-11 px-6 font-bold text-slate-500 hover:bg-slate-50 rounded-[var(--radius-inner)] border border-slate-200"
                    disabled={loading}
                >
                    Отмена
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 sm:flex-none h-11 sm:px-10 min-w-[120px] font-bold text-white shadow-lg shadow-primary/20"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Сохранить
                </Button>
            </div>
        </div>
    );

    return (
        <>
            <ResponsiveModal
                isOpen={isOpen}
                onClose={onClose}
                title="Редактирование роли"
                description="Настройте уровень доступа и параметры для роли"
                className="max-w-4xl"
            >
                <div>
                    <div className="mb-4">
                        {FormContent}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 sticky bottom-0 bg-white">
                        {ActionsContent}
                    </div>
                </div>
            </ResponsiveModal>

            <DeleteRoleDialog
                role={role ? { id: role.id, name: role.name } : null}
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={onConfirmDelete}
            />
        </>
    );
}
