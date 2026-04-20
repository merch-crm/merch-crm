"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Play,
  Eye,
  CheckCircle2,
  MoreHorizontal,
  ExternalLink,
  UserPlus,
  Clock,
  AlertTriangle,
  Pencil,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useIsClient } from "@/hooks/use-is-client";
import { orderItemDesignStatusEnum } from "@/lib/schema/enums";

import { updateDesignTaskStatus, takeDesignTask, DesignTaskFull } from "../../actions/order-design-actions";

interface DesignTaskCardProps {
  task: DesignTaskFull;
  onUpdate: (task: DesignTaskFull) => void;
}

const priorityConfig: Record<number, { label: string; color: string }> = {
  0: { label: "Обычный", color: "" },
  1: { label: "Высокий", color: "border-orange-400" },
  2: { label: "Срочный", color: "border-red-500 bg-red-50" },
};

export function DesignTaskCard({ task, onUpdate }: DesignTaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isClient = useIsClient();

  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (isClient) {
      setNow(new Date()); // suppressHydrationWarning
    }
  }, [isClient]);

  const isOverdue = isClient && now && task.dueDate && new Date(task.dueDate) < now;
  const hasPreview = task.files && task.files.length > 0;

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const result = await updateDesignTaskStatus(task.id, newStatus as typeof orderItemDesignStatusEnum.enumValues[number]);

    if (result.success && result.data) {
      onUpdate({ ...task, ...result.data });
      toast.success("Статус обновлён");
    } else {
      toast.error(result.error);
    }
    setIsUpdating(false);
  };

  const handleTake = async () => {
    setIsUpdating(true);
    const result = await takeDesignTask(task.id);

    if (result.success && result.data) {
      onUpdate({ ...task, ...result.data });
      toast.success("Задача взята в работу");
    } else {
      toast.error(result.error);
    }
    setIsUpdating(false);
  };

  return (
    <Card className={`transition-shadow hover:shadow-md ${priorityConfig[task.priority ?? 0]?.color}`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge color="purple" variant="outline" className="font-mono text-xs shrink-0">
                {task.number}
              </Badge>
              {(task.priority ?? 0) > 0 && (
                <Badge color={(task.priority ?? 0) === 2 ? "red" : "gray"} className="text-xs py-0 px-1">
                  {priorityConfig[task.priority ?? 0]?.label}
                </Badge>
              )}
            </div>

            <Link href={`/dashboard/design/queue/${task.id}`} className="font-medium text-sm hover:underline line-clamp-2">
              {task.title}
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" color="gray" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/design/queue/${task.id}`}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Открыть
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/design/editor/new?taskId=${task.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Открыть в редакторе
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {task.status === "pending" && (
                <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                  <Play className="mr-2 h-4 w-4" />
                  Начать работу
                </DropdownMenuItem>
              )}
              {task.status === "in_progress" && (
                <DropdownMenuItem onClick={() => handleStatusChange("review")}>
                  <Eye className="mr-2 h-4 w-4" />
                  Отправить на проверку
                </DropdownMenuItem>
              )}
              {task.status === "review" && (
                <>
                  <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Утвердить
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("revision")}>
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    На доработку
                  </DropdownMenuItem>
                </>
              )}
              {task.status === "revision" && (
                <DropdownMenuItem onClick={() => handleStatusChange("in_progress")}>
                  <Play className="mr-2 h-4 w-4" />
                  Продолжить работу
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.order && (
          <div className="text-xs text-muted-foreground">
            <Link href={`/dashboard/orders/${task.order.id}`} className="hover:underline">
              Заказ #{task.order.orderNumber}
            </Link>
            {task.order.client && (
              <span> • {task.order.client.name}</span>
            )}
          </div>
        )}

        {task.applicationType && (
          <Badge className="text-xs py-0 px-1 font-normal" style={{ backgroundColor: task.applicationType.color ? `${task.applicationType.color}15` : undefined, color: task.applicationType.color || undefined, borderColor: task.applicationType.color || undefined, }} color="gray">
            {task.applicationType.name}
          </Badge>
        )}

        {hasPreview && (
          <div className="relative h-20 bg-muted/50 rounded overflow-hidden">
            <Image src={task.files![0].thumbnailPath || task.files![0].path} alt="Preview" fill className="object-contain" unoptimized />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          {task.assignee ? (
            <Tooltip content={task.assignee.name} className="text-xs">
              <Avatar className="h-6 w-6 cursor-help">
                <AvatarImage src={task.assignee.image || undefined} />
                <AvatarFallback className="text-xs">
                  {task.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Tooltip>
          ) : (
            <Button variant="ghost" color="gray" size="sm" className="h-6 text-xs px-2" onClick={handleTake} disabled={isUpdating}>
              <UserPlus className="mr-1 h-3 w-3" />
              Взять
            </Button>
          )}

          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
              <Clock className="h-3 w-3" />
              {isClient && task.dueDate ? formatDistanceToNow(new Date(task.dueDate), {
                addSuffix: true,
                locale: ru,
              }) : "..."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
