"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Users,
  Eye,
  Plus,
  X,
  UserPlus,
  Crown,
  Loader2,
  User as UserIcon,
} from "lucide-react";
import { addTaskAssignee, removeTaskAssignee } from "../../actions/assignee-actions";
import { addTaskWatcher, removeTaskWatcher } from "../../actions/watcher-actions";
import { UserMultiSelect } from "../../components/user-multi-select";
import type { Task } from "@/lib/types/tasks";


interface TaskAssigneesSectionProps {
  task: Task;
  users: Array<{ id: string; name: string; avatar?: string | null; email?: string }>;
  currentUserId: string;
  canEdit: boolean;
  onTaskUpdated?: () => void;
}

export function TaskAssigneesSection({
  task,
  users,
  currentUserId,
  canEdit,
  onTaskUpdated,
}: TaskAssigneesSectionProps) {
  const router = useRouter();
  const [isAddingAssignee, setIsAddingAssignee] = useState(false);
  const [isAddingWatcher, setIsAddingWatcher] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [selectedWatcherIds, setSelectedWatcherIds] = useState<string[]>([]);

  const assigneeIds = task.assignees?.map((a) => a.userId) || [];
  const watcherIds = task.watchers?.map((w) => w.userId) || [];

  const handleAddAssignees = async () => {
    if (selectedAssigneeIds.length === 0) return;

    setLoadingUserId("adding-assignees");
    try {
      for (const userId of selectedAssigneeIds) {
        await addTaskAssignee(task.id, userId);
      }
      toast.success("Исполнители добавлены");
      setIsAddingAssignee(false);
      setSelectedAssigneeIds([]);
      onTaskUpdated?.();
      router.refresh();
    } catch (_error) {
      toast.error("Не удалось добавить исполнителей");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleRemoveAssignee = async (userId: string) => {
    if (assigneeIds.length <= 1) {
      toast.error("Должен остаться хотя бы один исполнитель");
      return;
    }

    setLoadingUserId(userId);
    try {
      const result = await removeTaskAssignee(task.id, userId);
      if (result.success) {
        toast.success("Исполнитель удалён");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось удалить исполнителя");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleAddWatchers = async () => {
    if (selectedWatcherIds.length === 0) return;

    setLoadingUserId("adding-watchers");
    try {
      for (const userId of selectedWatcherIds) {
        await addTaskWatcher(task.id, userId);
      }
      toast.success("Наблюдатели добавлены");
      setIsAddingWatcher(false);
      setSelectedWatcherIds([]);
      onTaskUpdated?.();
      router.refresh();
    } catch (_error) {
      toast.error("Не удалось добавить наблюдателей");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleRemoveWatcher = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      const result = await removeTaskWatcher(task.id, userId);
      if (result.success) {
        toast.success("Наблюдатель удалён");
        onTaskUpdated?.();
        router.refresh();
      } else {
        toast.error(result.error || "Не удалось удалить наблюдателя");
      }
    } catch (_error) {
      toast.error("Произошла ошибка");
    } finally {
      setLoadingUserId(null);
    }
  };

  const availableForAssignee = (users || []).filter(
    (u) => !assigneeIds.includes(u.id) && !watcherIds.includes(u.id)
  );
  const availableForWatcher = (users || []).filter(
    (u) => !assigneeIds.includes(u.id) && !watcherIds.includes(u.id)
  );

  return (
    <div className="space-y-3">
      {/* Creator */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-500" />
          Создатель
        </h4>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
          <Avatar className="h-10 w-10 ring-2 ring-amber-500/20">
            <AvatarImage src={task.creator?.avatar || undefined} />
            <AvatarFallback>
              <UserIcon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium">{task.creator?.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {task.creator?.email}
            </p>
          </div>
          {task.creatorId === currentUserId && (
            <Badge variant="secondary" className="shrink-0">
              Вы
            </Badge>
          )}
        </div>
      </div>

      {/* Assignees */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Исполнители
            <Badge variant="secondary" className="ml-1">
              {assigneeIds.length}
            </Badge>
          </h4>
          {canEdit && !isAddingAssignee && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingAssignee(true)}
              className="h-8 gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Добавить
            </Button>
          )}
        </div>

        {isAddingAssignee && (
          <div className="p-4 rounded-xl bg-muted/50 space-y-3 animate-in fade-in slide-in-from-top-2">
            <UserMultiSelect
              users={availableForAssignee}
              selectedIds={selectedAssigneeIds}
              onSelectionChange={setSelectedAssigneeIds}
              placeholder="Выберите исполнителей..."
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingAssignee(false);
                  setSelectedAssigneeIds([]);
                }}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleAddAssignees}
                disabled={
                  selectedAssigneeIds.length === 0 ||
                  loadingUserId === "adding-assignees"
                }
              >
                {loadingUserId === "adding-assignees" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Добавить"
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {task.assignees?.map((assignee) => {
            const user = users.find((u) => u.id === assignee.userId);
            if (!user) return null;
            return (
              <div
                key={assignee.userId}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 group"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                {assignee.userId === currentUserId && (
                  <Badge variant="secondary" className="shrink-0">
                    Вы
                  </Badge>
                )}
                {canEdit && assigneeIds.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveAssignee(assignee.userId)}
                    disabled={loadingUserId === assignee.userId}
                  >
                    {loadingUserId === assignee.userId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Watchers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-violet-500" />
            Наблюдатели
            <Badge variant="secondary" className="ml-1">
              {watcherIds.length}
            </Badge>
          </h4>
          {canEdit && !isAddingWatcher && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingWatcher(true)}
              className="h-8 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Добавить
            </Button>
          )}
        </div>

        {isAddingWatcher && (
          <div className="p-4 rounded-xl bg-muted/50 space-y-3 animate-in fade-in slide-in-from-top-2">
            <UserMultiSelect
              users={availableForWatcher}
              selectedIds={selectedWatcherIds}
              onSelectionChange={setSelectedWatcherIds}
              placeholder="Выберите наблюдателей..."
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingWatcher(false);
                  setSelectedWatcherIds([]);
                }}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleAddWatchers}
                disabled={
                  selectedWatcherIds.length === 0 ||
                  loadingUserId === "adding-watchers"
                }
              >
                {loadingUserId === "adding-watchers" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Добавить"
                )}
              </Button>
            </div>
          </div>
        )}

        {watcherIds.length === 0 && !isAddingWatcher ? (
          <p className="text-sm text-muted-foreground italic p-3">
            Наблюдатели не назначены
          </p>
        ) : (
          <div className="space-y-2">
            {task.watchers?.map((watcher) => {
              const user = users.find((u) => u.id === watcher.userId);
              if (!user) return null;
              return (
                <div
                  key={watcher.userId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 group"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback>
                      <UserIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  {watcher.userId === currentUserId && (
                    <Badge variant="secondary" className="shrink-0">
                      Вы
                    </Badge>
                  )}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveWatcher(watcher.userId)}
                      disabled={loadingUserId === watcher.userId}
                    >
                      {loadingUserId === watcher.userId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
