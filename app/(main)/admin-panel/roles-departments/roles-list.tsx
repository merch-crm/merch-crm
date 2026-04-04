"use client";

import { useState } from "react";
import { Shield, Key } from "lucide-react";
import { RoleDetail } from "@/lib/types";
import { RolePermissionsDialog } from "../roles/role-permissions-dialog";
import { EditRoleDialog } from "../roles/edit-role-dialog";
import { DeleteRoleDialog } from "../roles/delete-role-dialog";
import { deleteRole } from "../actions/roles.actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface RolesListProps {
    roles: RoleDetail[];
    loading: boolean;
    onRefresh: () => void;
}

export function RolesList({ roles, loading, onRefresh }: RolesListProps) {
    const [permissionsRole, setPermissionsRole] = useState<RoleDetail | null>(null);
    const [editingRole, setEditingRole] = useState<RoleDetail | null>(null);
    const [deletingRole, setDeletingRole] = useState<RoleDetail | null>(null);
    const { toast } = useToast();

    const handleDeleteRole = async (id: string, password?: string) => {
        const res = await deleteRole(id, password);
        if (res.success) {
            toast("Роль успешно удалена", "success");
            onRefresh();
        } else {
            toast(res.error, "error");
        }
    };

    const getRoleConfig = (role: RoleDetail) => {
        const activeColor = role.color || role.department?.color || "primary";
        return {
            gradient: `from-${activeColor}-400 to-${activeColor}-600`,
            cardGradient: `from-white via-${activeColor}-50/10 to-${activeColor}-100/5`,
            color: "text-white"
        };
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-[180px] rounded-[24px] bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map((role) => {
                    const style = getRoleConfig(role);
                    const permissionsCount = Object.keys(role.permissions || {}).length;

                    return (
                        <button 
                            key={role.id}
                            type="button"
                            onClick={() => setPermissionsRole(role)}
                            className={cn(
                                "group relative p-6 rounded-[24px] border border-slate-200 bg-white hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer h-[180px] flex flex-col justify-between overflow-hidden text-left w-full",
                                `bg-gradient-to-br ${style.cardGradient}`
                            )}
                        >
                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                     <div className={cn(
                                        "w-12 h-12 rounded-[18px] bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300",
                                        `bg-gradient-to-br ${style.gradient} text-white shadow-lg`
                                     )}>
                                        <Shield className="w-5 h-5" />
                                     </div>
                                     <div className="min-w-0">
                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors leading-tight truncate">
                                            {role.name}
                                        </h3>
                                        <div className="mt-1 flex items-center gap-2">
                                            {role.department && (
                                                <span className="text-xs font-black text-slate-400 bg-slate-100/50 px-2 py-0.5 rounded-lg border border-slate-200/40">
                                                    {role.department.name}
                                                </span>
                                            )}
                                            {role.isSystem && (
                                                <span className="text-xs font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/40">
                                                    System
                                                </span>
                                            )}
                                        </div>
                                     </div>
                                </div>
                                
                                <div className="text-right">
                                    <span className="text-xs font-black text-slate-400 block mb-0.5 opacity-60">Права</span>
                                    <span className="text-xl font-black text-slate-900 leading-none">
                                        {permissionsCount}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-auto relative z-10 flex items-center justify-between pt-4 border-t border-slate-100/60">
                                <div className="flex items-center gap-1.5 opacity-60">
                                     <Key className="w-3 h-3 text-slate-400" />
                                     <span className="text-xs font-black text-slate-500 ">Access Level</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setEditingRole(role); }}
                                        className="h-8 px-3 rounded-xl bg-slate-50 text-slate-500 text-xs font-black border border-slate-200 hover:bg-primary/5 hover:text-primary transition-all"
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            <RolePermissionsDialog
                role={permissionsRole}
                isOpen={!!permissionsRole}
                onClose={() => {
                    setPermissionsRole(null);
                    onRefresh();
                }}
            />

            <EditRoleDialog
                role={editingRole}
                isOpen={!!editingRole}
                onClose={() => setEditingRole(null)}
                onSuccess={onRefresh}
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
