"use client";

import { CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "../types";

interface TaskHeaderProps {
    task: Task;
    onClose: () => void;
}

export function TaskHeader({ task, onClose }: TaskHeaderProps) {
    const isDone = task.status === "done";

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case "high": return { label: "Высокий приоритет", color: "text-rose-600 bg-rose-50" };
            case "normal": return { label: "Обычный приоритет", color: "text-amber-600 bg-amber-50" };
            default: return { label: "Низкий приоритет", color: "text-slate-500 bg-slate-50" };
        }
    };

    const config = getPriorityConfig(task.priority);

    return (
        <div className="flex justify-between items-start gap-4 mb-8">
            <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                    <span className={cn("px-4 py-1.5 rounded-full text-xs font-bold", config.color)}>
                        {config.label}
                    </span>
                    {isDone && (
                        <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Выполнено
                        </span>
                    )}
                </div>
                <h2 className={cn(
                    "text-2xl sm:text-3xl font-bold text-slate-900 leading-tight",
                    isDone && "line-through text-slate-400"
                )}>
                    {task.title}
                </h2>
            </div>
            <button type="button"
                onClick={onClose}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all group shrink-0"
            >
                <X className="w-6 h-6 text-slate-300 group-hover:text-slate-600" />
            </button>
        </div>
    );
}
