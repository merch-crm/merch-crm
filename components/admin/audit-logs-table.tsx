"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuditLogs, clearAuditLogs } from "@/app/dashboard/admin/actions";
import { Search, Activity, Calendar, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по логам..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:border-indigo-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
                    />
                </div>

                {isAdmin && (
                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        disabled={clearing}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 border border-red-100 rounded-lg font-bold hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        {clearing ? "Очистка..." : "Очистить логи"}
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

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/3">Действие</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/4">Пользователь</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-1/4">Дата и время</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                // Loading Skeletons
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-3/4"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-1/2"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-1/3"></div></td>
                                    </tr>
                                ))
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${log.action.includes("Удален") ? "bg-red-100 text-red-600" :
                                                    log.action.includes("Создан") ? "bg-emerald-100 text-emerald-600" :
                                                        "bg-indigo-100 text-indigo-600"
                                                    }`}>
                                                    <Activity className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-700">{log.action}</div>
                                                    {log.details && (
                                                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                            {log.details?.name || log.details?.reason || JSON.stringify(log.details)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
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
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-20 text-center text-slate-400">
                                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="text-lg font-medium">Ничего не найдено</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            <Pagination
                totalItems={totalLogs}
                pageSize={20}
                currentPage={page}
                itemName="записей"
            />
        </div>
    );
}
