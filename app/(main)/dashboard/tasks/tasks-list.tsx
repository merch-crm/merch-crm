"use client";

import { useState, useTransition } from "react";
import {
    CheckCircle2,
    User,
    Calendar,
    Trash2,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleTaskStatus, deleteTask } from "./actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { TaskDetailsDialog } from "./task-details-dialog";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { playSound } from "@/lib/sounds";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { Task } from "./types";

interface TasksListProps {
    tasks: Task[];
    currentUserId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TasksList({ tasks, currentUserId }: TasksListProps) {
    const [, startTransition] = useTransition();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case "high": return { label: "Высокий", color: "text-rose-600 bg-rose-50", icon: "text-rose-500" };
            case "normal": return { label: "Обычный", color: "text-amber-600 bg-amber-50", icon: "text-amber-500" };
            default: return { label: "Низкий", color: "text-slate-500 bg-slate-50", icon: "text-slate-400" };
        }
    };

    const handleToggle = (e: React.MouseEvent, taskId: string, status: string) => {
        e.stopPropagation();
        startTransition(async () => {
            const res = await toggleTaskStatus(taskId, status);
            if (res.success) {
                toast(status === "done" ? "Задача выполнена" : "Задача возвращена в работу", "success");
                if (status !== "done") playSound("task_completed");
                else playSound("notification_success");
            }
        });
    };

    const handleDelete = (e: React.MouseEvent, taskId: string) => {
        e.stopPropagation();
        setTaskToDelete(taskId);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteTask(taskToDelete);
            if (res.success) {
                toast("Задача удалена", "success");
                playSound("notification_success");
                setTaskToDelete(null);
            } else {
                toast(res.error || "Ошибка при удалении", "error");
                playSound("notification_error");
            }
        } catch (error) {
            console.error(error);
            toast("Произошла ошибка", "error");
            playSound("notification_error");
        } finally {
            setIsDeleting(false);
        }
    };

    if (tasks.length === 0) {
        return (
            <div className="crm-card flex flex-col items-center justify-center py-20 !border-2 !border-dashed mt-6">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Задач пока нет</h3>
                <p className="text-slate-400 text-sm font-medium mt-1">Отдыхайте или создайте новое поручение</p>
            </div>
        );
    }

    return (
        <>
            <div className="crm-card flex flex-col !p-0 mt-6">
                {tasks.map((task, index) => {
                    const config = getPriorityConfig(task.priority);
                    const isDone = task.status === "done";

                    return (
                        <div role="button" tabIndex={0}
                            key={task.id}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }} onClick={() => setSelectedTask(task)}
                            className={cn(
                                "group relative flex items-center justify-between p-4 transition-all duration-300 cursor-pointer active:bg-slate-50",
                                index !== tasks.length - 1 && "border-b border-slate-100",
                                isDone && "bg-slate-50/50"
                            )}
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleToggle(e, task.id, isDone ? "in_progress" : "done")}
                                    className={cn(
                                        "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition-all active:scale-90 border-2",
                                        isDone
                                            ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200 hover:bg-emerald-600"
                                            : "bg-white border-slate-200 text-slate-200 hover:text-primary hover:border-primary/20"
                                    )}
                                >
                                    <CheckCircle2 className={cn("w-5 h-5", isDone && "animate-in zoom-in-50")} />
                                </Button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className={cn(
                                            "text-sm font-black text-slate-900 truncate",
                                            isDone && "line-through text-slate-400 font-bold"
                                        )}>
                                            {task.title}
                                        </h3>
                                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-black tracking-tighter", config.color)}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            <span className="truncate max-w-[100px]">
                                                {task.assignedToUser?.name || task.assignedToRole?.name || "Все"}
                                            </span>
                                        </div>
                                        {task.dueDate && (
                                            <div className={cn(
                                                "flex items-center gap-1",
                                                new Date(task.dueDate) < new Date() && !isDone ? "text-rose-500" : ""
                                            )}>
                                                <Calendar className="w-3 h-3" />
                                                <span>{format(new Date(task.dueDate), "d MMM", { locale: ru })}</span>
                                            </div>
                                        )}
                                        {task.order && (
                                            <div className="flex items-center gap-1 text-primary">
                                                <span className="font-black">№{task.order.orderNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 ml-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleDelete(e, task.id)}
                                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 md:block hidden"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedTask && (
                <TaskDetailsDialog
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                />
            )}

            <ConfirmDialog
                isOpen={!!taskToDelete}
                onClose={() => setTaskToDelete(null)}
                onConfirm={confirmDelete}
                title="Удаление задачи"
                description="Вы уверены, что хотите удалить эту задачу? Это действие необратимо."
                confirmText="Удалить"
                variant="destructive"
                isLoading={isDeleting}
            />
        </>
    );
}
