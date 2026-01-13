"use client";

import { useEffect, useState } from "react";
import { getDepartments, deleteDepartment } from "../actions";
import { Building, Trash2, Users, Crown, ShoppingBag, Cog, Palette, LucideIcon, Edit2 } from "lucide-react";
import { AddDepartmentDialog } from "./add-department-dialog";
import { DeleteDepartmentDialog } from "./delete-department-dialog";
import { EditDepartmentDialog } from "./edit-department-dialog";

interface Department {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    userCount?: number;
}

export function DepartmentsTable() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
    const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);

    const fetchDepartments = () => {
        // setLoading(true); // Remove to avoid sync setState in useEffect
        getDepartments().then(res => {
            if (res.data) setDepartments(res.data as Department[]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleDeleteClick = (dept: Department) => {
        setDepartmentToDelete(dept);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async (id: string) => {
        const res = await deleteDepartment(id);
        if (res.error) {
            alert(res.error);
        } else {
            fetchDepartments();
        }
        setDeleteDialogOpen(false);
        setDepartmentToDelete(null);
    };

    const getDepartmentConfig = (deptName: string) => {
        const config: Record<string, { icon: LucideIcon; gradient: string; iconBg: string; iconColor: string }> = {
            "Руководство": {
                icon: Crown,
                gradient: "from-rose-50/50 to-rose-100/30",
                iconBg: "bg-rose-100",
                iconColor: "text-rose-600"
            },
            "Отдел продаж": {
                icon: ShoppingBag,
                gradient: "from-emerald-50/50 to-emerald-100/30",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-600"
            },
            "Производство": {
                icon: Cog,
                gradient: "from-slate-50/50 to-slate-100/30",
                iconBg: "bg-slate-100",
                iconColor: "text-slate-600"
            },
            "Дизайн": {
                icon: Palette,
                gradient: "from-purple-50/50 to-purple-100/30",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-600"
            },
        };
        return config[deptName] || {
            icon: Building,
            gradient: "from-indigo-50/50 to-indigo-100/30",
            iconBg: "bg-indigo-100",
            iconColor: "text-indigo-600"
        };
    };

    if (loading) return <div className="text-slate-400 p-12 text-center text-sm font-medium">Загрузка отделов...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">Отделы компании</h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Всего подразделений: {departments.length}</p>
                    </div>
                </div>
                <AddDepartmentDialog onSuccess={fetchDepartments} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => {
                    const config = getDepartmentConfig(dept.name);
                    const Icon = config.icon;

                    return (
                        <div
                            key={dept.id}
                            className={`group relative rounded-xl border border-slate-200 overflow-hidden bg-gradient-to-br ${config.gradient} hover:border-indigo-400 hover:shadow-lg transition-all h-[180px] flex flex-col`}
                        >
                            <div className="p-6 flex flex-col h-full">
                                <div className="flex items-start gap-4 mb-3">
                                    <div className={`flex-shrink-0 h-11 w-11 rounded-lg ${config.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                                        <Icon className={`w-5 h-5 ${config.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-lg font-bold text-slate-900 truncate tracking-tight">{dept.name}</h4>
                                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Отдел</p>
                                    </div>
                                    <div className="flex flex-col gap-1 -mr-2 -mt-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDepartmentToEdit(dept);
                                            }}
                                            className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClick(dept);
                                            }}
                                            className="p-1.5 text-slate-300 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed h-[40px]">
                                        {dept.description || "Административное управление основной деятельностью компании"}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>Сотрудники</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">
                                        {dept.userCount || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {departments.length === 0 && (
                    <div className="col-span-full py-16 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
                        <Building className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">Отделы еще не созданы</p>
                        <p className="text-slate-400 text-sm mt-1">Используйте кнопку выше, чтобы добавить первый отдел</p>
                    </div>
                )}
            </div>

            <DeleteDepartmentDialog
                department={departmentToDelete}
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setDepartmentToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
            />

            <EditDepartmentDialog
                department={departmentToEdit}
                isOpen={!!departmentToEdit}
                onClose={() => setDepartmentToEdit(null)}
                onSuccess={fetchDepartments}
            />
        </div>
    );
}
