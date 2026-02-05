"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { updateRolePermissions, updateRole, getDepartments, deleteRole } from "../actions";
import { Loader2, Save, Shield, Building, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface RolePermissionsDialogProps {
    role: {
        id: string;
        name: string;
        departmentId: string | null;
        isSystem: boolean;
        permissions: Record<string, Record<string, boolean>>;
    } | null;
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
    const [departments, setDepartments] = useState<{ id: string, name: string }[]>([]);
    const [roleName, setRoleName] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    const handleDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const onConfirmDelete = async () => {
        if (!role) return;
        setLoading(true);
        try {
            const res = await deleteRole(role.id);
            if (res.error) {
                alert(res.error);
                setLoading(false);
            } else {
                setShowDeleteConfirm(false);
                onClose();
            }
        } catch (error) {
            console.error("Failed to delete role:", error);
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
            await updateRole(role.id, formData);

            // Update permissions
            await updateRolePermissions(role.id, permissions);
            onClose();
        } catch (error) {
            console.error("Failed to update role:", error);
        } finally {
            setLoading(false);
        }
    };

    const isMobile = useIsMobile();

    const FormContent = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 tracking-normal pl-1">Название роли</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            className="block w-full pl-10 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 px-3 py-2.5 border transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 tracking-normal pl-1">Отдел</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                            className="block w-full pl-10 pr-4 py-2.5 rounded-[18px] border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-primary focus:ring-0 border transition-all appearance-none outline-none"
                        >
                            <option value="">Без отдела</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
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
                                            <button
                                                key={action.id}
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
                                                    {isChecked && (
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
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
                    <div className="bg-slate-50 border border-slate-200 rounded-[18px] overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold text-xs">
                                <tr>
                                    <th className="px-4 py-3">Раздел</th>
                                    {ACTIONS.map(action => (
                                        <th key={action.id} className="px-4 py-3 text-center">{action.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {SECTIONS.map(section => (
                                    <tr key={section.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {section.label}
                                        </td>
                                        {ACTIONS.map(action => {
                                            const isChecked = permissions[section.id]?.[action.id] || false;
                                            return (
                                                <td key={action.id} className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() => handleToggle(section.id, action.id)}
                                                        className={cn(
                                                            "w-5 h-5 rounded border flex items-center justify-center transition-all mx-auto",
                                                            isChecked
                                                                ? "bg-primary border-primary text-white"
                                                                : "bg-white border-slate-300 hover:border-primary/40"
                                                        )}
                                                    >
                                                        {isChecked && (
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
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
        </div>
    );

    const ActionsContent = (
        <div className="flex items-center justify-between gap-3 w-full">
            {role && role.name !== "Администратор" && (
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-11 text-rose-600 bg-rose-50 hover:bg-rose-100/50 text-sm font-bold rounded-[var(--radius-inner)] transition-all active:scale-95 disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Удалить роль</span>
                    <span className="sm:hidden">Удалить</span>
                </button>
            )}
            <div className="flex items-center gap-3 flex-1 justify-end">
                <button
                    onClick={onClose}
                    className="hidden sm:flex btn-dialog-ghost h-11 px-6"
                    disabled={loading}
                >
                    Отмена
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 sm:flex-none btn-dialog-dark h-11 sm:px-10 min-w-[120px]"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    Сохранить
                </button>
            </div>
        </div>
    );

    if (isMobile) {
        return (
            <>
                <BottomSheet
                    isOpen={isOpen}
                    onClose={onClose}
                    title="Редактирование роли"
                >
                    <div className="pb-10">
                        {FormContent}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            {ActionsContent}
                        </div>
                    </div>
                </BottomSheet>
                <DeleteRoleDialog
                    role={role ? { id: role.id, name: role.name } : null}
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={onConfirmDelete}
                />
            </>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 rounded-[var(--radius-outer)] border-none shadow-2xl bg-white"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <div className="p-6 pb-2 border-b border-slate-200 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10 shadow-sm">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">Редактирование роли</h3>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                            Настройте уровень доступа и параметры для роли
                        </p>
                    </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {FormContent}
                </div>

                <div className="p-6 pt-2 bg-white sm:rounded-b-[var(--radius-outer)] border-t border-slate-200">
                    {ActionsContent}
                </div>
            </DialogContent>

            <DeleteRoleDialog
                role={role ? { id: role.id, name: role.name } : null}
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={onConfirmDelete}
            />
        </Dialog>
    );
}
