"use client";

import { useEffect, useState } from "react";
import { getAuditLogs } from "../actions";
import { Search, FileText, User, Calendar, Clock, Activity } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    details: unknown;
    createdAt: Date | string;
    userId: string | null;
    user?: {
        name: string;
    } | null;
}

export function AuditLogsTable() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchLogs = () => {
            setLoading(true);
            getAuditLogs().then(res => {
                if (res.data) setLogs(res.data as AuditLog[]);
                setLoading(false);
            });
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="text-slate-400 p-12 text-center">Загрузка логов...</div>;

    return (
        <div className="space-y-6">
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Поиск по логам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/3">Действие</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/4">Пользователь</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/4">Дата и время</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${log.action.includes("Удален") ? "bg-red-100 text-red-600" :
                                            log.action.includes("Создан") ? "bg-emerald-100 text-emerald-600" :
                                                "bg-indigo-100 text-indigo-600"
                                            }`}>
                                            <Activity className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-700">{log.action}</div>
                                            {log.details && (
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                    {(log.details as any).name || (log.details as any).reason || JSON.stringify(log.details)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {log.user ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {(log.user?.name || "С")[0]}
                                            </div>
                                            <span className="text-sm text-slate-900">{log.user?.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic text-sm">Система</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            {format(new Date(log.createdAt), "d MMMM yyyy", { locale: ru })}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {format(new Date(log.createdAt), "HH:mm:ss")}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Логов пока нет</p>
                    </div>
                )}
            </div>
        </div>
    );
}
