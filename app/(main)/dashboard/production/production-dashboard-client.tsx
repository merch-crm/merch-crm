"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import React, { useEffect } from "react";
import { ru } from "date-fns/locale";
import { useIsClient } from "@/hooks/use-is-client";
import {
  Plus,
  ListTodo,
  Layers,
  Users,
  Settings,
  Wrench,
  Clock,
  PlayCircle,
  Pause,
  CheckCircle,
  AlertTriangle,
  Factory,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { pluralize } from "@/lib/pluralize";
import { ProductionWidgets } from "./production-widgets";
import {
  QuickActionCard,
  SectionHeader,
  EmptyWidget,
  LineLoadChart,
  DailyOutputChart,
} from "@/components/dashboard";
import { useBreadcrumbs } from "@/components/layout/breadcrumbs-context";
import type {
  ProductionStats,
  ProductionTaskSummary,
  LineLoad,
  EquipmentStatus,
  StaffOnShift,
} from "./actions/production-dashboard-actions";

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  pending: { label: "Ожидает", color: "bg-gray-500", icon: Clock },
  in_progress: { label: "В работе", color: "bg-blue-500", icon: PlayCircle },
  paused: { label: "Пауза", color: "bg-yellow-500", icon: Pause },
  completed: { label: "Завершено", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Отменено", color: "bg-red-500", icon: AlertTriangle },
};

const equipmentStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Активно", color: "text-green-600" },
  maintenance: { label: "На ТО", color: "text-yellow-600" },
  repair: { label: "В ремонте", color: "text-red-600" },
  inactive: { label: "Неактивно", color: "text-gray-500" },
};

interface ProductionDashboardClientProps {
  stats: ProductionStats | null;
  tasksByLine: LineLoad[];
  urgentTasks: ProductionTaskSummary[];
  equipmentStatus: EquipmentStatus[];
  staffOnShift: StaffOnShift[];
  dailyOutput: { date: string; completed: number; quantity: number }[];
}

