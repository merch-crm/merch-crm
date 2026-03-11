"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Users, UserCheck, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

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
        <div className="p-6 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Сотрудники производства</h1>
                    <p className="text-muted-foreground">
                        Управление персоналом и назначение задач
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить сотрудника
                </Button>
            </div>

            <ProductionNav />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Всего сотрудников
                    </p>
                    <p className="text-2xl font-bold">{staff.length}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Активных
                    </p>
                    <p className="text-2xl font-bold text-green-600">{activeStaffCount}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Задач в работе
                    </p>
                    <p className="text-2xl font-bold">{totalActiveTasks}</p>
                </Card>
                <Card className="p-4">
                    <p className="text-sm text-muted-foreground">Выполнено задач</p>
                    <p className="text-2xl font-bold">{totalCompletedTasks}</p>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск по имени или должности..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Grid */}
            {filteredStaff.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                <Card className="p-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Нет сотрудников</h3>
                    <p className="mt-2 text-muted-foreground">
                        {search ? "Попробуйте изменить поисковый запрос" : "Добавьте первого сотрудника"}
                    </p>
                    {!search && (
                        <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить сотрудника
                        </Button>
                    )}
                </Card>
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
