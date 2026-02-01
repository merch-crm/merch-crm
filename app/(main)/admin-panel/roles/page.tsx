"use client";

import { useEffect, useState } from "react";
import { getRoles, deleteRole } from "../actions";
import { Shield, Key, Palette, Printer, Scissors, Package, ShoppingBag, UserCog, LucideIcon } from "lucide-react";
import { RolePermissionsDialog } from "./role-permissions-dialog";
import { AddRoleDialog } from "./add-role-dialog";
import { EditRoleDialog } from "./edit-role-dialog";
import { DeleteRoleDialog } from "./delete-role-dialog";

interface Role {
    id: string;
    name: string;
    isSystem: boolean;
    departmentId: string | null;
    department?: {
        name: string;
        color: string | null;
    } | null;
    color: string | null;
    permissions: Record<string, Record<string, boolean>>;
}

export default function AdminRolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissionsRole, setPermissionsRole] = useState<Role | null>(null);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);

    const fetchRoles = () => {
        getRoles().then(res => {
            if (res.data) setRoles(res.data as Role[]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleDeleteRole = async (id: string, password?: string) => {
        const res = await deleteRole(id, password);
        if (res.error) {
            alert(res.error);
        } else {
            fetchRoles();
        }
    };

    const getRoleConfig = (role: Role) => {
        const hardcoded: Record<string, { icon: LucideIcon; defaultGradient: string }> = {
            "Администратор": { icon: Shield, defaultGradient: "from-red-400 to-red-600" },
            "Дизайнер": { icon: Palette, defaultGradient: "from-purple-400 to-purple-600" },
            "Отдел продаж": { icon: ShoppingBag, defaultGradient: "from-emerald-400 to-emerald-600" },
            "Печать": { icon: Printer, defaultGradient: "from-orange-400 to-orange-600" },
            "Вышивка": { icon: Scissors, defaultGradient: "from-blue-400 to-blue-600" },
            "Склад": { icon: Package, defaultGradient: "from-slate-400 to-slate-600" },
            "Управляющий": { icon: UserCog, defaultGradient: "from-primary/60 to-primary" },
        };

        const config = hardcoded[role.name] || { icon: UserCog, defaultGradient: "from-slate-400 to-slate-600" };

        // Dynamic color from role or department
        const activeColor = role.color || role.department?.color || "indigo";

        // CSS mapping helper (simplified)
        const colorMap: Record<string, string> = {
            "red": "from-red-400 to-red-600",
            "purple": "from-purple-400 to-purple-600",
            "emerald": "from-emerald-400 to-emerald-600",
            "orange": "from-orange-400 to-orange-600",
            "blue": "from-blue-400 to-blue-600",
            "slate": "from-slate-400 to-slate-600",
            "indigo": "from-primary/60 to-primary",
            "amber": "from-amber-400 to-amber-600",
            "rose": "from-rose-400 to-rose-600",
            "cyan": "from-cyan-400 to-cyan-600",
        };

        const gradient = colorMap[activeColor] || `from-${activeColor}-400 to-${activeColor}-600`;
        const cardGradient = `from-white via-${activeColor}-50/30 to-${activeColor}-100/20`;

        return {
            icon: config.icon,
            gradient: gradient,
            cardGradient: cardGradient,
            color: "text-white"
        };
    };

    if (loading) return <div className="text-slate-400 p-12 text-center">Загрузка ролей системы...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-normal">Роли и права</h1>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-wider mt-1">Настройка доступов и полномочий сотрудников</p>
                </div>
                <AddRoleDialog onSuccess={fetchRoles} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => {
                    const style = getRoleConfig(role);
                    const Icon = style.icon;

                    return (
                        <div
                            key={role.id}
                            onClick={() => setPermissionsRole(role)}
                            className={`group relative rounded-[18px] border border-slate-200 overflow-hidden bg-gradient-to-br ${style.cardGradient} hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer h-[180px] flex flex-col`}
                        >
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-start gap-4 mb-3">
                                    <div className={`flex-shrink-0 h-11 w-11 rounded-[18px] bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform duration-300`}>
                                        <Icon className={`w-5 h-5 ${style.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-900 truncate tracking-normal group-hover:text-primary transition-colors">
                                            {role.name}
                                        </h3>
                                        <div className="mt-0.5 flex items-center gap-2">
                                            {role.isSystem && (
                                                <span className="text-[10px] font-bold  tracking-normal px-2 py-0.5 bg-slate-100 text-slate-500 rounded">System</span>
                                            )}
                                            {role.department && (
                                                <span className="text-[10px] font-bold  tracking-normal text-primary">
                                                    {role.department.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 -mr-2 -mt-2">
                                        {/* Actions hidden as per UI cleanup request */}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-1.5 h-[40px] overflow-hidden items-start">
                                        {Object.keys(role.permissions || {}).length > 0 ? (
                                            Object.keys(role.permissions || {}).slice(0, 3).map(p => (
                                                <span key={p} className="text-[10px] bg-white border border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded shadow-sm">
                                                    {p}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[11px] text-slate-400">Нет настроенных прав</span>
                                        )}
                                        {(Object.keys(role.permissions || {}).length || 0) > 3 && (
                                            <span className="text-[10px] text-slate-400 font-bold px-1 py-0.5">
                                                +{Object.keys(role.permissions || {}).length - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400  tracking-normal">
                                        <Key className="w-3.5 h-3.5" />
                                        <span>Разрешения</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {Object.keys(role.permissions || {}).length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <RolePermissionsDialog
                role={permissionsRole}
                isOpen={!!permissionsRole}
                onClose={() => {
                    setPermissionsRole(null);
                    fetchRoles();
                }}
            />

            <EditRoleDialog
                role={editingRole}
                isOpen={!!editingRole}
                onClose={() => setEditingRole(null)}
                onSuccess={fetchRoles}
            />

            <DeleteRoleDialog
                role={deletingRole}
                isOpen={!!deletingRole}
                onClose={() => setDeletingRole(null)}
                onConfirm={handleDeleteRole}
            />
        </div>
    );
}