export function ProductionDashboardClient({
  stats,
  tasksByLine,
  urgentTasks,
  equipmentStatus,
  staffOnShift,
  dailyOutput,
}: ProductionDashboardClientProps) {
  const { setCustomTrail } = useBreadcrumbs();
  const isClient = useIsClient();

  useEffect(() => {
    setCustomTrail([{ label: "Производство", href: "" }]);
    return () => setCustomTrail(null);
  }, [setCustomTrail]);

  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (isClient) {
      setNow(new Date()); // suppressHydrationWarning
    }
  }, [isClient]);

  const isOverdue = (dueDate: string | null) => {
    if (!isClient || !dueDate || !now) return false;
    return new Date(dueDate) < now;
  };

  if (!isClient) {
    return <div className="min-h-screen bg-slate-50/30 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Производство</h1>
          <p className="text-sm font-medium text-slate-500">
            Центральный узел управления производственными процессами
          </p>
        </div>
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
          <Link href="/dashboard/production/tasks/new">
            <Plus className="h-4 w-4 mr-2" />
            Создать задачу
          </Link>
        </Button>
      </div>

      {/* Production Widgets (Bento) */}
      {stats && (
        <ProductionWidgets stats={{ active: stats.inProgress, urgent: stats.overdue, efficiency: 85, completedToday: stats.completedToday }} />
      )}

      {/* Charts View (Synchronized with Warehouse style) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <LineLoadChart data={tasksByLine} title="Загрузка линий" />
        <DailyOutputChart data={dailyOutput} title="Выработка за неделю" />
      </div>

      {/* Quick Actions Panel */}
      <div className="crm-card bg-slate-50/50">
        <SectionHeader title="Управление разделами" className="mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <QuickActionCard title="Все задачи" description={`${(stats?.inQueue || 0) + (stats?.inProgress || 0)} активных`} icon={ListTodo} href="/dashboard/production/tasks" iconColor="text-blue-600" iconBgColor="bg-white shadow-sm border border-blue-100" />
          <QuickActionCard title="Линии" description={`${stats?.activeLines || 0} активных`} icon={Layers} href="/dashboard/production/lines" iconColor="text-green-600" iconBgColor="bg-white shadow-sm border border-green-100" />
          <QuickActionCard title="Сотрудники" description={`${stats?.activeStaff || 0} на смене`} icon={Users} href="/dashboard/production/staff" iconColor="text-purple-600" iconBgColor="bg-white shadow-sm border border-purple-100" />
          <QuickActionCard title="Оборудование" icon={Settings} href="/dashboard/production/equipment" iconColor="text-orange-600" iconBgColor="bg-white shadow-sm border border-orange-100" />
          <QuickActionCard title="Типы нанесения" icon={Factory} href="/dashboard/production/application-types" iconColor="text-teal-600" iconBgColor="bg-white shadow-sm border border-teal-100" />
          <QuickActionCard title="Настройки" icon={Wrench} href="/dashboard/production/settings" iconColor="text-slate-600" iconBgColor="bg-white shadow-sm border border-slate-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Tasks by Line - Span 7 */}
        <div className="crm-card lg:col-span-7 flex flex-col">
          <SectionHeader title="Загрузка линий" href="/dashboard/production/lines" className="mb-6" />
          <div className="flex-1">
            {tasksByLine.length === 0 ? (
              <EmptyWidget icon={Layers} title="Нет линий" description="Добавьте производственные линии" action={{ label: "Добавить линию", href: "/dashboard/production/lines", }} />
            ) : (
              <div className="space-y-3">
                {tasksByLine.map((line) => (
                  <div key={line.id} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: line.color || '#cbd5e1' }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 leading-none mb-1">{line.name}</span>
                          <span className="text-xs font-bold text-slate-400">{line.code}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-700">
                          {line.tasksCount} {pluralize(line.tasksCount, 'задача', 'задачи', 'задач')}
                        </div>
                        <div className="text-xs font-medium text-slate-400">
                          {line.totalQuantity} шт. всего
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100/50">
                      <Progress value={line.tasksCount> 0 ? (line.inProgress / line.tasksCount) * 100 : 0}
                        className="flex-1 h-2"
                      />
                      <Badge className="bg-white shadow-sm border-slate-100 text-slate-600 px-2.5" color="neutral">
                        {line.inProgress} в работе
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Urgent Tasks - Span 5 */}
        <div className="crm-card lg:col-span-5 flex flex-col !border-rose-100/50">
          <SectionHeader title="Срочные задачи" href="/dashboard/production/tasks?filter=urgent" className="mb-6" />
          <div className="flex-1">
            {urgentTasks.length === 0 ? (
              <EmptyWidget icon={CheckCircle} title="Все задачи по графику" description="Срочных задач на данный момент нет" />
            ) : (
              <div className="space-y-2">
                {urgentTasks.map((task) => {
                  const status = statusConfig[task.status] || statusConfig.pending;
                  const overdue = isClient && isOverdue(task.dueDate);

                  return (
                    <Link key={task.id} href={`/dashboard/production/tasks/${task.id}`} className={cn( "flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:translate-x-1 group", overdue ? "border-rose-100 bg-rose-50/30 hover:bg-rose-50/50" : "border-slate-100 hover:border-slate-200 bg-white hover:shadow-md" )}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                          overdue ? "bg-rose-100 border-rose-200 text-rose-600" : "bg-slate-50 border-slate-100 text-slate-500"
                        )}>
                          <status.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate leading-tight text-xs ">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-slate-400">#{task.taskNumber}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-xs font-bold text-primary">{task.quantity} шт.</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                          <div
                            className={cn("h-full transition-all", overdue ? "bg-rose-500" : "bg-primary")}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        {task.dueDate && (
                          <p
                            className={cn(
                              "text-xs font-bold",
                              overdue ? "text-rose-600" : "text-slate-400"
                            )}
                          >
                            {task.dueDate
                                ? (isOverdue(task.dueDate) ? "ПРОСРОЧЕНО" : formatDistanceToNow(new Date(task.dueDate), {
                                  addSuffix: true,
                                  locale: ru,
                                }))
                                : "..."}
                          </p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Equipment Status */}
        <div className="crm-card flex flex-col h-full">
          <SectionHeader title="Статус оборудования" href="/dashboard/production/equipment" className="mb-6" />
          <div className="flex-1">
            {equipmentStatus.length === 0 ? (
              <EmptyWidget icon={Settings} title="Оборудование не добавлено" description="Начните с добавления ваших станков и инструментов" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {equipmentStatus.map((eq) => {
                  const status = equipmentStatusConfig[eq.status] || equipmentStatusConfig.inactive;

                  return (
                    <div
                      key={eq.id}
                      className="group flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
                        eq.status === "repair" ? "bg-rose-50 border-rose-100 text-rose-500" :
                        eq.needsMaintenance ? "bg-amber-50 border-amber-100 text-amber-500" :
                        "bg-slate-50 border-slate-100 text-slate-400"
                      )}>
                        {eq.status === "repair" ? (
                          <Wrench className="h-6 w-6" />
                        ) : eq.needsMaintenance ? (
                          <AlertTriangle className="h-6 w-6" />
                        ) : (
                          <Settings className="h-6 w-6" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 leading-tight mb-1 truncate">{eq.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-bold", status.color)}>
                            {status.label}
                          </span>
                          {eq.needsMaintenance && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Staff on Shift */}
        <div className="crm-card flex flex-col h-full">
          <SectionHeader title="Команда на смене" href="/dashboard/production/staff" className="mb-6" />
          <div className="flex-1">
            {staffOnShift.length === 0 ? (
              <EmptyWidget icon={Users} title="Смена не открыта" description="Нет активных сотрудников на текущий момент" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staffOnShift.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50 group hover:bg-white hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                          {person.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 truncate">{person.name}</p>
                        <p className="text-xs font-bold text-slate-400 truncate mt-0.5">
                          {person.lineName || "Свободная смена"}
                        </p>
                      </div>
                    </div>
                    {person.activeTasks > 0 && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {person.activeTasks}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
