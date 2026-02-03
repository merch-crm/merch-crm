"use client";

import { useState, useTransition } from "react";
import {
    CheckCircle2,
    Clock,
    User,
    MoreHorizontal,
    Plus,
    Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTask } from "./actions";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { TaskDetailsDialog } from "./task-details-dialog";
import { playSound } from "@/lib/sounds";

import { Task } from "./types";

interface KanbanBoardProps {
    tasks: Task[];
    currentUserId: string;
    currentUserDepartmentId?: string | null;
}

const COLUMNS: { id: Task['status']; label: string; color: string; bg: string }[] = [
    { id: "new", label: "Новые", color: "bg-slate-400", bg: "bg-slate-50/50" },
    { id: "in_progress", label: "В работе", color: "bg-primary", bg: "bg-primary/5" },
    { id: "review", label: "Проверка", color: "bg-amber-400", bg: "bg-amber-50/10" },
    { id: "done", label: "Завершено", color: "bg-emerald-500", bg: "bg-emerald-50/10" },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function KanbanBoard({ tasks, currentUserId, currentUserDepartmentId }: KanbanBoardProps) {
    const [, startTransition] = useTransition();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case "high": return { label: "Высокий", color: "text-rose-600 bg-rose-50", line: "bg-rose-500" };
            case "normal": return { label: "Обычный", color: "text-amber-600 bg-amber-50", line: "bg-amber-400" };
            default: return { label: "Низкий", color: "text-slate-500 bg-slate-50", line: "bg-slate-300" };
        }
    };

    // native drag and drop handlers
    const onDragStart = (e: React.DragEvent, taskId: string) => {
        setDraggedTaskId(taskId);
        e.dataTransfer.setData("taskId", taskId);
        e.dataTransfer.effectAllowed = "move";
        // make original card semi-transparent
        setTimeout(() => {
            (e.target as HTMLElement).style.opacity = "0.5";
        }, 0);
    };

    const onDragEnd = (e: React.DragEvent) => {
        setDraggedTaskId(null);
        (e.target as HTMLElement).style.opacity = "1";
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const onDrop = (e: React.DragEvent, status: Task['status']) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        if (!taskId) return;

        const task = tasks.find(t => t.id === taskId);
        if (task && task.status !== status) {
            // Play sound based on new status
            if (status === "done") {
                playSound("task_completed");
            }

            startTransition(async () => {
                await updateTask(taskId, { status: status as Task['status'] });
            });
        }
    };

    return (
        <>
            <div className="flex gap-6 overflow-x-auto pb-8 pt-4 min-h-[75vh] items-start scrollbar-hide">
                {COLUMNS.map((column) => {
                    const columnTasks = tasks.filter(t => t.status === column.id);

                    return (
                        <div
                            key={column.id}
                            className="flex-1 min-w-[320px] max-w-[400px] flex flex-col h-full"
                            onDragOver={onDragOver}
                            onDrop={(e) => onDrop(e, column.id)}
                        >
                            {/* Column Header - Monday Style */}
                            <div className={cn(
                                "flex items-center justify-between p-4 rounded-t-2xl shadow-sm mb-1 transition-all",
                                column.color
                            )}>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-sm font-bold text-white  tracking-normal flex items-center gap-2">
                                        {column.label}
                                    </h3>
                                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-[18px] text-[10px] font-bold">
                                        {columnTasks.length}
                                    </span>
                                </div>
                                <MoreHorizontal className="w-5 h-5 text-white/50 cursor-pointer" />
                            </div>

                            {/* Column Body */}
                            <div className={cn(
                                "flex-1 p-3 space-y-3 rounded-b-2xl border-x border-b border-slate-200 transition-colors",
                                column.bg,
                                draggedTaskId && "bg-slate-100/30"
                            )}>
                                {columnTasks.length === 0 && !draggedTaskId && (
                                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/50 rounded-[18px]">
                                        <Plus className="w-6 h-6 text-slate-200 mb-2" />
                                        <span className="text-[10px] font-bold text-slate-300  tracking-normal">Пусто</span>
                                    </div>
                                )}

                                {columnTasks.map((task) => {
                                    const priority = getPriorityConfig(task.priority);
                                    const isDone = task.status === "done";

                                    return (
                                        <div
                                            key={task.id}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, task.id)}
                                            onDragEnd={onDragEnd}
                                            onClick={() => setSelectedTask(task)}
                                            className={cn(
                                                "group relative bg-white rounded-[18px] p-4 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 cursor-grab active:cursor-grabbing border-l-4",
                                                priority.line
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("h-2.5 w-2.5 rounded-full", priority.line)} title={priority.label} />
                                                        <span className="text-[9px] font-bold text-slate-400  tracking-normal">
                                                            {task.assignedToDepartmentId ? "Отдел" : "Личное"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[8px] font-bold  tracking-normal">
                                                            {task.type || "OTHER"}
                                                        </span>
                                                        {task.order && (
                                                            <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-md text-[8px] font-bold  tracking-normal">
                                                                №{task.order.orderNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye className="w-3.5 h-3.5 text-slate-300 hover:text-primary" />
                                                </div>
                                            </div>

                                            <h4 className={cn(
                                                "text-sm font-bold text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors",
                                                isDone && "line-through text-slate-400"
                                            )}>
                                                {task.title}
                                            </h4>

                                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white">
                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-600 truncate max-w-[120px]">
                                                        {task.assignedToUser?.name || task.assignedToDepartment?.name || "Все"}
                                                    </span>
                                                </div>

                                                {task.dueDate && (
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 px-2 py-1 rounded-[18px]",
                                                        new Date(task.dueDate) < new Date() && !isDone ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-400"
                                                    )}>
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold">
                                                            {format(new Date(task.dueDate), "d MMM", { locale: ru })}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quick Status Pill */}
                                            {isDone && (
                                                <div className="absolute -top-2 -right-2 h-6 w-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white scale-0 group-hover:scale-100 transition-transform">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
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
