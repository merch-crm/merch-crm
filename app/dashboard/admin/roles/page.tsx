"use client";

import { useEffect, useState } from "react";
import { getRoles, deleteRole } from "../actions";
import { Shield, Key, Palette, Printer, Scissors, Package, ShoppingBag, UserCog, LucideIcon, Trash2, Edit2 } from "lucide-react";
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
    } | null;
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

    const handleDeleteRole = async (id: string) => {
        const res = await deleteRole(id);
        if (res.error) {
            alert(res.error);
        } else {
            fetchRoles();
        }
    };

    const getRoleConfig = (roleName: string) => {
        const config: Record<string, { icon: LucideIcon; gradient: string; cardGradient: string; color: string }> = {
            "Администратор": {
                icon: Shield,
                gradient: "from-red-400 to-red-600",
                cardGradient: "from-white via-red-50/30 to-red-100/20",
                color: "text-white"
            },
            "Дизайнер": {
                icon: Palette,
                gradient: "from-purple-400 to-purple-600",
                cardGradient: "from-white via-purple-50/30 to-purple-100/20",
                color: "text-white"
            },
            "Отдел продаж": {
                icon: ShoppingBag,
                gradient: "from-emerald-400 to-emerald-600",
                cardGradient: "from-white via-emerald-50/30 to-emerald-100/20",
                color: "text-white"
            },
            "Печать": {
                icon: Printer,
                gradient: "from-orange-400 to-orange-600",
                cardGradient: "from-white via-orange-50/30 to-orange-100/20",
                color: "text-white"
            },
            "Вышивка": {
                icon: Scissors,
                gradient: "from-blue-400 to-blue-600",
                cardGradient: "from-white via-blue-50/30 to-blue-100/20",
                color: "text-white"
            },
            "Склад": {
                icon: Package,
                gradient: "from-slate-400 to-slate-600",
                cardGradient: "from-white via-slate-50/30 to-slate-100/20",
                color: "text-white"
            },
            "Управляющий": {
                icon: UserCog,
                gradient: "from-indigo-400 to-indigo-600",
                cardGradient: "from-white via-indigo-50/30 to-indigo-100/20",
                color: "text-white"
            },
        };
        return config[roleName] || {
            icon: UserCog,
            gradient: "from-slate-400 to-slate-600",
            cardGradient: "from-white via-slate-50/30 to-slate-100/20",
            color: "text-white"
        };
    };

    if (loading) return <div className="text-slate-400 p-12 text-center">Загрузка ролей системы...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Shield className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">Роли системы</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Всего ролей: {roles.length}</p>
                    </div>
                </div>
                <AddRoleDialog onSuccess={fetchRoles} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => {
                    const style = getRoleConfig(role.name);
                    const Icon = style.icon;

                    return (
                        <div
                            key={role.id}
                            onClick={() => setPermissionsRole(role)}
                            className={`group relative rounded-xl border border-slate-200 overflow-hidden bg-gradient-to-br ${style.cardGradient} hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer h-[180px] flex flex-col`}
                        >
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-start gap-4 mb-3">
                                    <div className={`flex-shrink-0 h-11 w-11 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center shadow-lg shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-300`}>
                                        <Icon className={`w-5 h-5 ${style.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
                                            {role.name}
                                        </h3>
                                        <div className="mt-0.5">
                                            {role.department ? (
                                                <span className={`text-[10px] font-bold uppercase tracking-widest text-indigo-500`}>
                                                    {role.department.name}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Системная роль</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 -mr-2 -mt-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingRole(role);
                                            }}
                                            className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {!role.isSystem && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingRole(role);
                                                }}
                                                className="p-1.5 text-slate-300 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-1.5 h-[40px] overflow-hidden items-start">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {Object.keys((role.permissions as any) || {}).length > 0 ? (
                                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                            Object.keys((role.permissions as any) || {}).slice(0, 3).map(p => (
                                                <span key={p} className="text-[10px] bg-white border border-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded shadow-sm">
                                                    {p}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[11px] text-slate-400 italic">Нет настроенных прав</span>
                                        )}
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(Object.keys((role.permissions as any) || {}).length || 0) > 3 && (
                                            <span className="text-[10px] text-slate-400 font-bold px-1 py-0.5">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                +{(Object.keys((role.permissions as any) || {}).length || 0) - 3}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Key className="w-3.5 h-3.5" />
                                        <span>Разрешения</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {Object.keys((role.permissions as any) || {}).length || 0}
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
