"use client";

import { useTransition, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { 
    Search, User, ChevronLeft, ChevronRight, 
    Download, RefreshCw, Box, ShoppingCart, Users, Settings, Database, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ResponsiveModal } from "@/components/ui/responsive-modal";

export interface AuditLog {
    id: string;
    userId: string | null;
    action: string;
    actionCategory: string | null;
    entityType: string;
    entityId: string;
    details: unknown;
    createdAt: string;
    user?: { name: string; email: string; avatar?: string | null };
}

interface AuditClientProps {
    initialLogs: AuditLog[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
    users: { id: string; name: string }[];
}

const ENTITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    order: ShoppingCart,
    client: Users,
    warehouse: Box,
    system: Settings,
    role: Database,
    user: User,
    default: ActivityIcon
};

function ActivityIcon({ className }: { className?: string }) {
    return <RefreshCw className={className} />;
}

export function AuditClient({ initialLogs, pagination, users }: AuditClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Filter states
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const userId = searchParams.get("userId") || "all";
    const entityType = searchParams.get("entityType") || "all";

    const updateFilters = (params: Record<string, string | number | null>) => {
        const newParams = new URLSearchParams(searchParams.toString());
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === "all" || value === "") {
                newParams.delete(key);
            } else {
                newParams.set(key, String(value));
            }
        });
        // Always reset to page 1 on filter change
        if (!params.page) newParams.delete("page");
        
        startTransition(() => {
            router.push(`${pathname}?${newParams.toString()}`);
        });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search });
    };

    const handlePageChange = (newPage: number) => {
        updateFilters({ page: newPage });
    };

    const exportToCsv = () => {
        const headers = ["Дата", "Пользователь", "Действие", "Тип", "ID Сущности", "Детали"];
        const rows = initialLogs.map(log => [
            format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss", { locale: ru }),
            log.user?.name || "Система",
            log.action,
            log.entityType,
            log.entityId,
            JSON.stringify(log.details)
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers, ...rows].map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audit_log_${format(new Date(), "yyyy-MM-dd", { locale: ru })}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getEntityIcon = (type: string) => {
        const Icon = ENTITY_ICONS[type] || ENTITY_ICONS.default;
        return <Icon className="w-full h-full" />;
    };

    const renderDiff = (details: unknown) => {
        if (!details) return <p className="text-slate-400 italic">Нет деталей</p>;
        
        // Check if it's a diff object
        const isDiff = typeof details === "object" && details !== null && Object.values(details).some((v: unknown) => v && typeof v === 'object' && ('old' in v || 'new' in v));

        if (!isDiff) {
            return (
                <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-[400px]">
                    <pre className="text-xs text-blue-300">
                        {JSON.stringify(details, null, 2)}
                    </pre>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {Object.entries(details as Record<string, Record<string, unknown>>).map(([key, value]) => {
                    if (key === 'originalEntityId') return null;
                    return (
                        <div key={key} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                            <h4 className="text-xs font-black text-slate-400 mb-2">{key}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-rose-500 px-2 py-0.5 bg-rose-50 rounded-lg">Было</span>
                                    <div className="p-3 bg-rose-50/30 rounded-xl border border-rose-100 text-sm font-medium text-slate-700 min-h-[40px]">
                                        {String(value.old ?? "—")}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-emerald-500 px-2 py-0.5 bg-emerald-50 rounded-lg">Стало</span>
                                    <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100 text-sm font-medium text-slate-800 min-h-[40px]">
                                        {String(value.new ?? "—")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-$1-3">
            {/* Filters Bento Block */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                <div className="lg:col-span-2 crm-card p-4">
                    <form onSubmit={handleSearchSubmit} className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Поиск по действию..." 
                            className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-2xl font-medium focus:ring-primary/10 transition-all"
                        />
                    </form>
                </div>
                
                <div className="lg:col-span-1 crm-card p-4 flex gap-2">
                    <Select 
                        value={userId}
                        options={[
                            { id: "all", title: "Все пользователи" },
                            ...(users || []).map(u => ({ id: u.id, title: u.name }))
                        ]}
                        className="h-11 flex-1"
                        onChange={(val) => updateFilters({ userId: val })}
                    />
                </div>

                <div className="lg:col-span-1 crm-card p-4 flex gap-2">
                    <Button 
                        onClick={exportToCsv}
                        variant="outline"
                        className="h-11 w-full rounded-2xl border-slate-200 hover:bg-slate-50 font-bold transition-all group"
                    >
                        <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        SVG/Excel
                    </Button>
                </div>
            </div>

            {/* Entity Filter Chips */}
            <div className="flex flex-wrap gap-2 px-1">
                {["all", "order", "client", "warehouse", "role", "system"].map(type => (
                    <button
                        type="button"
                        key={type}
                        onClick={() => updateFilters({ entityType: type })}
                        className={cn(
                            "px-4 py-2 rounded-2xl text-xs font-black transition-all border shadow-sm",
                            entityType === type 
                                ? "bg-primary text-white border-primary shadow-primary/20 scale-105" 
                                : "bg-white text-slate-500 border-slate-200 hover:border-primary/40 hover:text-primary"
                        )}
                    >
                        {type === 'all' ? 'Все' : type === 'order' ? 'Заказы' : type === 'client' ? 'Клиенты' : type === 'warehouse' ? 'Склад' : type === 'role' ? 'Роли' : 'Система'}
                    </button>
                ))}
            </div>

            {/* Main Table Block */}
            <div className="crm-card overflow-hidden">
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="crm-table">
                        <thead className="crm-thead">
                            <tr>
                                <th className="crm-th w-[180px]">Дата и время</th>
                                <th className="crm-th">Действие</th>
                                <th className="crm-th">Кто</th>
                                <th className="crm-th">Сущность</th>
                                <th className="crm-th text-right">Детали</th>
                            </tr>
                        </thead>
                        <tbody className="crm-tbody">
                            {initialLogs.map((log) => (
                                <tr key={log.id} className="crm-tr group">
                                    <td className="crm-td">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-900">
                                                {format(new Date(log.createdAt), "d MMMM", { locale: ru })}
                                            </span>
                                            <span className="text-xs font-medium text-slate-400">
                                                {format(new Date(log.createdAt), "HH:mm:ss", { locale: ru })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="crm-td">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded-xl flex items-center justify-center border",
                                                log.actionCategory === 'system' ? "bg-amber-50 border-amber-100 text-amber-500" : "bg-primary/5 border-primary/10 text-primary"
                                            )}>
                                                {getEntityIcon(log.entityType)}
                                            </div>
                                            <span className="text-sm font-bold text-slate-800">{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="crm-td">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 overflow-hidden relative">
                                                {log.user?.avatar ? (
                                                    <Image src={log.user.avatar} fill className="object-cover" alt="" unoptimized />
                                                ) : (
                                                    log.user?.name?.charAt(0) || "S"
                                                )}
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">
                                                {log.user?.name || "Система"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="crm-td">
                                        <Badge variant="outline" className="bg-slate-50 text-slate-500 font-bold border-none capitalize">
                                            {log.entityType}
                                        </Badge>
                                    </td>
                                    <td className="crm-td text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedLog(log);
                                                setIsDetailsOpen(true);
                                            }}
                                            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400">
                        Всего записей: <span className="text-slate-900 font-bold">{pagination.total}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={pagination.page <= 1 || isPending}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            className="w-9 h-9 rounded-xl border border-slate-200 bg-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <span className="text-xs font-bold px-3">
                            {pagination.page} / {pagination.totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={pagination.page >= pagination.totalPages || isPending}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            className="w-9 h-9 rounded-xl border border-slate-200 bg-white"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            <ResponsiveModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                title="Детали изменения"
                description={`Лог ID: ${selectedLog?.id}`}
                className="max-w-2xl"
            >
                <div className="pb-6">
                    <div className="mb-6 flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-primary border border-slate-100">
                                {selectedLog && getEntityIcon(selectedLog.entityType)}
                             </div>
                             <div>
                                <p className="text-xs font-bold text-slate-400 tracking-wider">Действие</p>
                                <p className="text-sm font-black text-slate-900">{selectedLog?.action}</p>
                             </div>
                        </div>
                        <div className="text-right">
                             <p className="text-xs font-bold text-slate-400 tracking-wider">Время</p>
                             <p className="text-sm font-black text-slate-900">
                                {selectedLog && format(new Date(selectedLog.createdAt), "HH:mm:ss, d MMM", { locale: ru })}
                             </p>
                        </div>
                    </div>
                    
                    <div className="space-$1-3">
                        <h4 className="text-sm font-black text-slate-900 px-1 flex items-center gap-2">
                             <RefreshCw className="w-4 h-4 text-primary" />
                             Изменения в полях
                        </h4>
                        {selectedLog && renderDiff(selectedLog.details)}
                    </div>
                </div>
            </ResponsiveModal>
        </div>
    );
}
