"use client";

import { useEffect, useState, useCallback } from "react";
import { getDepartments, deleteDepartment } from "../actions/departments.actions";;
import { Building, Trash2, Users, Crown, ShoppingBag, Cog, Palette, LucideIcon, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

import { DeleteDepartmentDialog } from "./delete-department-dialog";
import { DepartmentSettingsDialog } from "./department-settings-dialog";

interface Department {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    isSystem: boolean;
    userCount?: number;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; gradient: string; iconBg: string; iconColor: string }> = {
    indigo: { bg: "bg-primary/5", text: "text-primary", border: "border-primary/20", gradient: "from-primary/5 to-primary/10", iconBg: "bg-primary/10", iconColor: "text-primary" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", gradient: "from-purple-50/50 to-purple-100/30", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", gradient: "from-rose-50/50 to-rose-100/30", iconBg: "bg-rose-100", iconColor: "text-rose-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", gradient: "from-orange-50/50 to-orange-100/30", iconBg: "bg-orange-100", iconColor: "text-orange-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", gradient: "from-amber-50/50 to-amber-100/30", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", gradient: "from-emerald-50/50 to-emerald-100/30", iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
    sky: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100", gradient: "from-sky-50/50 to-sky-100/30", iconBg: "bg-sky-100", iconColor: "text-sky-600" },
    slate: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200", gradient: "from-slate-50/50 to-slate-100/30", iconBg: "bg-slate-100", iconColor: "text-slate-600" },
};

export function DepartmentsTable() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const { toast } = useToast();

    const fetchDepartments = useCallback((isInitial = true) => {
        // if (isInitial) setLoading(true); // Optimistic updates, relying on initial state for first load
        getDepartments().then(res => {
            if (res.data) {
                setDepartments(res.data as Department[]);
            }
            if (isInitial) setLoading(false);
        }).catch(err => {
            console.error('Failed to fetch departments:', err);
            if (isInitial) setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchDepartments(true);
        const interval = setInterval(() => fetchDepartments(false), 15000);
        return () => clearInterval(interval);
    }, [fetchDepartments]);

    const handleDeleteClick = (dept: Department) => {
        setDepartmentToDelete(dept);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async (id: string, password?: string) => {
        const res = await deleteDepartment(id, password);
        if (res.error) {
            toast(res.error, "error");
        } else {
            toast("Отдел успешно удален", "success");
            fetchDepartments();
        }
        setDeleteDialogOpen(false);
        setDepartmentToDelete(null);
    };

    const getDepartmentConfig = (deptName: string, deptColor: string | null) => {
        const icons: Record<string, LucideIcon> = {
            "Руководство": Crown,
            "Отдел продаж": ShoppingBag,
            "Производство": Cog,
            "Дизайн": Palette,
        };

        const Icon = icons[deptName] || Building;
        const colorConfig = COLOR_MAP[deptColor || "indigo"] || COLOR_MAP.indigo;

        return { Icon, ...colorConfig };
    };

    if (loading) return <div className="text-slate-400 p-[--padding-xl] text-center text-sm font-medium">Загрузка отделов...</div>;

    return (
        <div className="space-y-3 pb-20">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {departments.map((dept) => {
                    const config = getDepartmentConfig(dept.name, dept.color);
                    const Icon = config.Icon;

                    return (
                        <div role="button" tabIndex={0}
                            key={dept.id}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => setSelectedDepartment(dept)}
                            className={`group relative rounded-[18px] border border-slate-200 overflow-hidden bg-gradient-to-br ${config.gradient} hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all h-[200px] flex flex-col cursor-pointer active:scale-[0.98]`}
                        >
                            <div className="p-7 flex flex-col h-full">
                                <div className="flex items-start gap-3 mb-4">
                                    <div className={`flex-shrink-0 h-14 w-14 rounded-[18px] ${config.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-white shadow-sm`}>
                                        <Icon className={`w-7 h-7 ${config.iconColor}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xl font-bold text-slate-900 truncate">{dept.name}</h4>
                                        <p className={`text-xs font-bold mt-1 ${config.iconColor}`}>Подразделение</p>
                                    </div>
                                    <div className="flex flex-col gap-1 -mr-3 -mt-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDepartment(dept);
                                            }}
                                            className="p-2 h-10 w-10 text-slate-300 hover:text-primary transition-colors rounded-[18px] hover:bg-white shadow-sm border-none"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                        </Button>
                                        {!dept.isSystem && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteClick(dept);
                                                }}
                                                className="p-2 h-10 w-10 text-slate-300 hover:text-red-600 transition-colors rounded-[18px] hover:bg-white shadow-sm border-none"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed h-[40px]">
                                        {dept.description || "Административное управление основной деятельностью компании"}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 ">
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
                    <div className="col-span-full py-16 bg-slate-50/50 rounded-[18px] border border-dashed border-slate-200 text-center">
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

            <DepartmentSettingsDialog
                department={selectedDepartment}
                isOpen={!!selectedDepartment}
                onClose={() => setSelectedDepartment(null)}
                onSuccess={fetchDepartments}
            />
        </div>
    );
}
