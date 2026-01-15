"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuditLogs, clearAuditLogs } from "@/app/dashboard/admin/actions";
import { Search, Activity, Calendar, Clock, Trash2, Database, User, Shield, Package, HardDrive, Layout, Server, Folder } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details: Record<string, any> | null;
    createdAt: Date | string;
    userId: string | null;
    user?: {
        name: string;
        avatar?: string | null;
    } | null;
}

export function AuditLogsTable({ isAdmin }: { isAdmin?: boolean }) {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [totalLogs, setTotalLogs] = useState(0);
    const [loading, setLoading] = useState(true);
    const [clearing, setClearing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const page = Number(searchParams.get("page")) || 1;
    const query = searchParams.get("search") || "";

    // Internal state for input to allow smooth typing
    const [searchTerm, setSearchTerm] = useState(query);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAuditLogs(page, 20, query);
            if (res.data) {
                setLogs(res.data as AuditLog[]);
                setTotalLogs(res.total || 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, query]);

    const handleClearLogs = async () => {
        setClearing(true);
        try {
            const res = await clearAuditLogs();
            if (res.success) {
                toast("Логи успешно очищены", "success");
                fetchLogs();
            } else {
                toast(res.error || "Ошибка при очистке логов", "error");
            }
        } catch (error) {
            console.error(error);
            toast("Произошла ошибка", "error");
        } finally {
            setClearing(false);
            setShowConfirmDialog(false);
        }
    };

    // Initial fetch and on params change
    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    // Update URL when user types (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== query) {
                const params = new URLSearchParams(searchParams);
                params.set("page", "1"); // Reset to page 1 on search
                if (searchTerm) {
                    params.set("search", searchTerm);
                } else {
                    params.delete("search");
                }
                replace(`${pathname}?${params.toString()}`);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, query, pathname, replace, searchParams]);

    const getEntityInfo = (type: string) => {
        switch (type) {
            case "users":
            case "user":
                return { icon: User, color: "text-blue-500", bg: "bg-blue-50" };
            case "s3_storage":
                return { icon: Server, color: "text-sky-500", bg: "bg-sky-50" };
            case "local_storage":
                return { icon: HardDrive, color: "text-emerald-500", bg: "bg-emerald-50" };
            case "order":
                return { icon: Package, color: "text-indigo-500", bg: "bg-indigo-50" };
            case "system_settings":
                return { icon: Layout, color: "text-amber-500", bg: "bg-amber-50" };
            case "security_event":
                return { icon: Shield, color: "text-rose-500", bg: "bg-rose-50" };
            case "folder":
                return { icon: Folder, color: "text-orange-500", bg: "bg-orange-50" };
            case "file":
                return { icon: Database, color: "text-purple-500", bg: "bg-purple-50" };
            default:
                return { icon: Activity, color: "text-slate-400", bg: "bg-slate-50" };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Поиск по действию, типу или пользователю..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-100 transition-all uppercase tracking-widest shrink-0"
                    >
                        <Trash2 size={16} />
                        Очистить логи
                    </button>
                )}
            </div>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleClearLogs}
                title="Очистка логов аудита"
                description="Вы уверены, что хотите очистить все логи аудита? Это действие необратимо."
                confirmText="Очистить"
                variant="destructive"
                isLoading={clearing}
            />

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Действие</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Тип объекта</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Пользователь</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Дата и время</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
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
                                <td colSpan={4} className="py-20 text-center text-slate-400 italic text-sm">
                                    Логи не найдены
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => {
                                const entity = getEntityInfo(log.entityType);
                                const Icon = entity.icon;
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-transparent", entity.bg, entity.color, "group-hover:scale-110")}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-700 text-sm leading-tight">{log.action}</div>
                                                    {log.details && (
                                                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-medium bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-100/50 w-fit">
                                                            {log.details?.fileName ||
                                                                log.details?.name ||
                                                                log.details?.reason ||
                                                                (log.details?.oldKey && log.details?.newKey ? `${log.details.oldKey} → ${log.details.newKey}` : null) ||
                                                                (log.details?.oldPath && log.details?.newPath ? `${log.details.oldPath} → ${log.details.newPath}` : null) ||
                                                                log.details?.key ||
                                                                log.details?.path ||
                                                                (log.details?.count ? `Объектов: ${log.details.count}` : null) ||
                                                                JSON.stringify(log.details)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight",
                                                entity.bg,
                                                entity.color
                                            )}>
                                                {log.entityType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.user ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0 overflow-hidden relative">
                                                        {log.user.avatar ? (
                                                            <>
                                                                <span className="absolute inset-0 flex items-center justify-center">{(log.user?.name || "С")[0]}</span>
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={log.user.avatar}
                                                                    alt={log.user.name}
                                                                    className="w-full h-full object-cover relative z-10"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).style.opacity = '0';
                                                                    }}
                                                                />
                                                            </>
                                                        ) : (
                                                            (log.user?.name || "С")[0]
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-slate-900 truncate max-w-[150px] font-medium">{log.user?.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-sm font-medium">Система</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {format(new Date(log.createdAt), "dd.MM.yyyy", { locale: ru })}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    {format(new Date(log.createdAt), "HH:mm:ss")}
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

            <Pagination
                totalItems={totalLogs}
                pageSize={20}
                currentPage={page}
                itemName="записей"
            />
        </div >
    );
}
