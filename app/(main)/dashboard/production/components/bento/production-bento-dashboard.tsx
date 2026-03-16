"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import { cn } from "@/lib/utils";

import { HeroProductionCard } from "./hero-production-card";
import { StatsGrid } from "./stats-grid";
import { QuickAccessGrid } from "./quick-access-grid";
import { HeatmapCard } from "./heatmap-card";
import { TopApplicationTypesCard } from "./top-application-types-card";
import { WeeklyOutputChart } from "./weekly-output-chart";
import { LineLoadChart } from "./line-load-chart";
import { UrgentTasksCard } from "./urgent-tasks-card";
import { DeadlineCalendarCard } from "./deadline-calendar-card";
import { DefectStatsCard } from "./defect-stats-card";
import { StaffOnShiftCard } from "./staff-on-shift-card";
import { MaterialsLowCard } from "./materials-low-card";
import { EquipmentStatusCard } from "./equipment-status-card";
import { CalculatorsGrid } from "./calculators-grid";
import { ProductionBoard } from "../../production-board";
import { ProductionTasksWidget } from "../production-tasks-widget";

import type { ProductionBentoDashboardData, UrgentTask, EquipmentStatusItem } from "../../types";

interface ProductionBentoDashboardProps {
  data: ProductionBentoDashboardData;
  className?: string;
}

export function ProductionBentoDashboard({
  data,
  className,
}: ProductionBentoDashboardProps) {
  const { setCustomTrail } = useBreadcrumbs();

  useEffect(() => {
    setCustomTrail([{ label: "Производство", href: "" }]);
    return () => setCustomTrail(null);
  }, [setCustomTrail]);

  if (!data) return null;

  // Приводим данные к формату, ожидаемому компонентами
  const conversionForStats = {
    ...data.conversion,
    onTimePercentage: data.conversion.onTimePercentage ?? 0,
    trend: data.conversion.trend ?? 0,
    sparklineData: data.conversion.sparklineData ?? [],
  };

  const shiftForStats = {
    ...data.shiftEfficiency,
    current: data.shiftEfficiency.current ?? data.shiftEfficiency.progress,
    target: data.shiftEfficiency.target ?? 100,
    completedTasks: data.shiftEfficiency.completedTasks ?? data.shiftEfficiency.completedItems,
    plannedTasks: data.shiftEfficiency.plannedTasks ?? data.shiftEfficiency.totalItems,
    timeElapsed: data.shiftEfficiency.timeElapsed ?? 0,
  };

  const baseStatsForGrid = data.baseStats ?? {
    inQueue: data.conversion.inQueue,
    inProgress: data.conversion.inProgress,
    paused: data.conversion.paused,
    completedToday: data.conversion.completedToday,
    overdue: data.conversion.overdue ?? 0,
    activeLines: data.conversion.activeLines ?? 0,
    activeStaff: data.conversion.activeStaff ?? 0,
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Заголовок + Кнопка */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Производство</h1>
          <p className="text-sm font-medium text-slate-500">
            Центральный узел управления производственными процессами
          </p>
        </div>
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
          <Link href="/dashboard/production/tasks/new">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Создать задачу</span>
            <span className="sm:hidden">Создать</span>
          </Link>
        </Button>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 1: Герой + Внимание */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-12 gap-3">
        <HeroProductionCard stats={data.hero} className="col-span-12 lg:col-span-8" />
        <div className="col-span-12 lg:col-span-4 h-full">
            <ProductionTasksWidget />
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 2: Статистика (Конверсия, Эффективность, Готово сегодня) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <StatsGrid
        conversion={conversionForStats}
        efficiency={shiftForStats}
        baseStats={baseStatsForGrid}
      />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 3: Быстрый доступ */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <QuickAccessGrid stats={baseStatsForGrid} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 4: Тепловая карта + Топ типов нанесения */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <HeatmapCard data={data.heatmap} className="lg:col-span-8" />
        <TopApplicationTypesCard data={data.topApplicationTypes} className="lg:col-span-4" />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 5: Выработка за неделю + Загрузка линий */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <WeeklyOutputChart data={data.dailyOutput} />
        <LineLoadChart data={data.lineLoad} />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 6: Срочные задачи + Календарь дедлайнов */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <UrgentTasksCard tasks={(data.urgentTasks || []) as UrgentTask[]} className="lg:col-span-5" />
        <DeadlineCalendarCard data={data.deadlineCalendar} className="lg:col-span-7" />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 7: Брак + Команда на смене */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <DefectStatsCard stats={data.defects} className="lg:col-span-4" />
        <StaffOnShiftCard
          staff={data.staffLoad?.staff ?? []}
          averageLoad={data.staffLoad?.averageLoad}
          averageEfficiency={data.staffLoad?.averageEfficiency}
          className="lg:col-span-8"
        />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 8: Материалы + Оборудование */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <MaterialsLowCard materials={data.materialAlerts} />
        <EquipmentStatusCard equipment={(data.equipmentStatus || []) as EquipmentStatusItem[]} />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 9: Kanban Доска */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="crm-card !bg-slate-50/50 p-6 overflow-x-auto min-h-[600px]">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Доска производства</h3>
        <ProductionBoard items={data.kanbanItems || []} />
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* Ряд 10: Калькуляторы */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <CalculatorsGrid />
    </div>
  );
}
