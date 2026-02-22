"use client";

import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { AuditLog, getEntityInfo, formatLogDetails, formatDate } from "./utils";
import { UserAvatar } from "./user-avatar";

interface AuditLogsListProps {
    logs: AuditLog[];
    loading: boolean;
}

export function AuditLogsList({ logs, loading }: AuditLogsListProps) {
    return (
        <ResponsiveDataView
            data={logs}
            renderTable={() => (
                <div className="table-container">
                    <table className="crm-table">
                        <thead className="crm-thead">
                            <tr>
                                <th className="crm-th">Действие</th>
                                <th className="crm-th">Тип объекта</th>
                                <th className="crm-th">Пользователь</th>
                                <th className="crm-th">Дата и время</th>
                            </tr>
                        </thead>
                        <tbody className="crm-tbody">
                            {loading && logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-xs font-medium text-slate-400">Загрузка логов...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 text-sm">
                                        Логи не найдены
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const entity = getEntityInfo(log.entityType);
                                    const Icon = entity.icon;
                                    const formattedDetails = formatLogDetails(log.details);
                                    return (
                                        <tr key={log.id} className="crm-tr">
                                            <td className="crm-td">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-colors shadow-sm border border-transparent shrink-0", entity.bg, entity.color, "group-hover:scale-110")}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700 text-sm leading-tight">{log.action}</div>
                                                        {formattedDetails && (
                                                            <div className="text-xs text-slate-400 mt-1 line-clamp-1 font-medium bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-200/50 w-fit">
                                                                {formattedDetails}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="crm-td">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md text-xs font-bold tracking-tight",
                                                    entity.bg,
                                                    entity.color
                                                )}>
                                                    {log.entityType}
                                                </span>
                                            </td>
                                            <td className="crm-td">
                                                {log.user ? (
                                                    <div className="flex items-center gap-2">
                                                        <UserAvatar user={log.user} size={24} />
                                                        <span className="text-xs text-slate-900 truncate max-w-[150px] font-bold">{log.user?.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 text-xs font-medium">Система</span>
                                                )}
                                            </td>
                                            <td className="crm-td">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        {formatDate(log.createdAt, "dd.MM.yyyy")}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        {formatDate(log.createdAt, "HH:mm:ss")}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            renderCard={(log) => {
                const entity = getEntityInfo(log.entityType);
                const Icon = entity.icon;
                const formattedDetails = formatLogDetails(log.details);
                return (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-transparent", entity.bg, entity.color)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm leading-tight">{log.action}</div>
                                    <span className={cn(
                                        "inline-block px-2 py-0.5 rounded-lg text-xs font-bold tracking-tight mt-1",
                                        entity.bg,
                                        entity.color
                                    )}>
                                        {log.entityType}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-slate-900">{formatDate(log.createdAt, "dd.MM.yyyy")}</div>
                                <div className="text-xs font-medium text-slate-400">{formatDate(log.createdAt, "HH:mm:ss")}</div>
                            </div>
                        </div>

                        {formattedDetails && (
                            <div className="text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 break-words">
                                {formattedDetails}
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                            {log.user ? (
                                <div className="flex items-center gap-2">
                                    <UserAvatar user={log.user} size={28} />
                                    <span className="text-xs text-slate-600 font-medium">{log.user?.name}</span>
                                </div>
                            ) : (
                                <span className="text-slate-400 text-xs font-medium italic">Система</span>
                            )}
                        </div>
                    </div>
                );
            }}
            mobileGridClassName="grid grid-cols-1 gap-3"
        />
    );
}
