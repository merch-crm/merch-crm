"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import {
    Play,
    Pause,
    CheckCircle2,
    Clock,
    User,
    MoreHorizontal,
    ExternalLink,
    AlertTriangle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { updateTaskStatus, ProductionTaskFull } from "../actions/task-actions";


interface TaskCardProps {
    task: ProductionTaskFull;
    onUpdate?: (task: ProductionTaskFull) => void;
}

const priorityConfig: Record<string, { label: string; color: string }> = {
    low: { label: "Низкий", color: "bg-slate-500" },
    normal: { label: "Обычный", color: "bg-blue-500" },
    high: { label: "Высокий", color: "bg-orange-500" },
    urgent: { label: "Срочный", color: "bg-red-500" },
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode }> = {
    pending: { label: "Ожидает", icon: <Clock className="h-4 w-4" /> },
    in_progress: { label: "В работе", icon: <Play className="h-4 w-4" /> },
    paused: { label: "Пауза", icon: <Pause className="h-4 w-4" /> },
    completed: { label: "Завершено", icon: <CheckCircle2 className="h-4 w-4" /> },
};

export function TaskCard({ task, onUpdate }: TaskCardProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const progress = task.quantity > 0
        ? Math.round(((task.completedQuantity || 0) / task.quantity) * 100)
        : 0;

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        const result = await updateTaskStatus(task.id, newStatus as Parameters<typeof updateTaskStatus>[1]);

        if (result.success) {
            toast.success(`Статус изменён на "${statusConfig[newStatus]?.label}"`);
            if (onUpdate && result.data) {
                onUpdate({ ...task, ...result.data } as ProductionTaskFull);
            }
        } else {
            toast.error(result.error);
        }
        setIsUpdating(false);
    };

    return (
        <Card className={`transition-shadow hover:shadow-md ${isOverdue ? "border-red-300" : ""}`}>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    {/* Left side */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono text-xs">
                                {task.number}
                            </Badge>

                            {task.applicationType && (
                                <Badge
                                    variant="secondary"
                                    style={{
                                        backgroundColor: task.applicationType.color
                                            ? `${task.applicationType.color}20`
                                            : undefined,
                                        color: task.applicationType.color || undefined,
                                    }}
                                >
                                    {task.applicationType.name}
                                </Badge>
                            )}

                            <div
                                className={`w-2 h-2 rounded-full ${priorityConfig[task.priority]?.color}`}
                                title={priorityConfig[task.priority]?.label}
                            />

                            {isOverdue && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    Просрочено
                                </Badge>
                            )}
                        </div>

                        <Link
                            href={`/dashboard/production/tasks/${task.id}`}
                            className="font-medium hover:underline line-clamp-1"
                        >
                            {task.title}
                        </Link>

                        {task.order && (
                            <p className="text-sm text-muted-foreground">
                                Заказ{" "}
                                <Link
                                    href={`/dashboard/orders/${task.order.id}`}
                                    className="text-primary hover:underline"
                                >
                                    #{task.order.number}
                                </Link>
                            </p>
                        )}

                        {/* Progress */}
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Прогресс</span>
                                <span>
                                    {task.completedQuantity || 0} / {task.quantity}
                                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
                            {task.line && (
                                <div className="flex items-center gap-1">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: task.line.color || "#6B7280" }}
                                    />
                                    {task.line.name}
                                </div>
                            )}

                            {task.dueDate && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(task.dueDate), {
                                        addSuffix: true,
                                        locale: ru,
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex flex-col items-end gap-2">
                        {/* Assignee */}
                        {task.assignee ? (
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={task.assignee.avatarPath || undefined} />
                                    <AvatarFallback>
                                        {task.assignee.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                                <User className="mr-1 h-3 w-3" />
                                Не назначен
                            </Badge>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            {/* Quick status change */}
                            {task.status === "pending" && (
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleStatusChange("in_progress")}
                                    disabled={isUpdating}
                                >
                                    <Play className="mr-1 h-3 w-3" />
                                    Начать
                                </Button>
                            )}

                            {task.status === "in_progress" && (
                                <>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusChange("paused")}
                                        disabled={isUpdating}
                                    >
                                        <Pause className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => handleStatusChange("completed")}
                                        disabled={isUpdating}
                                    >
                                        <CheckCircle2 className="mr-1 h-3 w-3" />
                                        Завершить
                                    </Button>
                                </>
                            )}

                            {task.status === "paused" && (
                                <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleStatusChange("in_progress")}
                                    disabled={isUpdating}
                                >
                                    <Play className="mr-1 h-3 w-3" />
                                    Продолжить
                                </Button>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/dashboard/production/tasks/${task.id}`}>
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Открыть
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange("pending")}
                                        disabled={task.status === "pending"}
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        В ожидание
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange("cancelled")}
                                        className="text-destructive"
                                    >
                                        Отменить
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
