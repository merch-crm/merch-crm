"use client";

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
    Activity,
    UserPlus,
    UserCheck,
    UserMinus,
    MessageSquare,
    Settings,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
    id: string;
    action: string;
    createdAt: string;
    user?: { name: string } | null;
    details?: Record<string, unknown> | null;
}

interface ClientTimelineProps {
    activity: TimelineItem[];
}

export function ClientTimeline({ activity }: ClientTimelineProps) {
    if (!activity || activity.length === 0) {
        return (
            <div className="crm-card p-12 text-center text-slate-500 rounded-2xl">
                <History className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                <p className="font-bold">История активности пуста</p>
                <p className="text-xs text-slate-400 mt-1">Здесь будут отображаться действия менеджеров</p>
            </div>
        );
    }

    const getActionIcon = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes("создан")) return <UserPlus className="w-4 h-4" />;
        if (a.includes("обновлен") || a.includes("изменение")) return <UserCheck className="w-4 h-4" />;
        if (a.includes("архив")) return <UserMinus className="w-4 h-4" />;
        if (a.includes("комментарий")) return <MessageSquare className="w-4 h-4" />;
        return <Settings className="w-4 h-4" />;
    };

    const getActionColor = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes("создан")) return "bg-blue-500 text-white";
        if (a.includes("обновлен") || a.includes("изменение")) return "bg-emerald-500 text-white";
        if (a.includes("архив")) return "bg-slate-500 text-white";
        if (a.includes("комментарий")) return "bg-indigo-500 text-white";
        return "bg-slate-400 text-white";
    };

    return (
        <div className="relative pl-8 space-y-4 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
            {activity.map((item, idx) => (
                <div key={item.id} className="relative group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    {/* Icon Dot */}
                    <div className={cn(
                        "absolute -left-[33px] top-0 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110",
                        getActionColor(item.action)
                    )}>
                        {getActionIcon(item.action)}
                    </div>

                    <div className="crm-card !p-5 !rounded-2xl border-transparent hover:border-slate-200 transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h4 className="font-black text-slate-900 leading-none">{item.action}</h4>
                            <span className="text-xs font-bold text-slate-400">
                                {format(new Date(item.createdAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                {item.user?.name?.[0] || "?"}
                            </div>
                            <span className="text-xs font-bold text-slate-500">Менеджер: {item.user?.name || "Система"}</span>
                        </div>

                        {item.details && Object.keys(item.details).length > 0 && (
                            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                <pre className="text-xs text-slate-500 font-mono overflow-x-auto">
                                    {JSON.stringify(item.details, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
