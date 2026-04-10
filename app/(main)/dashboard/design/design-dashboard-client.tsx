"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import React, { useEffect, useState } from "react";
import { ru } from "date-fns/locale";
import {
  Plus,
  ListTodo,
  FolderOpen,
  PenTool,
  Clock,
  PlayCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  QuickActionCard,
  SectionHeader,
  EmptyWidget,
  ApplicationTypesChart,
} from "@/components/dashboard";
import { useIsClient } from "@/hooks/use-is-client";
import type {
  DesignStats,
  DesignTask,
  PopularDesign,
  ApplicationTypeStats,
} from "./actions/design-dashboard-actions";

const statusConfig: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  pending: { label: "В очереди", color: "bg-gray-500", icon: Clock },
  in_progress: { label: "В работе", color: "bg-blue-500", icon: PlayCircle },
  review: { label: "На проверке", color: "bg-yellow-500", icon: Eye },
  revision: { label: "На доработке", color: "bg-orange-500", icon: AlertTriangle },
  approved: { label: "Готово", color: "bg-green-500", icon: CheckCircle },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Низкий", color: "bg-gray-100 text-gray-700" },
  normal: { label: "Обычный", color: "bg-blue-100 text-blue-700" },
  high: { label: "Высокий", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Срочный", color: "bg-red-100 text-red-700" },
};

interface DesignDashboardClientProps {
  stats: DesignStats | null;
  myTasks: DesignTask[];
  urgentTasks: DesignTask[];
  popularDesigns: PopularDesign[];
  applicationTypesStats: ApplicationTypeStats[];
}

export function DesignDashboardClient({
  stats,
  myTasks,
  urgentTasks,
  popularDesigns,
  applicationTypesStats,
}: DesignDashboardClientProps) {
  const isClient = useIsClient();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    if (isClient) {
      setNow(new Date()); // suppressHydrationWarning
    }
  }, [isClient]);

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate || !now) return false;
    return new Date(dueDate) < now;
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold ">Дизайн</h1>
          <p className="text-muted-foreground mt-1 text-base">
            Управление дизайнами и задачами
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" color="neutral" className="rounded-xl h-10 px-5 border-gray-200 hover:bg-gray-50 font-medium text-gray-700 transition-colors" asChild>
            <Link href="/dashboard/design/editor">
              <PenTool className="h-4 w-4 mr-2" />
              Редактор
            </Link>
          </Button>
          <Button className="rounded-xl h-10 px-5 bg-[#5b21b6] hover:bg-[#4c1d95] font-medium text-white shadow-sm transition-colors" asChild>
            <Link href="/dashboard/design/queue">
              <ListTodo className="h-4 w-4 mr-2" />
              Очередь задач
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <SectionHeader title="Быстрые действия" className="mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickActionCard title="Открыть редактор" description="Создать новый макет" icon={PenTool} href="/dashboard/design/editor/new" iconColor="text-purple-600" iconBgColor="bg-purple-100" />
          <QuickActionCard title="Очередь задач" description={`${stats?.inQueue || 0} в очереди`} icon={ListTodo} href="/dashboard/design/queue" iconColor="text-blue-600" iconBgColor="bg-blue-100" />
          <QuickActionCard title="Коллекции" description={`${stats?.totalCollections || 0} коллекций`} icon={FolderOpen} href="/dashboard/design/prints" iconColor="text-green-600" iconBgColor="bg-green-100" />
          <QuickActionCard title="Создать задачу" description="Новая дизайн-задача" icon={Plus} href="/dashboard/design/queue/new" iconColor="text-orange-600" iconBgColor="bg-orange-100" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* My Tasks / All Tasks */}
        <Card>
          <CardHeader className="p-6 pb-2">
            <SectionHeader title="Активные задачи" href="/dashboard/design/queue" className="mb-0" />
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {myTasks.length === 0 ? (
              <EmptyWidget icon={ListTodo} title="Нет активных задач" description="Все задачи выполнены" className="mt-4" />
            ) : (
              <div className="space-y-2 mt-4">
                {myTasks.slice(0, 5).map((task) => {
                  const priorityKey = task.priority !== null ?
                    (["low", "normal", "high", "urgent"][task.priority] || "normal") :
                    "normal";
                  const status = statusConfig[task.status] || statusConfig.pending;
                  const priority = priorityConfig[priorityKey] || priorityConfig.normal;
                  const StatusIcon = status.icon;

                  return (
                    <Link key={task.id} href={`/dashboard/design/queue/${task.id}`} className="flex items-center justify-between p-3.5 rounded-2xl border border-transparent hover:bg-gray-50 hover:border-gray-100 transition-all duration-300 group">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`p-2.5 rounded-xl ${status.color} bg-opacity-10 transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}>
                          <StatusIcon className="h-5 w-5" style={{ color: status.color.startsWith('bg-') ? status.color.replace('bg-', 'var(--').replace('-500', ')') : status.color }} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold group-hover:text-primary transition-colors truncate">{task.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            #{task.taskNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={priority.color} color="neutral">
                          {priority.label}
                        </Badge>
                        {task.dueDate && isOverdue(task.dueDate) && (
                          <Badge color="danger">Просрочено</Badge>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        <Card>
          <CardHeader className="p-6 pb-2">
            <SectionHeader title="Срочные задачи" href="/dashboard/design/queue?filter=urgent" className="mb-0" />
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {urgentTasks.length === 0 ? (
              <EmptyWidget icon={AlertTriangle} title="Нет срочных задач" description="Дедлайны не горят" className="mt-4" />
            ) : (
              <div className="space-y-2 mt-4">
                {urgentTasks.map((task) => (
                  <Link key={task.id} href={`/dashboard/design/queue/${task.id}`} className="flex items-center justify-between p-3.5 rounded-2xl border border-red-50 bg-red-50/30 hover:bg-red-50/80 hover:border-red-100 transition-all duration-300 group">
                    <div className="min-w-0 flex-1 flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-red-100 text-red-600 transition-transform duration-300 group-hover:scale-110 flex-shrink-0">
                        <AlertTriangle className="h-5 w-5" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold group-hover:text-red-700 transition-colors truncate">{task.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          #{task.taskNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {task.dueDate && (
                        <p
                          className={`text-sm font-medium ${isOverdue(task.dueDate) ? "text-red-600" : "text-orange-600"
                            }`}
                        >
                          {isOverdue(task.dueDate)
                            ? "Просрочено"
                            : isClient && task.dueDate ? formatDistanceToNow(new Date(task.dueDate), {
                              addSuffix: true,
                              locale: ru,
                            }) : "..."}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Popular Designs */}
      {popularDesigns.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="p-6 pb-2">
            <SectionHeader title="Популярные дизайны" href="/dashboard/design/prints" className="mb-0" />
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {popularDesigns.map((design) => (
                <Link key={design.id} href={`/dashboard/design/prints/${design.id}`} className="group flex flex-col">
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3 relative shadow-sm ring-1 ring-gray-100/50">
                    {design.previewPath ? (
                      <Image src={design.previewPath} alt={design.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                  </div>
                  <p className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                    {design.name}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">
                    {design.collectionName}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Types Chart */}
      {applicationTypesStats.length > 0 && (
        <div className="mt-4">
          <ApplicationTypesChart data={applicationTypesStats} title="Задачи по типам нанесения" />
        </div>
      )}
    </div>
  );
}
