"use client";

import { useState, useTransition } from "react";
import {
    CheckCircle2,
    User,
    Shield,
    Calendar,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleTaskStatus, deleteTask } from "./actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { TaskDetailsDialog } from "./task-details-dialog";

interface Task {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    priority: string;
    assignedToUserId?: string | null;
    assignedToRoleId?: string | null;
    assignedToUser?: { name: string } | null;
    assignedToRole?: { name: string } | null;
    dueDate?: Date | string | null;
    createdAt: Date | string;
}

interface TasksListProps {
    tasks: Task[];
    currentUserId: string;
    currentUserRoleId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TasksList({ tasks, currentUserId, currentUserRoleId }: TasksListProps) {
    const [, startTransition] = useTransition();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
            await toggleTaskStatus(taskId, status);
        });
    };

    const handleDelete = (e: React.MouseEvent, taskId: string) => {
        e.stopPropagation();
        if (!confirm("Вы уверены, что хотите удалить эту задачу?")) return;
        startTransition(async () => {
            await deleteTask(taskId);
        });
    };

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 mt-6">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-200" />
                </div>
                <h3 className="text-lg font-black text-slate-900">Задач пока нет</h3>
                <p className="text-slate-400 text-sm font-medium mt-1">Отдыхайте или создайте новое поручение</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                {tasks.map((task) => {
                    const config = getPriorityConfig(task.priority);
                    const isDone = task.status === "done";

                    return (
                        <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={cn(
                                "group relative bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer",
                                isDone && "opacity-75 grayscale-[0.5]"
                            )}
                        >
                            {/* Status Icon */}
                            <button
                                onClick={(e) => handleToggle(e, task.id, task.status)}
                                className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 absolute -top-4 -right-4 shadow-lg z-10",
                                    isDone
                                        ? "bg-emerald-500 text-white shadow-emerald-200"
                                        : "bg-white text-slate-200 hover:text-indigo-600 border border-slate-50 hover:border-indigo-100 hover:shadow-indigo-100"
                                )}
                            >
                                <CheckCircle2 className={cn("w-7 h-7", isDone && "animate-in zoom-in-50")} />
                            </button>

                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4 pr-10">
                                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", config.color)}>
                                        {config.label}
                                    </span>
                                </div>

                                <h3 className={cn(
                                    "text-lg font-black text-slate-900 leading-snug mb-2",
                                    isDone && "line-through text-slate-400"
                                )}>
                                    {task.title}
                                </h3>

                                {task.description && (
                                    <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">
                                        {task.description}
                                    </p>
                                )}

                                <div className="mt-auto pt-4 border-t border-slate-50 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                            {task.assignedToRole ? <Shield className="w-4 h-4 text-indigo-500" /> : <User className="w-4 h-4 text-indigo-500" />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Исполнитель</span>
                                            <span className="text-xs font-black text-slate-700">
                                                {task.assignedToUser?.name || task.assignedToRole?.name || "Все"}
                                            </span>
                                        </div>
                                    </div>

                                    {task.dueDate && (
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Срок</span>
                                                <span className="text-xs font-black text-slate-700">
                                                    {format(new Date(task.dueDate), "d MMMM", { locale: ru })}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Hover Actions */}
                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                    <button
                                        onClick={(e) => handleDelete(e, task.id)}
                                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
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
        </>
    );
}
