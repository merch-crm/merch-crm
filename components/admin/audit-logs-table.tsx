"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuditLogs, clearAuditLogs, getUsers } from "@/app/(main)/admin-panel/actions";
import { Search, Activity, Calendar, Clock, Trash2, Database, User, Shield, Package, HardDrive, Layout, Server, Folder } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { PremiumPagination } from "@/components/ui/premium-pagination";
import NextImage from "next/image";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";

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

    const [allUsers, setAllUsers] = useState<Array<{ id: string, name: string }>>([]);
    const [selectedUserId, setSelectedUserId] = useState(searchParams.get("userId") || "");
    const [selectedEntityType, setSelectedEntityType] = useState(searchParams.get("entityType") || "");
    const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
    const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAuditLogs(
                page,
                20,
                query,
                selectedUserId || null,
                selectedEntityType || null,
                startDate || null,
                endDate || null
            );
            if (res.data) {
                setLogs(res.data as AuditLog[]);
                setTotalLogs(res.total || 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, query, selectedUserId, selectedEntityType, startDate, endDate]);

    useEffect(() => {
        const fetchUsers = async () => {
            const res = await getUsers(1, 100);
            if (res.data) setAllUsers(res.data);
        };
        fetchUsers();
    }, []);

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
            const params = new URLSearchParams(searchParams);
            params.set("page", "1");

            if (searchTerm !== query) {
                if (searchTerm) params.set("search", searchTerm);
                else params.delete("search");
            }

            if (selectedUserId) params.set("userId", selectedUserId);
            else params.delete("userId");

            if (selectedEntityType) params.set("entityType", selectedEntityType);
            else params.delete("entityType");

            if (startDate) params.set("startDate", startDate);
            else params.delete("startDate");

            if (endDate) params.set("endDate", endDate);
            else params.delete("endDate");

            replace(`${pathname}?${params.toString()}`);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedUserId, selectedEntityType, startDate, endDate, pathname, replace, searchParams, query]);

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
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-1 space-y-2 min-w-[200px]">
                        <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Поиск</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Действие..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-[18px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-48 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Сотрудник</label>
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-[18px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none font-medium"
                        >
                            <option value="">Все сотрудники</option>
                            {allUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-48 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Тип объекта</label>
                        <select
                            value={selectedEntityType}
                            onChange={(e) => setSelectedEntityType(e.target.value)}
                            className="w-full h-11 px-4 bg-white border border-slate-200 rounded-[18px] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none font-medium"
                        >
                            <option value="">Все типы</option>
                            <option value="user">Пользователи</option>
                            <option value="order">Заказы</option>
                            <option value="client">Клиенты</option>
                            <option value="inventory">Склад</option>
                            <option value="role">Роли</option>
                            <option value="department">Отделы</option>
                            <option value="system_settings">Система</option>
                            <option value="auth">Авторизация</option>
                        </select>
                    </div>

                    <div className="w-full md:w-80 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400  tracking-normal ml-1">Период</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-[18px] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                            <span className="text-slate-300">—</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-slate-200 rounded-[18px] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        {(searchTerm || selectedUserId || selectedEntityType || startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedUserId("");
                                    setSelectedEntityType("");
                                    setStartDate("");
                                    setEndDate("");
                                }}
                                className="h-11 px-4 bg-slate-100 text-slate-600 rounded-[18px] text-[10px] font-bold hover:bg-slate-200 transition-all  tracking-normal"
                            >
                                Сбросить
                            </button>
                        )}
                        {isAdmin && (
                            <button
                                onClick={() => setShowConfirmDialog(true)}
                                className="h-11 px-4 bg-rose-50 text-rose-600 rounded-[18px] text-[10px] font-bold hover:bg-rose-100 transition-all  tracking-normal"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
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

            <ResponsiveDataView
                data={logs}
                renderTable={() => (
                    <div className="bg-white rounded-[18px] border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400  tracking-normal">Действие</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400  tracking-normal">Тип объекта</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400  tracking-normal">Пользователь</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400  tracking-normal">Дата и время</th>
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
                                        <td colSpan={4} className="py-20 text-center text-slate-400 text-sm">
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
                                                        <div className={cn("h-10 w-10 rounded-[18px] flex items-center justify-center transition-colors shadow-sm border border-transparent", entity.bg, entity.color, "group-hover:scale-110")}>
                                                            <Icon className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-700 text-sm leading-tight">{log.action}</div>
                                                            {log.details && (
                                                                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-medium bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-200/50 w-fit">
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
                                                        "px-2 py-0.5 rounded-[18px] text-[9px] font-bold  tracking-tight",
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
                                                                        <NextImage
                                                                            src={log.user.avatar}
                                                                            alt={log.user.name}
                                                                            className="w-full h-full object-cover relative z-10"
                                                                            width={28}
                                                                            height={28}
                                                                            unoptimized
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    (log.user?.name || "С")[0]
                                                                )}
                                                            </div>
                                                            <span className="text-sm text-slate-900 truncate max-w-[150px] font-medium">{log.user?.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm font-medium">Система</span>
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
                )}
                renderCard={(log) => {
                    const entity = getEntityInfo(log.entityType);
                    const Icon = entity.icon;
                    return (
                        <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-transparent", entity.bg, entity.color)}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 text-sm leading-tight">{log.action}</div>
                                        <span className={cn(
                                            "inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-tight mt-1",
                                            entity.bg,
                                            entity.color
                                        )}>
                                            {log.entityType}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-900">{format(new Date(log.createdAt), "dd.MM.yyyy", { locale: ru })}</div>
                                    <div className="text-[9px] font-medium text-slate-400">{format(new Date(log.createdAt), "HH:mm:ss")}</div>
                                </div>
                            </div>

                            {log.details && (
                                <div className="text-[10px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 break-words">
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

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                {log.user ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500 shrink-0 overflow-hidden relative">
                                            {log.user.avatar ? (
                                                <NextImage
                                                    src={log.user.avatar}
                                                    alt={log.user.name}
                                                    className="w-full h-full object-cover relative z-10"
                                                    width={28}
                                                    height={28}
                                                    unoptimized
                                                />
                                            ) : (
                                                (log.user?.name || "С")[0]
                                            )}
                                        </div>
                                        <span className="text-xs text-slate-600 font-medium">{log.user?.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-slate-400 text-[10px] font-medium italic">Система</span>
                                )}
                            </div>
                        </div>
                    );
                }}
                mobileGridClassName="grid grid-cols-1 gap-4"
            />

            <PremiumPagination
                totalItems={totalLogs}
                pageSize={20}
                currentPage={page}
                itemNames={['запись', 'записи', 'записей']}
            />
        </div >
    );
}
