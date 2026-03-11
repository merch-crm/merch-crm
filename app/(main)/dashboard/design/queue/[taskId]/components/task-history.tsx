"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    Plus,
    User,
    RefreshCw,
    Upload,
    Trash2,
    CheckCircle2,
    MessageSquare,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { DesignTaskFull } from "@/app/(main)/dashboard/design/actions/order-design-actions";

type DesignTaskHistory = NonNullable<DesignTaskFull["history"]>[number];

interface TaskHistoryProps {
    history: DesignTaskHistory[];
}

const eventConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    created: { icon: <Plus className="h-3 w-3" />, label: "Задача создана", color: "bg-green-500" },
    assigned: { icon: <User className="h-3 w-3" />, label: "Изменён исполнитель", color: "bg-blue-500" },
    status_changed: { icon: <RefreshCw className="h-3 w-3" />, label: "Статус изменён", color: "bg-purple-500" },
    file_uploaded: { icon: <Upload className="h-3 w-3" />, label: "Загружена новая версия файла", color: "bg-cyan-500" },
    file_deleted: { icon: <Trash2 className="h-3 w-3" />, label: "Файл удалён", color: "bg-red-500" },
    approved: { icon: <CheckCircle2 className="h-3 w-3" />, label: "Задача утверждена", color: "bg-green-600" },
    comment_added: { icon: <MessageSquare className="h-3 w-3" />, label: "Добавлен комментарий", color: "bg-yellow-500" },
};

const statusLabels: Record<string, string> = {
    pending: "Ожидает",
    in_progress: "В работе",
    review: "На проверке",
    revision: "На доработке",
    approved: "Утверждён",
};

export function TaskHistory({ history }: TaskHistoryProps) {
    if (history.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                <History className="h-8 w-8 mx-auto opacity-20 mb-2" />
                <p className="text-sm text-muted-foreground italic">История действий пока пуста</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {history.map((item) => {
                const config = eventConfig[item.event] || {
                    icon: <RefreshCw className="h-3 w-3" />,
                    label: item.event,
                    color: "bg-slate-500",
                };

                return (
                    <div key={item.id} className="relative pl-10 flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        {/* Dot/Icon */}
                        <div className={`absolute left-0 w-6 h-6 rounded-full ${config.color} flex items-center justify-center text-white z-10 shadow-sm border-2 border-background`}>
                            {config.icon}
                        </div>

                        <div className="flex-1 space-y-1.5 pb-2">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-xs tracking-tight">{config.label}</span>
                                <span className="text-xs tabular-nums text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                    {format(new Date(item.createdAt), "d MMM, HH:mm", { locale: ru })}
                                </span>
                            </div>

                            <div className="bg-muted/30 rounded-lg p-2.5 border">
                                {item.event === "status_changed" && item.oldValue && item.newValue && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground line-through decoration-muted-foreground/50">{statusLabels[item.oldValue] || item.oldValue}</span>
                                        <span className="text-muted-foreground/50">→</span>
                                        <span className="font-bold text-lime-600">{statusLabels[item.newValue] || item.newValue}</span>
                                    </div>
                                )}

                                {item.event === "assigned" && item.comment && (
                                    <p className="text-sm font-medium">{item.comment}</p>
                                )}

                                {item.event === "file_uploaded" && item.newValue && (
                                    <p className="text-sm font-medium line-clamp-1">{item.newValue}</p>
                                )}

                                {item.comment && item.event !== "assigned" && (
                                    <p className="text-sm text-foreground mt-1 bg-white/50 p-2 rounded border border-white/20 italic">
                                        «{item.comment}»
                                    </p>
                                )}

                                {item.performedByUser && (
                                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-muted/50">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage src={item.performedByUser.avatar || undefined} />
                                            <AvatarFallback className="text-xs">
                                                {item.performedByUser.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-[11px] font-medium text-muted-foreground">
                                            {item.performedByUser.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

import { History } from "lucide-react";
