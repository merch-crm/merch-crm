"use client";

import { Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/formatters";
import type { ClientProfile } from "@/lib/types";

interface ActivityTabProps {
    client: ClientProfile;
}

const safeFormat = (dateStr: string | null | undefined, formatStr: string) => {
    if (!dateStr) return "---";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "---";
        return formatDate(date, formatStr);
    } catch {
        return "---";
    }
};

export function ActivityTab({ client }: ActivityTabProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <Activity className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-semibold text-slate-400">Лента событий</h3>
            </div>
            {client.activity && client.activity.length > 0 ? (
                <div className="relative pl-6 space-y-3 before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {client.activity.map((log) => (
                        <div key={log.id} className="relative group">
                            <div className="absolute -left-[23px] top-1 w-5 h-5 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center z-10">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-slate-900">{log.action}</p>
                                    <p className="text-xs font-medium text-slate-400">{safeFormat(log.createdAt, "HH:mm, dd.MM.yyyy")}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
                                        {log.user?.name?.[0] || 'S'}
                                    </div>
                                    <p className="text-xs font-bold text-slate-500">{log.user?.name || "Система"}</p>
                                </div>
                                {log.details ? (
                                    <div className="mt-2 p-3 rounded-xl bg-slate-50 text-xs text-slate-500 font-medium overflow-hidden">
                                        <pre className="whitespace-pre-wrap font-sans text-xs">{JSON.stringify(log.details as Record<string, unknown>, null, 2)}</pre>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={Activity}
                    title="История изменений пуста"
                    className="py-8"
                />
            )}
        </div>
    );
}
