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
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { EquipmentCard } from "./components/equipment-card";
import { EquipmentFormDialog } from "./components/equipment-form-dialog";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { ProductionNav } from "../components/production-nav";
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
          [deleted.category]: Math.max(0, (stats.byCategory[deleted.category] || 0) - 1),
        },
      });
    }
    toast.success("Оборудование удалено");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Оборудование</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Управление производственным оборудованием
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4 mr-2" />
          Добавить оборудование
        </Button>
      </div>

      <ProductionNav />

      {/* Stats Overview (Bento Style) */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="crm-card flex flex-col justify-between">
            <div className="flex items-center gap-3 text-slate-500 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Box className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold ">Всего единиц</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-slate-900">{stats.total}</span>
            </div>
          </div>

          <div className="crm-card flex flex-col justify-between">
            <div className="flex items-center gap-3 text-emerald-500 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold ">Активно</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-slate-900">{stats.byStatus.active || 0}</span>
            </div>
          </div>

          <div className="crm-card flex flex-col justify-between">
            <div className="flex items-center gap-3 text-amber-500 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold ">На обслуживании</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-slate-900">{stats.byStatus.maintenance || 0}</span>
            </div>
          </div>

          <div className="crm-card flex flex-col justify-between">
            <div className="flex items-center gap-3 text-slate-400 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold ">Неактивно</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-slate-900">{stats.byStatus.inactive || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters / Toolbar */}
      <div className="flex flex-col xl:flex-row gap-3">
        <div className="relative flex-1 group/search">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/search:text-primary transition-colors duration-300" />
          <Input placeholder="Поиск по названию, коду, бренду..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 bg-white border-slate-100 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary/30 transition-all duration-300"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select options={[ { id: "all", title: "Все категории" }, ...Object.entries(categoryConfig).map(([key, { label }]) => ({
                id: key,
                title: label,
              })),
            ]}
            value={categoryFilter}
            onChange={setCategoryFilter}
            className="w-full sm:w-56 h-11"
          />
          <Select options={[ { id: "all", title: "Все статусы" }, ...Object.entries(statusConfig).map(([key, { label }]) => ({
                id: key,
                title: label,
              })),
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full sm:w-56 h-11"
          />
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="crm-card p-12 py-20 text-center flex flex-col items-center border-dashed border-2 bg-slate-50/50">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Box className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Оборудование не найдено</h3>
          <p className="mt-2 text-slate-500 max-w-xs mx-auto text-sm">
            {search || categoryFilter !== "all" || statusFilter !== "all"
              ? "Попробуйте изменить параметры поиска"
              : "Вы еще не добавили ни одной единицы оборудования."}
          </p>
          {!search && categoryFilter === "all" && statusFilter === "all" && (
            <Button className="mt-8 rounded-xl px-8 h-12 shadow-lg shadow-primary/20" onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить оборудование
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredEquipment.map((item) => (
            <EquipmentCard key={item.id} equipment={item} applicationTypes={applicationTypes} categoryConfig={categoryConfig} statusConfig={statusConfig} onUpdated={handleUpdated} onDeleted={handleDeleted} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <EquipmentFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} applicationTypes={applicationTypes} onSuccess={handleCreated} />
    </div>
  );
}
