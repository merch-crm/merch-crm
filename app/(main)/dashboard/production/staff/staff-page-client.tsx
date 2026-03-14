"use client";

import { useState, useEffect } from "react";
import { Plus, Users, UserCheck, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SearchInput } from "@/components/ui/search-input";

import { ProductionNav } from "../components/production-nav";
import { StaffCard } from "./components/staff-card";
import { StaffFormDialog } from "./components/staff-form-dialog";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { ProductionStaffWithStats } from "../actions/staff-actions";
import { ProductionLine } from "../actions/line-actions";
import { ProductionStaff, ApplicationType } from "@/lib/schema/production";

interface StaffPageClientProps {
    initialStaff: ProductionStaffWithStats[];
    lines: ProductionLine[];
    applicationTypes: ApplicationType[];
}

export function StaffPageClient({
    initialStaff,
    lines,
    applicationTypes,
}: StaffPageClientProps) {
    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setCustomTrail([
            { label: "Производство", href: "/dashboard/production" },
            { label: "Сотрудники", href: "" },
        ]);
        return () => setCustomTrail(null);
    }, [setCustomTrail]);

    const [staff, setStaff] = useState<ProductionStaffWithStats[]>(initialStaff);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const filteredStaff = staff.filter((member) =>
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        (member.position || "").toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateSuccess = (newMember: ProductionStaff) => {
        setStaff([...staff, { ...newMember, stats: { active: 0, completed: 0, total: 0 } } as ProductionStaffWithStats]);
        setIsCreateOpen(false);
        toast.success("Сотрудник добавлен");
    };

    const handleUpdate = (updated: ProductionStaff) => {
        setStaff(staff.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
    };

    const handleDelete = (id: string) => {
        setStaff(staff.filter((s) => s.id !== id));
    };

    // Статистика
    const activeStaffCount = staff.filter((s) => s.isActive).length;
    const totalActiveTasks = staff.reduce((sum, s) => sum + s.stats.active, 0);
    const totalCompletedTasks = staff.reduce((sum, s) => sum + s.stats.completed, 0);

    return (
        <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Сотрудники производства</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Управление персоналом и назначение задач
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить сотрудника
                </Button>
            </div>

            <ProductionNav />

            {/* Stats Overview (Bento Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="crm-card flex flex-col justify-between">
                    <div className="flex items-center gap-3 text-slate-500 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold tracking-tight">Всего сотрудников</span>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-slate-900">{staff.length}</span>
                    </div>
                </div>

                <div className="crm-card flex flex-col justify-between">
                    <div className="flex items-center gap-3 text-emerald-500 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <span className="text-xs font-bold tracking-tight">Активных</span>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-slate-900">{activeStaffCount}</span>
                    </div>
                </div>

                <div className="crm-card flex flex-col justify-between">
                    <div className="flex items-center gap-3 text-amber-500 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <Briefcase className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold tracking-tight">Задач в работе</span>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-slate-900">{totalActiveTasks}</span>
                    </div>
                </div>

                <div className="crm-card flex flex-col justify-between">
                    <div className="flex items-center gap-3 text-indigo-500 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <UserCheck className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold tracking-tight">Выполнено</span>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-slate-900">{totalCompletedTasks}</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <SearchInput
                    placeholder="Поиск по имени или должности..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            {filteredStaff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredStaff.map((member) => (
                        <StaffCard
                            key={member.id}
                            member={member}
                            lines={lines}
                            applicationTypes={applicationTypes}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="crm-card p-12 py-20 text-center flex flex-col items-center border-dashed border-2 bg-slate-50/50">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Сотрудники не найдены</h3>
                    <p className="mt-2 text-slate-500 max-w-xs mx-auto text-sm">
                        {search ? "Попробуйте изменить параметры поиска." : "Вы еще не добавили ни одного сотрудника производства."}
                    </p>
                    {!search && (
                        <Button 
                            className="mt-8 rounded-xl px-8 h-12 shadow-lg shadow-primary/20" 
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить сотрудника
                        </Button>
                    )}
                </div>
            )}

            {/* Create Dialog */}
            <StaffFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                lines={lines}
                applicationTypes={applicationTypes}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
