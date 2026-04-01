"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import {
  X,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  Users,
  Share2,
  AlertTriangle,
  Ban,
  Info,
  MessageSquare,
  ListChecks,
  History,
  Link2,
  Flag,
  Calendar,
  Building2,
  Zap,
  Loader2,
} from "lucide-react";
import { changeTaskStatus, deleteTask } from "../actions/task-actions";
import { TaskInfoSection } from "./sections/task-info-section";
import { TaskAssigneesSection } from "./sections/task-assignees-section";
import { TaskChecklistSection } from "./sections/task-checklist-section";
import { TaskCommentsSection } from "./sections/task-comments-section";
import { TaskDependenciesSection } from "./sections/task-dependencies-section";
import { TaskHistorySection } from "./sections/task-history-section";
import { DelegateDialog } from "./delegate-dialog";
import {
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_TYPE_CONFIG,
} from "../constants";
import type { Task, TaskStatus } from "@/lib/types/tasks";

interface TaskDetailsDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  users: Array<{ id: string; name: string; avatar?: string | null; email?: string }>;
  departments: Array<{ id: string; name: string }>;
  allTasks: Task[];
  currentUserId: string;
  onTaskUpdated?: () => void;
}

export function TaskDetailsDialog({
  task,
  open,
  onOpenChange,
  users,
  departments,
  allTasks,
  currentUserId,
  onTaskUpdated,
}: TaskDetailsDialogProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDelegateDialog, setShowDelegateDialog] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab("info");
    }
  }, [open, task?.id]);

  if (!task) return null;

  const _statusConfig = TASK_STATUS_CONFIG[task.status];
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const typeConfig = TASK_TYPE_CONFIG[task.type];

  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() && // suppressHydrationWarning
    task.status !== "done" &&
    task.status !== "cancelled";

  const isBlocked = task.dependencies?.some(
    (dep) =>
      allTasks.find((t) => t.id === dep.dependsOnTaskId)?.status !== "done" &&
      allTasks.find((t) => t.id === dep.dependsOnTaskId)?.status !== "cancelled"
  );

  const isCreator = task.creatorId === currentUserId;
  const isAssignee = task.assignees?.some((a) => a.userId === currentUserId);
  const canEdit = isCreator || isAssignee;
  const canDelete = isCreator;
  const canChangeStatus = isAssignee || isCreator;

  const handleStatusChange = async (newStatus: string) => {
    if (isBlocked && newStatus !== "cancelled") {
      toast.error("Задача заблокирована зависимостями");
      return;
    }

    setIsChangingStatus(true);
    try {
      const result = await changeTaskStatus(task.id, newStatus as TaskStatus);
      if (result.success) {
        toast.success(`Статус изменён на "${TASK_STATUS_CONFIG[newStatus as TaskStatus]?.label}"`);
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось изменить статус");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteTask(task.id);
      if (result.success) {
        toast.success("Задача удалена");
        onOpenChange(false);
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось удалить задачу");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/dashboard/tasks?task=${task.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Ссылка скопирована");
  };

  const statusOptions = Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => ({
    id: key,
    title: config.label,
    color: config.color,
  }));

  const tabs = [
    { id: "info", label: "Инфо", icon: Info },
    { id: "assignees", label: "Участники", icon: Users, count: (task.assignees?.length || 0) + (task.watchers?.length || 0) },
    { id: "checklist", label: "Чек-лист", icon: ListChecks, count: task.checklists?.length || 0 },
    { id: "comments", label: "Комментарии", icon: MessageSquare, count: task.comments?.length || 0 },
    { id: "dependencies", label: "Связи", icon: Link2, count: task.dependencies?.length || 0 },
    { id: "history", label: "История", icon: History },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden bg-white/80 backdrop-blur-2xl border-white/40 shadow-2xl rounded-[32px]">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-white/20 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {/* Status select */}
                  <div className="w-48">
                    <Select
                      options={statusOptions}
                      value={task.status}
                      onChange={handleStatusChange}
                      disabled={!canChangeStatus || isChangingStatus}
                      compact
                    />
                  </div>

                  {/* Priority badge */}
                  <Badge
                    variant="outline"
                    className="gap-1.5"
                    style={{
                      borderColor: priorityConfig?.color,
                      color: priorityConfig?.color,
                    }}
                  >
                    <Flag className="h-3 w-3" />
                    {priorityConfig?.label}
                  </Badge>

                  {/* Type badge */}
                  <Badge variant="secondary" className="gap-1.5">
                    {typeConfig?.label}
                    {typeConfig?.icon && (
                      <span className="ml-1">{typeConfig.icon}</span>
                    )}
                  </Badge>

                  {/* Indicators */}
                  {isOverdue && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Просрочено
                    </Badge>
                  )}
                  {isBlocked && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-orange-500 text-orange-500"
                    >
                      <Ban className="h-3 w-3" />
                      Заблокировано
                    </Badge>
                  )}
                  {task.isAutoCreated && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-violet-500 text-violet-500"
                    >
                      <Zap className="h-3 w-3" />
                      Авто
                    </Badge>
                  )}
                </div>

                <DialogTitle className="text-xl font-semibold leading-tight">
                  {task.title}
                </DialogTitle>

                {/* Meta info */}
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  {task.deadline && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(task.deadline).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  {task.department && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" />
                      {task.department.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDelegateDialog(true)}
                    className="gap-1.5"
                  >
                    <Share2 className="h-4 w-4" />
                    Делегировать
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Copy className="h-4 w-4 mr-2" />
                      Копировать ссылку
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!canEdit}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Редактировать
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={!canDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="border-b border-white/20 px-6 backdrop-blur-md bg-white/40 relative z-10">
              <TabsList className="h-12 bg-transparent p-0 gap-1">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="relative h-12 px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:text-violet-700 font-medium text-slate-500 hover:text-slate-700 data-[state=active]:bg-transparent"
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 min-w-[20px] px-1.5"
                      >
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <TabsContent value="info" className="m-0">
                <TaskInfoSection
                  task={task}
                  departments={departments}
                  canEdit={canEdit ?? false}
                  onTaskUpdated={onTaskUpdated}
                />
              </TabsContent>

              <TabsContent value="assignees" className="m-0">
                <TaskAssigneesSection
                  task={task}
                  users={users}
                  currentUserId={currentUserId}
                  canEdit={canEdit ?? false}
                  onTaskUpdated={onTaskUpdated}
                />
              </TabsContent>

              <TabsContent value="checklist" className="m-0">
                <TaskChecklistSection
                  task={task}
                  canEdit={canEdit ?? false}
                  onTaskUpdated={() => { onTaskUpdated?.(); router.refresh(); }}
                />
              </TabsContent>

              <TabsContent value="comments" className="m-0">
                <TaskCommentsSection
                  task={task}
                  currentUserId={currentUserId}
                  onTaskUpdated={() => { onTaskUpdated?.(); router.refresh(); }}
                />
              </TabsContent>

              <TabsContent value="dependencies" className="m-0">
                <TaskDependenciesSection
                  task={task}
                  allTasks={allTasks}
                  canEdit={canEdit ?? false}
                  onTaskUpdated={() => { onTaskUpdated?.(); router.refresh(); }}
                />
              </TabsContent>

              <TabsContent value="history" className="m-0">
                <TaskHistorySection task={task} />
              </TabsContent>
            </div>
          </Tabs>

          {/* Footer */}
          <div className="p-4 border-t border-white/20 bg-slate-50/50 flex items-center justify-between text-sm text-slate-500 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                Создал:
                <Avatar className="h-5 w-5 ring-2 ring-white shadow-sm">
                  <AvatarImage src={task.creator?.avatar || undefined} />
                  <AvatarFallback className="text-xs bg-violet-100 text-violet-700">
                    {task.creator?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-slate-900">
                  {task.creator?.name}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>
                Создано:{" "}
                {new Date(task.createdAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="text-xs font-mono bg-white/60 border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">
                #{task.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить задачу?</AlertDialogTitle>
            <AlertDialogDescription>
              Задача &quot;{task.title}&quot; будет удалена безвозвратно. Это действие
              нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delegate dialog */}
      <DelegateDialog
        task={task}
        open={showDelegateDialog}
        onOpenChange={setShowDelegateDialog}
        users={users}
        currentUserId={currentUserId}
        onTaskUpdated={onTaskUpdated}
      />
    </>
  );
}
