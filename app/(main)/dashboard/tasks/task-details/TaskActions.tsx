"use client";

import { CheckCircle2, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "../types";

interface TaskActionsProps {
    task: Task;
    isPending: boolean;
    onToggleStatus: () => void;
    onDeleteRequest: () => void;
}

export function TaskActions({ task, isPending, onToggleStatus, onDeleteRequest }: TaskActionsProps) {
    const isDone = task.status === "done";

    return (
        <div className="p-6 pt-0 mt-auto bg-white/80 backdrop-blur-sm safe-area-bottom">
            <div className="flex items-center gap-3">
                <button type="button"
                    onClick={onToggleStatus}
                    disabled={isPending}
                    className={cn(
                        "flex-1 py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3",
                        isDone
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-slate-200/50"
                            : "bg-primary text-white hover:opacity-90 shadow-primary/30"
                    )}
                >
                    {isDone ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    {isDone ? "Вернуть в работу" : "Отметить как выполнено"}
                </button>
                <button type="button"
                    onClick={onDeleteRequest}
                    disabled={isPending}
                    className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-[0.98] shadow-lg shadow-rose-200/50"
                >
                    <Trash2 className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
