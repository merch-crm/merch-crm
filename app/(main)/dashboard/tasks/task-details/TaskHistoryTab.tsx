"use client";

import { formatDateTime } from "@/lib/formatters";
import { Task } from "../types";

interface TaskHistoryTabProps {
    task: Task;
}

export function TaskHistoryTab({ task }: TaskHistoryTabProps) {
    interface TaskActivity {
        type: string;
        oldValue?: string | null;
        newValue?: string | null;
    }

    const getActivityLabel = (activity: TaskActivity) => {
        switch (activity.type) {
            case 'status_change': return `заменил статус с ${activity.oldValue} на ${activity.newValue}`;
            case 'comment_add': return `добавил комментарий`;
            case 'file_upload': return `загрузил файл`;
            case 'checklist_update': return activity.newValue || "обновил чек-лист";
            default: return "сделал изменение";
        }
    };

    return (
        <div className="relative pl-6 space-y-3 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {task.history?.map((activity) => (
                <div key={activity.id} className="relative">
                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-white border-2 border-primary z-10" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">
                            {activity.user.name}{" "}
                            <span className="text-slate-500 font-medium">
                                {getActivityLabel(activity)}
                            </span>
                        </p>
                        <p className="text-xs font-bold text-slate-400 leading-none">
                            {formatDateTime(activity.createdAt, "HH:mm, dd MMM yyyy")}
                        </p>
                    </div>
                </div>
            ))}
            {(!task.history || task.history.length === 0) && (
                <div className="text-center py-10 text-slate-300">
                    <p className="text-xs font-bold">История изменений пуста</p>
                </div>
            )}
        </div>
    );
}
