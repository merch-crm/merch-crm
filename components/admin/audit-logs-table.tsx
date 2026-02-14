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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumSelect } from "@/components/ui/premium-select";

const PAGE_SIZE = 20;

interface AuditLogDetails {
    fileName?: string;
    name?: string;
    reason?: string;
    oldKey?: string;
    newKey?: string;
    oldPath?: string;
    newPath?: string;
    key?: string;
    path?: string;
    count?: number;
    [key: string]: unknown;
}

interface AuditLog {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    details: AuditLogDetails | null;
    createdAt: Date | string;
    userId: string | null;
    user?: {
        name: string;
        avatar?: string | null;
    } | null;
}

const formatLogDetails = (details: AuditLogDetails | null): string | null => {
    if (!details) return null;

    return (
        (details.fileName as string) ||
        (details.name as string) ||
        (details.reason as string) ||
        (details.oldKey && details.newKey ? `${details.oldKey} → ${details.newKey}` : null) ||
        (details.oldPath && details.newPath ? `${details.oldPath} → ${details.newPath}` : null) ||
        (details.key as string) ||
        (details.path as string) ||
        (details.count ? `Объектов: ${details.count}` : null) ||
        JSON.stringify(details)
    );
};

const formatDate = (date: Date | string, formatStr: string) => {
    try {
        return format(new Date(date), formatStr, { locale: ru });
    } catch {
        return "—";
    }
};

const UserAvatar = ({ user, size = 28 }: { user: AuditLog['user']; size?: number }) => {
    const initial = (user?.name || "С")[0];

    return (
        <div
            className={cn(
                "rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center",
                "text-[10px] font-bold text-slate-500 shrink-0 overflow-hidden relative"
            )}
            style={{ width: size, height: size }}
        >
            {user?.avatar ? (
                <>
                    <span className="absolute inset-0 flex items-center justify-center">
                        {initial}
                    </span>
                    <NextImage
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover relative z-10"
                        width={size}
                        height={size}
                        unoptimized
                    />
                </>
            ) : (
                initial
            )}
        </div>
    );
};

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
                PAGE_SIZE,
                query,
                selectedUserId || null,
                selectedEntityType || null,
                startDate || null,
                endDate || null
            );
            if (res.success && res.data) {
                setLogs(res.data.logs as AuditLog[]);
                setTotalLogs(res.data.total || 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, query, selectedUserId, selectedEntityType, startDate, endDate]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await getUsers(1, 100);
                if (res.success && res.data) setAllUsers(res.data.users);
            } catch (error) {
                console.error("Failed to fetch users:", error);
                toast("Не удалось загрузить список пользователей", "destructive");
            }
        };
        fetchUsers();
    }, [toast]);

    const handleClearLogs = async () => {
        setClearing(true);
        try {
            const res = await clearAuditLogs();
            if (res.success) {
                toast("Логи успешно очищены", "success");
                fetchLogs();
            } else {
                toast(res.error || "Ошибка при очистке логов", "destructive");
            }
        } catch (error) {
            console.error(error);
            toast("Произошла ошибка", "destructive");
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
                <div className="flex flex-col xl:flex-row xl:items-end gap-4">
                    <div className="flex-1 space-y-2 min-w-[200px]">
                        <label className="text-[10px] font-bold text-slate-400 tracking-normal ml-1">Поиск</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <Input
                                type="text"
                                placeholder="Действие..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="w-full xl:w-48 space-y-2">
                        <PremiumSelect
                            label="Сотрудник"
                            placeholder="Все сотрудники"
                            value={selectedUserId}
                            onChange={setSelectedUserId}
                            options={[
                                { title: "Все сотрудники", id: "" },
                                ...allUsers.map(u => ({ title: u.name, id: u.id }))
                            ]}
                            compact
                        />
                    </div>

                    <div className="w-full xl:w-48 space-y-2">
                        <PremiumSelect
                            label="Тип объекта"
                            placeholder="Все типы"
                            value={selectedEntityType}
                            onChange={setSelectedEntityType}
                            options={[
                                { title: "Все типы", id: "" },
                                { title: "Пользователи", id: "user" },
                                { title: "Заказы", id: "order" },
                                { title: "Клиенты", id: "client" },
                                { title: "Склад", id: "inventory" },
                                { title: "Роли", id: "role" },
                                { title: "Отделы", id: "department" },
                                { title: "Система", id: "system_settings" },
                                { title: "Авторизация", id: "auth" },
                            ]}
                            compact
                        />
                    </div>

                    <div className="w-full xl:w-80 space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 tracking-normal ml-1">Период</label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-xs font-bold"
                            />
                            <span className="text-slate-300">—</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-xs font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                        {(searchTerm || selectedUserId || selectedEntityType || startDate || endDate) && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedUserId("");
                                    setSelectedEntityType("");
                                    setStartDate("");
                                    setEndDate("");
                                }}
                                className="h-10 px-4 text-[10px]"
                            >
                                Сбросить
                            </Button>
                        )}
                        {isAdmin && (
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setShowConfirmDialog(true)}
                                className="h-10 w-10 bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100"
                                aria-label="Очистить логи аудита"
                            >
                                <Trash2 size={16} />
                            </Button>
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
                                                                <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-medium bg-slate-50/50 px-2 py-0.5 rounded-md border border-slate-200/50 w-fit">
                                                                    {formattedDetails}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="crm-td">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight",
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
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5">
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
                                    <div className="text-[10px] font-bold text-slate-900">{formatDate(log.createdAt, "dd.MM.yyyy")}</div>
                                    <div className="text-[9px] font-medium text-slate-400">{formatDate(log.createdAt, "HH:mm:ss")}</div>
                                </div>
                            </div>

                            {formattedDetails && (
                                <div className="text-[10px] text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100 break-words">
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
                pageSize={PAGE_SIZE}
                currentPage={page}
                itemNames={['запись', 'записи', 'записей']}
            />
        </div>
    );
}
