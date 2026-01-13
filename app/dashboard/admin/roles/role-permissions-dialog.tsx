"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { updateRolePermissions, updateRole, getDepartments, deleteRole } from "../actions";
import { Loader2, Save, Shield, Building, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteRoleDialog } from "./delete-role-dialog";

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-4xl max-h-[85vh] overflow-y-auto"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Редактирование роли</DialogTitle>
                    <DialogDescription>
                        Измените название, отдел и права доступа для данной роли.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Role Name & Department */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Название роли</label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={roleName}
                                    onChange={(e) => setRoleName(e.target.value)}
                                    className="block w-full pl-10 rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 px-3 py-2.5 border transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Отдел</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={departmentId}
                                    onChange={(e) => setDepartmentId(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2.5 rounded-lg border-slate-200 bg-slate-50 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-0 border transition-all appearance-none outline-none"
                                >
                                    <option value="">Без отдела</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Permissions Table */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-700 mb-3">Права доступа</h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-xs">
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
                                                                    ? "bg-indigo-600 border-indigo-600 text-white"
                                                                    : "bg-white border-slate-300 hover:border-indigo-400"
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
                    </div>
                </div>

                <DialogFooter>
                    <div className="flex items-center gap-3">
                        {role && role.name !== "Администратор" && (
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Удалить роль
                            </button>
                        )}
                        <div className="flex-1" />
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            <Save className="w-4 h-4" />
                            Сохранить изменения
                        </button>
                    </div>
                </DialogFooter>
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
