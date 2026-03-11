"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { ru } from "date-fns/locale";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    StatCard,
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

    useEffect(() => {
        setCustomTrail([{ label: "Производство", href: "" }]);
        return () => setCustomTrail(null);
    }, [setCustomTrail]);

    const isOverdue = (dueDate: string | null) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Производство</h1>
                    <p className="text-muted-foreground">
                        Управление производственными задачами
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/production/tasks/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Создать задачу
                    </Link>
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <StatCard
                        title="В очереди"
                        value={stats.inQueue}
                        icon={Clock}
                        iconColor="text-gray-600"
                    />
                    <StatCard
                        title="В работе"
                        value={stats.inProgress}
                        icon={PlayCircle}
                        iconColor="text-blue-600"
                    />
                    <StatCard
                        title="На паузе"
                        value={stats.paused}
                        icon={Pause}
                        iconColor="text-yellow-600"
                        variant={stats.paused > 0 ? "warning" : "default"}
                    />
                    <StatCard
                        title="Готово сегодня"
                        value={stats.completedToday}
                        subtitle={`${stats.totalQuantityToday} шт.`}
                        icon={CheckCircle}
                        iconColor="text-green-600"
                    />
                    <StatCard
                        title="Просрочено"
                        value={stats.overdue}
                        icon={AlertTriangle}
                        iconColor="text-red-600"
                        variant={stats.overdue > 0 ? "danger" : "default"}
                    />
                    <StatCard
                        title="Сотрудников"
                        value={`${stats.activeStaff}/${stats.totalStaff}`}
                        subtitle={`${stats.activeLines} линий`}
                        icon={Users}
                        iconColor="text-purple-600"
                    />
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <LineLoadChart data={tasksByLine} title="Загрузка линий" />
                <DailyOutputChart data={dailyOutput} title="Выработка за неделю" />
            </div>

            {/* Quick Actions */}
            <div>
                <SectionHeader title="Быстрые действия" />
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <QuickActionCard
                        title="Все задачи"
                        description={`${(stats?.inQueue || 0) + (stats?.inProgress || 0)} активных`}
                        icon={ListTodo}
                        href="/dashboard/production/tasks"
                        iconColor="text-blue-600"
                        iconBgColor="bg-blue-100"
                    />
                    <QuickActionCard
                        title="Линии"
                        description={`${stats?.activeLines || 0} активных`}
                        icon={Layers}
                        href="/dashboard/production/lines"
                        iconColor="text-green-600"
                        iconBgColor="bg-green-100"
                    />
                    <QuickActionCard
                        title="Сотрудники"
                        description={`${stats?.activeStaff || 0} на смене`}
                        icon={Users}
                        href="/dashboard/production/staff"
                        iconColor="text-purple-600"
                        iconBgColor="bg-purple-100"
                    />
                    <QuickActionCard
                        title="Оборудование"
                        icon={Settings}
                        href="/dashboard/production/equipment"
                        iconColor="text-orange-600"
                        iconBgColor="bg-orange-100"
                    />
                    <QuickActionCard
                        title="Типы нанесения"
                        icon={Factory}
                        href="/dashboard/production/application-types"
                        iconColor="text-teal-600"
                        iconBgColor="bg-teal-100"
                    />
                    <QuickActionCard
                        title="Создать задачу"
                        icon={Plus}
                        href="/dashboard/production/tasks/new"
                        iconColor="text-indigo-600"
                        iconBgColor="bg-indigo-100"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Tasks by Line */}
                <Card>
                    <CardHeader className="pb-3">
                        <SectionHeader
                            title="Загрузка линий"
                            href="/dashboard/production/lines"
                            className="mb-0"
                        />
                    </CardHeader>
                    <CardContent>
                        {tasksByLine.length === 0 ? (
                            <EmptyWidget
                                icon={Layers}
                                title="Нет линий"
                                description="Добавьте производственные линии"
                                action={{
                                    label: "Добавить линию",
                                    href: "/dashboard/production/lines",
                                }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {tasksByLine.map((line) => (
                                    <div key={line.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {line.color && (
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: line.color }}
                                                    />
                                                )}
                                                <span className="font-medium">{line.name}</span>
                                                <Badge variant="secondary">{line.code}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {line.tasksCount} задач • {line.totalQuantity} шт.
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Progress
                                                value={line.tasksCount > 0 ? (line.inProgress / line.tasksCount) * 100 : 0}
                                                className="flex-1"
                                            />
                                            <span className="text-sm text-muted-foreground w-20 text-right">
                                                {line.inProgress} в работе
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Urgent Tasks */}
                <Card>
                    <CardHeader className="pb-3">
                        <SectionHeader
                            title="Срочные задачи"
                            href="/dashboard/production/tasks?filter=urgent"
                            className="mb-0"
                        />
                    </CardHeader>
                    <CardContent>
                        {urgentTasks.length === 0 ? (
                            <EmptyWidget
                                icon={AlertTriangle}
                                title="Нет срочных задач"
                                description="Дедлайны не горят"
                            />
                        ) : (
                            <div className="space-y-3">
                                {urgentTasks.map((task) => {
                                    const status = statusConfig[task.status] || statusConfig.pending;

                                    return (
                                        <Link
                                            key={task.id}
                                            href={`/dashboard/production/tasks/${task.id}`}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isOverdue(task.dueDate)
                                                ? "border-red-200 bg-red-50/50 hover:bg-red-100/50"
                                                : "hover:bg-muted/50"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`p-2 rounded-full ${status.color}`}>
                                                    <status.icon className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{task.title}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>#{task.taskNumber}</span>
                                                        <span>•</span>
                                                        <span>{task.quantity} шт.</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Progress value={task.progress} className="w-16 h-2" />
                                                {task.dueDate && (
                                                    <p
                                                        className={`text-xs mt-1 ${isOverdue(task.dueDate)
                                                            ? "text-red-600 font-medium"
                                                            : "text-muted-foreground"
                                                            }`}
                                                        suppressHydrationWarning
                                                    >
                                                        {isOverdue(task.dueDate)
                                                            ? "Просрочено"
                                                            : formatDistanceToNow(new Date(task.dueDate), {
                                                                addSuffix: true,
                                                                locale: ru,
                                                            })}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Equipment Status */}
                <Card>
                    <CardHeader className="pb-3">
                        <SectionHeader
                            title="Статус оборудования"
                            href="/dashboard/production/equipment"
                            className="mb-0"
                        />
                    </CardHeader>
                    <CardContent>
                        {equipmentStatus.length === 0 ? (
                            <EmptyWidget
                                icon={Settings}
                                title="Всё в порядке"
                                description="Оборудование работает штатно"
                            />
                        ) : (
                            <div className="space-y-3">
                                {equipmentStatus.map((eq) => {
                                    const status = equipmentStatusConfig[eq.status] || equipmentStatusConfig.inactive;

                                    return (
                                        <div
                                            key={eq.id}
                                            className="flex items-center justify-between p-3 rounded-lg border"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`p-2 rounded-full ${eq.needsMaintenance ? "bg-yellow-100" : "bg-muted"
                                                        }`}
                                                >
                                                    {eq.status === "repair" ? (
                                                        <Wrench className="h-4 w-4 text-red-600" />
                                                    ) : eq.needsMaintenance ? (
                                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                    ) : (
                                                        <Settings className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{eq.name}</p>
                                                    <p className={`text-sm ${status.color}`}>
                                                        {status.label}
                                                    </p>
                                                </div>
                                            </div>
                                            {eq.needsMaintenance && (
                                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                                    Требует ТО
                                                </Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Staff on Shift */}
                <Card>
                    <CardHeader className="pb-3">
                        <SectionHeader
                            title="Сотрудники на смене"
                            href="/dashboard/production/staff"
                            className="mb-0"
                        />
                    </CardHeader>
                    <CardContent>
                        {staffOnShift.length === 0 ? (
                            <EmptyWidget
                                icon={Users}
                                title="Нет активных сотрудников"
                                description="Добавьте сотрудников в систему"
                                action={{
                                    label: "Добавить сотрудника",
                                    href: "/dashboard/production/staff",
                                }}
                            />
                        ) : (
                            <div className="space-y-3">
                                {staffOnShift.map((person) => (
                                    <div
                                        key={person.id}
                                        className="flex items-center justify-between p-3 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {person.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{person.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {person.position || "Сотрудник"}
                                                    {person.lineName && ` • ${person.lineName}`}
                                                </p>
                                            </div>
                                        </div>
                                        {person.activeTasks > 0 && (
                                            <Badge variant="secondary">
                                                {person.activeTasks} {person.activeTasks === 1 ? "задача" : "задач"}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
