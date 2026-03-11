"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
    Printer,
    Scissors,
    Flame,
    Box,
    Settings,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { EquipmentCard } from "./components/equipment-card";
import { EquipmentFormDialog } from "./components/equipment-form-dialog";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import type { Equipment, ApplicationType } from "@/lib/schema/production";

interface EquipmentStats {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    needsMaintenance: number;
}

interface EquipmentPageClientProps {
    initialEquipment: Equipment[];
    initialStats: EquipmentStats | null;
    applicationTypes: ApplicationType[];
}

const categoryConfig = {
    printer: { label: "Принтеры", icon: Printer, color: "bg-blue-500" },
    cutter: { label: "Резаки", icon: Scissors, color: "bg-orange-500" },
    heat_press: { label: "Термопрессы", icon: Flame, color: "bg-red-500" },
    embroidery: { label: "Вышивальные", icon: Box, color: "bg-purple-500" },
    laser: { label: "Лазерные", icon: Settings, color: "bg-green-500" },
    other: { label: "Прочее", icon: Box, color: "bg-gray-500" },
};

const statusConfig = {
    active: { label: "Активно", icon: CheckCircle, color: "text-green-600" },
    maintenance: { label: "На обслуживании", icon: Wrench, color: "text-yellow-600" },
    inactive: { label: "Неактивно", icon: XCircle, color: "text-gray-500" },
    repair: { label: "В ремонте", icon: AlertTriangle, color: "text-red-600" },
};

export function EquipmentPageClient({
    initialEquipment,
    initialStats,
    applicationTypes,
}: EquipmentPageClientProps) {
    const _router = useRouter();
    const { setCustomTrail } = useBreadcrumbs();

    useEffect(() => {
        setCustomTrail([
            { label: "Производство", href: "/dashboard/production" },
            { label: "Оборудование", href: "" },
        ]);
        return () => setCustomTrail(null);
    }, [setCustomTrail]);

    const [equipment, setEquipment] = useState(initialEquipment);
    const [stats, setStats] = useState(initialStats);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const filteredEquipment = useMemo(() => {
        return equipment.filter((item) => {
            const matchesSearch =
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.code?.toLowerCase().includes(search.toLowerCase()) ||
                item.brand?.toLowerCase().includes(search.toLowerCase()) ||
                item.model?.toLowerCase().includes(search.toLowerCase());

            const matchesCategory =
                categoryFilter === "all" || item.category === categoryFilter;

            const matchesStatus =
                statusFilter === "all" || item.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [equipment, search, categoryFilter, statusFilter]);

    const handleCreated = (newEquipment: Equipment) => {
        setEquipment((prev) => [...prev, newEquipment]);
        if (stats) {
            setStats({
                ...stats,
                total: stats.total + 1,
                byStatus: {
                    ...stats.byStatus,
                    [newEquipment.status]: (stats.byStatus[newEquipment.status] || 0) + 1,
                },
                byCategory: {
                    ...stats.byCategory,
                    [newEquipment.category]: (stats.byCategory[newEquipment.category] || 0) + 1,
                },
            });
        }
        toast.success("Оборудование добавлено");
        setIsCreateOpen(false);
    };

    const handleUpdated = (updated: Equipment) => {
        setEquipment((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
        );
        toast.success("Оборудование обновлено");
    };

    const handleDeleted = (id: string) => {
        const deleted = equipment.find((item) => item.id === id);
        setEquipment((prev) => prev.filter((item) => item.id !== id));
        if (stats && deleted) {
            setStats({
                ...stats,
                total: stats.total - 1,
                byStatus: {
                    ...stats.byStatus,
                    [deleted.status]: Math.max(0, (stats.byStatus[deleted.status] || 0) - 1),
                },
                byCategory: {
                    ...stats.byCategory,
                    [deleted.category]: stats.byCategory[deleted.category] - 1,
                },
            });
        }
        toast.success("Оборудование удалено");
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Оборудование</h1>
                    <p className="text-muted-foreground">
                        Управление производственным оборудованием
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <div className="text-sm text-muted-foreground">Всего единиц</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-2xl font-bold">{stats.byStatus.active || 0}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Активно</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-yellow-600" />
                                <span className="text-2xl font-bold">{stats.byStatus.maintenance || 0}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">На обслуживании</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-gray-500" />
                                <span className="text-2xl font-bold">{stats.byStatus.inactive || 0}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Неактивно</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по названию, коду, бренду..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select
                    options={[
                        { id: "all", title: "Все категории" },
                        ...Object.entries(categoryConfig).map(([key, { label }]) => ({
                            id: key,
                            title: label,
                        })),
                    ]}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    className="w-full sm:w-48"
                />
                <Select
                    options={[
                        { id: "all", title: "Все статусы" },
                        ...Object.entries(statusConfig).map(([key, { label }]) => ({
                            id: key,
                            title: label,
                        })),
                    ]}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className="w-full sm:w-48"
                />
            </div>

            {/* Equipment Grid */}
            {filteredEquipment.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Box className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Оборудование не найдено</h3>
                        <p className="text-muted-foreground mb-4">
                            {search || categoryFilter !== "all" || statusFilter !== "all"
                                ? "Попробуйте изменить параметры поиска"
                                : "Добавьте первое оборудование"}
                        </p>
                        {!search && categoryFilter === "all" && statusFilter === "all" && (
                            <Button onClick={() => setIsCreateOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Добавить оборудование
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredEquipment.map((item) => (
                        <EquipmentCard
                            key={item.id}
                            equipment={item}
                            applicationTypes={applicationTypes}
                            categoryConfig={categoryConfig}
                            statusConfig={statusConfig}
                            onUpdated={handleUpdated}
                            onDeleted={handleDeleted}
                        />
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <EquipmentFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                applicationTypes={applicationTypes}
                onSuccess={handleCreated}
            />
        </div>
    );
}
