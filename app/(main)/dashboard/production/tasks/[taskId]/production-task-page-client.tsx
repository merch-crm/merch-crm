"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Package,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  FileText,
  Layers,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/toast";
import {
  updateTaskStatus,
  assignTask,
  updateTaskProgress,
  deleteProductionTask,
  type ProductionTaskFull,
} from "../../actions/task-actions";
import type { ProductionLine, ProductionStaff } from "@/lib/schema/production";

const statusConfig = {
  pending: { label: "Ожидает", color: "bg-gray-500", icon: Clock },
  in_progress: { label: "В работе", color: "bg-blue-500", icon: Play },
  paused: { label: "Приостановлено", color: "bg-yellow-500", icon: Pause },
  completed: { label: "Завершено", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Отменено", color: "bg-red-500", icon: AlertTriangle },
};

const priorityConfig = {
  low: { label: "Низкий", color: "bg-gray-100 text-gray-800" },
  normal: { label: "Обычный", color: "bg-blue-100 text-blue-800" },
  high: { label: "Высокий", color: "bg-orange-100 text-orange-800" },
  urgent: { label: "Срочный", color: "bg-red-100 text-red-800" },
};

interface ProductionTaskPageClientProps {
  task: ProductionTaskFull;
  lines: ProductionLine[];
  staff: ProductionStaff[];
}

export function ProductionTaskPageClient({
  task: initialTask,
  staff,
}: ProductionTaskPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [task, setTask] = useState(initialTask);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending;
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.normal;
  const StatusIcon = status.icon;

  const handleStatusChange = async (newStatus: "pending" | "in_progress" | "paused" | "completed" | "cancelled") => {
    setIsUpdating(true);
    const result = await updateTaskStatus(task.id, newStatus);
    if (result.success) {
      setTask({ ...task, status: newStatus });
      toast("Статус обновлён", "success");
    } else {
      toast(result.error || "Ошибка", "error");
    }
    setIsUpdating(false);
  };

  const handleAssigneeChange = async (staffId: string) => {
    setIsUpdating(true);
    const result = await assignTask(task.id, staffId === "unassigned" ? null : staffId);
    if (result.success) {
      const staffMember = staff.find((s) => s.id === staffId);
      const newAssignee = staffMember ? {
        ...staffMember,
        user: staffMember.userId ? {
          id: staffMember.userId,
          name: staffMember.name,
          image: staffMember.avatarPath
        } : null
      } : null;
      setTask({ 
        ...task, 
        assigneeId: staffId === "unassigned" ? null : staffId, 
        assignee: newAssignee as ProductionTaskFull["assignee"]
      });
      toast("Исполнитель назначен", "success");
    } else {
      toast(result.error || "Ошибка", "error");
    }
    setIsUpdating(false);
  };

  const handleProgressChange = async (progressPercentage: number) => {
    setIsUpdating(true);
    const completedQuantity = Math.round((progressPercentage / 100) * task.quantity);
    const result = await updateTaskProgress(task.id, completedQuantity);
    if (result.success) {
      setTask({ ...task, completedQuantity });
      toast("Прогресс обновлён", "success");
    } else {
      toast(result.error || "Ошибка", "error");
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    const result = await deleteProductionTask(task.id);
    if (result.success) {
      toast("Задача удалена", "success");
      router.push("/dashboard/production");
    } else {
      toast(result.error || "Ошибка", "error");
    }
    setIsDeleteOpen(false);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"; // suppressHydrationWarning

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" color="neutral" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{task.title}</h1>
              <Badge className={priority.color}>{priority.label}</Badge>
              {isOverdue && (
                <Badge color="danger">Просрочено</Badge>
              )}
            </div>
            <p className="text-muted-foreground">#{task.number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" color="neutral" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsDeleteOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-3">
          {/* Status & Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Статус и прогресс</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${status.color}`}>
                  <StatusIcon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{status.label}</p>
                  <Progress value={Math.round(((task.completedQuantity || 0) / task.quantity) * 100)} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(((task.completedQuantity || 0) / task.quantity) * 100)}% выполнено
                  </p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex flex-wrap gap-2">
                {task.status === "pending" && (
                  <Button size="sm" onClick={() => handleStatusChange("in_progress")}
                    disabled={isUpdating}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Начать
                  </Button>
                )}
                {task.status === "in_progress" && (
                  <>
                    <Button size="sm" variant="outline" color="neutral" onClick={() => handleStatusChange("paused")}
                      disabled={isUpdating}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Пауза
                    </Button>
                    <Button size="sm" onClick={() => handleStatusChange("completed")}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Завершить
                    </Button>
                  </>
                )}
                {task.status === "paused" && (
                  <Button size="sm" onClick={() => handleStatusChange("in_progress")}
                    disabled={isUpdating}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Продолжить
                  </Button>
                )}
                {(task.status === "completed" || task.status === "cancelled") && (
                  <Button size="sm" variant="outline" color="neutral" onClick={() => handleStatusChange("pending")}
                    disabled={isUpdating}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Переоткрыть
                  </Button>
                )}
              </div>

              {/* Progress Buttons */}
              {task.status === "in_progress" && (
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((p) => {
                    const currentP = Math.round(((task.completedQuantity || 0) / task.quantity) * 100);
                    return (
                      <Button key={p} size="sm" variant={currentP >= p ? "solid" : "outline"} color="system"
                        onClick={() => handleProgressChange(p)}
                        disabled={isUpdating}
                      >
                        {p}%
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {task.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{task.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {task.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Примечания</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {task.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Logs */}
          {task.logs && task.logs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">История</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.logs.map((log) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm">{typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.performedByUser?.name && `${log.performedByUser.name} • `}
                          {log.createdAt && formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Task Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Order */}
              {task.orderId && (
                <div className="flex items-center gap-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Заказ</p>
                    <Link href={`/dashboard/orders/${task.orderId}`} className="text-sm font-medium hover:underline">
                      #{task.orderId.slice(0, 8)}
                    </Link>
                  </div>
                </div>
              )}

              {/* Line */}
              {task.line && (
                <div className="flex items-center gap-3">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Линия</p>
                    <p className="text-sm font-medium">{task.line.name}</p>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Количество</p>
                  <p className="text-sm font-medium">{task.quantity} шт.</p>
                </div>
              </div>

              <Separator />

              {/* Assignee */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Исполнитель</p>
                <Select options={[ { id: "unassigned", title: "Не назначен" }, ...staff .filter((s) => s.isActive)
                      .map((s) => ({ id: s.id, title: s.name }))
                  ]}
                  value={task.assigneeId || "unassigned"}
                  onChange={(val) => { void handleAssigneeChange(val); }}
                  disabled={isUpdating}
                  placeholder="Не назначен"
                />
              </div>

              <Separator />

              {/* Dates */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Срок</p>
                  <p className={`text-sm font-medium ${isOverdue ? "text-destructive" : ""}`}>
                    {task.dueDate
                      ? format(new Date(task.dueDate), "dd.MM.yyyy HH:mm", { locale: ru })
                      : "Не указан"}
                  </p>
                </div>
              </div>

              {task.estimatedTime && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Оценка времени</p>
                    <p className="text-sm font-medium">{task.estimatedTime} мин.</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Created */}
              <div className="text-sm text-muted-foreground">
                <p>
                  Создано:{" "}
                  {format(new Date(task.createdAt), "dd.MM.yyyy HH:mm", { locale: ru })}
                </p>
                {task.updatedAt && task.updatedAt !== task.createdAt && (
                  <p>
                    Обновлено:{" "}
                    {formatDistanceToNow(new Date(task.updatedAt), {
                      addSuffix: true,
                      locale: ru,
                    })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить задачу «{task.title}»? Это действие
              нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
