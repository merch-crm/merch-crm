"use client";

import { useState } from "react";
import { Building, Users, Settings, Trash2 } from "lucide-react";
import { DepartmentDetail } from "@/lib/types";
import { DepartmentSettingsDialog } from "../departments/department-settings-dialog";
import { DeleteDepartmentDialog } from "../departments/delete-department-dialog";
import { deleteDepartment } from "../actions/departments.actions";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface DepartmentsListProps {
    departments: DepartmentDetail[];
    loading: boolean;
    onRefresh: () => void;
}

export function DepartmentsList({ departments, loading, onRefresh }: DepartmentsListProps) {
    const [editingDept, setEditingDept] = useState<DepartmentDetail | null>(null);
    const [deletingDept, setDeletingDept] = useState<DepartmentDetail | null>(null);
    const { toast } = useToast();

    const handleDeleteDept = async (id: string, _password?: string) => {
        const res = await deleteDepartment(id);
        if (res.success) {
            toast("Отдел успешно удален", "success");
            onRefresh();
        } else {
            toast(res.error, "error");
        }
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {departments.map((dept) => {
                    const activeColor = dept.color || "primary";
                    const styles = {
                        bg: `bg-${activeColor}-50/30`,
                        border: `border-${activeColor}-100/60`,
                        iconBg: `bg-gradient-to-br from-${activeColor}-400 to-${activeColor}-600`,
                        text: `text-${activeColor}-600`
                    };

                    return (
                        <div 
                            key={dept.id}
                            className={cn(
                                "group relative p-6 rounded-[24px] border border-slate-200 bg-white hover:border-primary/40 hover:shadow-xl transition-all h-[200px] flex flex-col justify-between overflow-hidden",
                                `hover:bg-gradient-to-br from-white via-${activeColor}-50/10 to-${activeColor}-100/5`
                            )}
                        >
                            <div className="flex items-start justify-between relative z-10 w-full">
                                <div className={cn(
                                    "w-12 h-12 rounded-[18px] flex items-center justify-center text-white shadow-lg shrink-0",
                                    styles.iconBg
                                )}>
                                    <Building className="w-6 h-6" />
                                </div>
                                
                                <div className="text-right">
                                    <span className="text-xs font-black text-slate-400 block mb-1 opacity-60">Сотрудников</span>
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-2xl font-black text-slate-900 leading-none">
                                            {dept.userCount || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors leading-tight mb-1 truncate">
                                    {dept.name}
                                </h3>
                                <p className="text-xs font-medium text-slate-400 line-clamp-1 truncate">
                                    {dept.description || "Нет описания"}
                                </p>
                            </div>

                            <div className="mt-auto relative z-10 flex items-center justify-between pt-4 border-t border-slate-100/60">
                                <div className="flex gap-2">
                                     <button 
                                        type="button"
                                        onClick={() => setEditingDept(dept)}
                                        className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-primary/5 hover:text-primary transition-all"
                                     >
                                        <Settings className="w-4 h-4" />
                                     </button>
                                     <button 
                                        type="button"
                                        onClick={() => setDeletingDept(dept)}
                                        className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                </div>
                                <div className="text-xs font-black text-slate-400 bg-slate-100/50 px-2.5 py-1 rounded-lg border border-slate-200/40">
                                    {activeColor}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <DepartmentSettingsDialog
                department={editingDept}
                isOpen={!!editingDept}
                onClose={() => setEditingDept(null)}
                onSuccess={onRefresh}
            />

            <DeleteDepartmentDialog
                department={deletingDept}
                isOpen={!!deletingDept}
                onClose={() => setDeletingDept(null)}
                onConfirm={handleDeleteDept}
            />
        </div>
    );
}
