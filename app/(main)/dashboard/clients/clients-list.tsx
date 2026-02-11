"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { getClients, getManagers, bulkDeleteClients, bulkUpdateClientManager, updateClientField, bulkArchiveClients } from "./actions";
import { undoLastAction } from "../undo-actions";
import { exportToCSV } from "@/lib/export-utils";
import {
    Search,
    SlidersHorizontal,
    Eye,
    Pencil,
    Trash2,
    ChevronDown,
    Users as UsersIcon,
    Download,
    Archive,
    ArchiveRestore,
    RotateCcw,
    X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { ClientProfileDrawer } from "./client-profile-drawer";
import { EditClientDialog } from "./edit-client-dialog";
import { DeleteClientDialog } from "./delete-client-dialog";
import { useSearchParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { PremiumPagination } from "@/components/ui/premium-pagination";
import { pluralize } from "@/lib/pluralize";
import { ResponsiveDataView } from "@/components/ui/responsive-data-view";
import { ChevronRight } from "lucide-react";
import { useBranding } from "@/components/branding-provider";

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    patronymic?: string | null;
    email: string | null;
    phone: string;
    city: string | null;
    company: string | null;
    comments: string | null;
    socialLink: string | null;
    managerId: string | null;
    totalOrders: number;
    totalSpent: number | string; // decimal string or number
    lastOrderDate: string | null;
    clientType: "b2c" | "b2b";
    acquisitionSource?: string | null;
}

export function ClientsTable({ userRoleName, showFinancials }: { userRoleName?: string | null, showFinancials?: boolean }) {
    const { currencySymbol } = useBranding();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deletingClient, setDeletingClient] = useState<Client | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentPage = Number(searchParams.get("page")) || 1;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Filter & Sort State
    const [sortBy, setSortBy] = useState<"alphabet" | "last_order" | "order_count" | "revenue">("alphabet");
    const [filterPeriod, setFilterPeriod] = useState<string>("all");
    const [filterOrderCount, setFilterOrderCount] = useState<string>("any");
    const [filterRegion, setFilterRegion] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all"); // "all" | "lost"
    const [showArchived, setShowArchived] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Search History State
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const history = localStorage.getItem("client_search_history");
        if (history) setSearchHistory(JSON.parse(history));
    }, []);

    const addToHistory = (query: string) => {
        if (!query || query.length < 2) return;
        const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem("client_search_history", JSON.stringify(newHistory));
    };

    // Mass Actions State
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [showManagerSelect, setShowManagerSelect] = useState(false);
    const { toast } = useToast();

    const fetchClients = useCallback(() => {
        getClients(showArchived).then(res => {
            if (res.data) setClients(res.data as Client[]);
            setLoading(false);
        });
    }, [showArchived]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    useEffect(() => {
        getManagers().then(res => {
            if (res.data) setManagers(res.data);
        });
    }, []);

    const handleUpdateField = async (clientId: string, field: string, value: string | number | boolean | null) => {
        const res = await updateClientField(clientId, field, value);
        if (res?.success) {
            toast("Обновлено", "success", { mutation: true });
            fetchClients();
        } else {
            toast(res?.error || "Ошибка обновления", "error");
        }
    };

    const handleBulkArchive = async () => {
        setIsBulkUpdating(true);
        const res = await bulkArchiveClients(selectedIds, !showArchived);
        setIsBulkUpdating(false);
        if (res?.success) {
            toast(showArchived ? "Клиенты восстановлены" : "Клиенты архивированы", "success");
            setSelectedIds([]);
            fetchClients();
        } else {
            toast(res?.error || "Ошибка архивации", "error");
        }
    };

    // Extract unique regions for filter
    const regions = useMemo(() => {
        const unique = new Set(clients.map(c => c.city).filter(Boolean));
        return Array.from(unique).sort() as string[];
    }, [clients]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const sortClients = (a: Client, b: Client) => {
        switch (sortBy) {
            case "alphabet":
                return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
            case "last_order":
                const dateA = a.lastOrderDate ? new Date(a.lastOrderDate).getTime() : 0;
                const dateB = b.lastOrderDate ? new Date(b.lastOrderDate).getTime() : 0;
                return dateB - dateA;
            case "order_count":
                return (b.totalOrders || 0) - (a.totalOrders || 0);
            case "revenue":
                return (Number(b.totalSpent) || 0) - (Number(a.totalSpent) || 0);
            default:
                return 0;
        }
    };

    const sortedAndFilteredClients = useMemo(() => {
        let result = [...clients];

        // Search filtering
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(client => {
                const fullName = `${client.lastName} ${client.firstName} ${client.patronymic || ""}`.toLowerCase();
                return (
                    fullName.includes(query) ||
                    (client.company?.toLowerCase().includes(query)) ||
                    (client.phone?.toLowerCase().includes(query)) ||
                    (client.email?.toLowerCase().includes(query))
                );
            });
        }

        // Period Filter (Last Order Date)
        if (filterPeriod !== "all") {
            const now = new Date();
            const filterDate = new Date();
            if (filterPeriod === "month") filterDate.setMonth(now.getMonth() - 1);
            else if (filterPeriod === "quarter") filterDate.setMonth(now.getMonth() - 3);
            else if (filterPeriod === "year") filterDate.setFullYear(now.getFullYear() - 1);

            result = result.filter(client => {
                if (!client.lastOrderDate) return false;
                return new Date(client.lastOrderDate) >= filterDate;
            });
        }

        // Order Count Filter
        if (filterOrderCount !== "any") {
            result = result.filter(client => {
                const count = client.totalOrders || 0;
                if (filterOrderCount === "0") return count === 0;
                if (filterOrderCount === "1-5") return count >= 1 && count <= 5;
                if (filterOrderCount === "5+") return count > 5;
                return true;
            });
        }

        // Region Filter
        if (filterRegion !== "all") {
            result = result.filter(client => client.city === filterRegion);
        }

        // Status Filter (Lost)
        if (filterStatus === "lost") {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            result = result.filter(client => {
                if (!client.lastOrderDate) return true; // Never ordered = potentially lost if old enough, but let's assume lost means "ordered long ago or never"
                return new Date(client.lastOrderDate) < threeMonthsAgo;
            });
        }

        return result.sort(sortClients);
    }, [clients, searchQuery, filterPeriod, filterOrderCount, filterRegion, filterStatus, sortClients]);

    const currentPageItems = useMemo(() =>
        sortedAndFilteredClients.slice((currentPage - 1) * 10, currentPage * 10),
        [sortedAndFilteredClients, currentPage]
    );

    const isAllSelected = currentPageItems.length > 0 && currentPageItems.every(c => selectedIds.includes(c.id));

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(prev => prev.filter(id => !currentPageItems.some(c => c.id === id)));
        } else {
            const newIds = [...selectedIds];
            currentPageItems.forEach(c => {
                if (!newIds.includes(c.id)) newIds.push(c.id);
            });
            setSelectedIds(newIds);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleExport = () => {
        const selectedClients = clients.filter(c => selectedIds.includes(c.id));
        exportToCSV(selectedClients, "clients_export", [
            { header: "ID", key: "id" },
            { header: "Тип", key: "clientType" },
            { header: "Фамилия", key: "lastName" },
            { header: "Имя", key: "firstName" },
            { header: "Отчество", key: (item) => item.patronymic || "" },
            { header: "Компания", key: (item) => item.company || "" },
            { header: "Email", key: (item) => item.email || "" },
            { header: "Телефон", key: "phone" },
            { header: "Город", key: (item) => item.city || "" },
            { header: "Заказов", key: "totalOrders" },
            { header: "Потрачено", key: "totalSpent" }
        ]);
        toast("Экспорт завершен", "success");
        playSound("notification_success");
    };

    if (loading) return <div className="text-slate-400 p-12 text-center">Загрузка клиентов...</div>;

    return (
        <div className="space-y-6">
            {/* New Filter Panel - Photo 2 Style */}
            <div className="crm-filter-tray flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 p-1.5 rounded-[22px]">
                <Search className="h-4 w-4 text-slate-400 hidden sm:block" />
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 sm:hidden" />
                    <input
                        type="text"
                        placeholder="Поиск по базе клиентов..."
                        value={searchQuery}
                        onFocus={() => setShowHistory(true)}
                        onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            if (e.target.value.length > 3) {
                                // Debounce history addition or just do it on enter/blur
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                addToHistory(searchQuery);
                                (e.target as HTMLInputElement).blur();
                            }
                        }}
                        className="crm-filter-tray-search w-full pl-12 sm:pl-4 pr-10 focus:outline-none"
                    />
                    {showHistory && searchHistory.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400  tracking-normal">Недавние поиски</span>
                                <button
                                    onClick={() => {
                                        setSearchHistory([]);
                                        localStorage.removeItem("client_search_history");
                                    }}
                                    className="text-[9px] font-bold text-rose-400 hover:text-rose-600 "
                                >
                                    Очистить
                                </button>
                            </div>
                            <div className="p-1">
                                {searchHistory.map((h, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSearchQuery(h);
                                            setShowHistory(false);
                                        }}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-600 transition-colors flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-3 h-3 text-slate-300" />
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "crm-filter-tray-tab flex-1 sm:flex-none h-10 sm:h-auto rounded-[16px]",
                            showFilters && "active"
                        )}
                    >
                        {showFilters && (
                            <motion.div
                                layoutId="activeClientFilters"
                                className="absolute inset-0 bg-primary rounded-[16px] z-0"
                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            />
                        )}
                        <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10" />
                        <span className="relative z-10 hidden sm:inline">Параметры</span>
                        <span className="relative z-10 sm:hidden">Фильтры</span>
                        <ChevronDown className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10 transition-all duration-300", showFilters && "rotate-180")} />
                    </button>
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={cn(
                            "crm-filter-tray-tab flex-1 sm:flex-none h-10 sm:h-auto rounded-[16px]",
                            showArchived && "active"
                        )}
                    >
                        {showArchived && (
                            <motion.div
                                layoutId="activeClientArchive"
                                className="absolute inset-0 bg-amber-100 rounded-[16px] z-0"
                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            />
                        )}
                        <span className={cn("flex items-center gap-2 relative z-10", showArchived && "text-amber-700")}>
                            {showArchived ? <ArchiveRestore className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Archive className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                            <span className="hidden sm:inline">{showArchived ? "Архив" : "База"}</span>
                            <span className="sm:hidden">{showArchived ? "Архив" : "База"}</span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="space-y-4">
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="crm-card !rounded-[20px] overflow-hidden"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                                {/* Period Filter */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-500 ml-1">Период</label>
                                    <div className="relative group">
                                        <select
                                            value={filterPeriod}
                                            onChange={(e) => setFilterPeriod(e.target.value)}
                                            className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-[13px] rounded-[10px] focus:ring-2 focus:ring-slate-100 focus:border-slate-2000 block p-3 pr-10 font-semibold cursor-pointer group-hover:border-slate-300 transition-all"
                                        >
                                            <option value="all">За все время</option>
                                            <option value="month">Месяц</option>
                                            <option value="quarter">Квартал</option>
                                            <option value="year">Год</option>
                                        </select>
                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-colors group-hover:text-slate-600" />
                                    </div>
                                </div>

                                {/* Order Count Filter */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-500 ml-1">Активность (зак.)</label>
                                    <div className="relative group">
                                        <select
                                            value={filterOrderCount}
                                            onChange={(e) => setFilterOrderCount(e.target.value)}
                                            className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-[13px] rounded-[10px] focus:ring-2 focus:ring-slate-100 focus:border-slate-2000 block p-3 pr-10 font-semibold cursor-pointer group-hover:border-slate-300 transition-all"
                                        >
                                            <option value="any">Любая</option>
                                            <option value="0">Новые (0)</option>
                                            <option value="1-5">Средняя (1-5)</option>
                                            <option value="5+">Постоянные (5+)</option>
                                        </select>
                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-colors group-hover:text-slate-600" />
                                    </div>
                                </div>

                                {/* Region Filter */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-500 ml-1">Локация</label>
                                    <div className="relative group">
                                        <select
                                            value={filterRegion}
                                            onChange={(e) => setFilterRegion(e.target.value)}
                                            className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-[13px] rounded-[10px] focus:ring-2 focus:ring-slate-100 focus:border-slate-2000 block p-3 pr-10 font-semibold cursor-pointer group-hover:border-slate-300 transition-all"
                                        >
                                            <option value="all">Все регионы</option>
                                            {regions.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-colors group-hover:text-slate-600" />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold text-slate-500 ml-1">Статус</label>
                                    <div className="relative group">
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-[13px] rounded-[10px] focus:ring-2 focus:ring-slate-100 focus:border-slate-2000 block p-3 pr-10 font-semibold cursor-pointer group-hover:border-slate-300 transition-all"
                                        >
                                            <option value="all">Все клиенты</option>
                                            <option value="lost">Потерянные (3+ мес)</option>
                                        </select>
                                        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-colors group-hover:text-slate-600" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="px-1 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500">Найдено: <span className="text-slate-900">{sortedAndFilteredClients.length} {pluralize(sortedAndFilteredClients.length, 'клиент', 'клиента', 'клиентов')}</span></p>
                    <div className="text-[10px] font-medium text-slate-400">Обновлено: {new Date().toLocaleTimeString()}</div>
                </div>

                {/* Table Area */}
                <div className="crm-card !p-0 border-none overflow-hidden shadow-sm">
                    <ResponsiveDataView
                        data={currentPageItems}
                        mobileGridClassName="flex flex-col divide-y divide-slate-100 md:hidden"
                        desktopClassName="hidden md:block"
                        renderTable={() => (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="w-[60px] px-3 md:px-4 py-4 text-left">
                                                <input
                                                    type="checkbox"
                                                    className="rounded-[6px] border-slate-300 text-primary focus:ring-0 cursor-pointer h-4 w-4"
                                                    checked={isAllSelected}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="px-3 md:px-4 py-4 text-left text-[10px] font-bold text-slate-400 cursor-pointer group hover:text-primary transition-colors" onClick={() => setSortBy("alphabet")}>
                                                <div className="flex items-center gap-1.5">
                                                    Клиент
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400">
                                                Контакты
                                            </th>
                                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400">
                                                Ответственный
                                            </th>
                                            <th className="px-3 md:px-4 py-4 text-left text-[10px] font-bold text-slate-400 cursor-pointer group hover:text-primary transition-colors" onClick={() => setSortBy("order_count")}>
                                                <div className="flex items-center gap-1.5">
                                                    Заказы
                                                    <ChevronDown className={`h-3 w-3 ${sortBy === "order_count" ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all`} />
                                                </div>
                                            </th>
                                            <th className="px-3 md:px-4 py-4 text-left text-[10px] font-bold text-slate-400 cursor-pointer group hover:text-primary transition-colors" onClick={() => setSortBy("last_order")}>
                                                <div className="flex items-center gap-1.5">
                                                    Активность
                                                    <ChevronDown className={`h-3 w-3 ${sortBy === "last_order" ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all`} />
                                                </div>
                                            </th>
                                            {showFinancials && (
                                                <th className="px-3 md:px-4 py-4 text-left text-[10px] font-bold text-slate-400 cursor-pointer group hover:text-primary transition-colors" onClick={() => setSortBy("revenue")}>
                                                    <div className="flex items-center gap-1.5">
                                                        LTV (Выручка)
                                                        <ChevronDown className={`h-3 w-3 ${sortBy === "revenue" ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all`} />
                                                    </div>
                                                </th>
                                            )}
                                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400">Действия</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentPageItems.map(client => (
                                            <tr
                                                key={client.id}
                                                onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                                className={`hover:bg-gray-50 transition-colors group cursor-pointer ${selectedIds.includes(client.id) ? 'bg-primary/5' : ''}`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-slate-300 text-primary focus:ring-0 cursor-pointer"
                                                        checked={selectedIds.includes(client.id)}
                                                        onChange={() => handleSelectRow(client.id)}
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-700">{`${client.lastName} ${client.firstName}`}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium tracking-normal">
                                                            {client.company || "Частное лицо"}
                                                        </span>
                                                        {client.acquisitionSource && (
                                                            <span className="text-[9px] font-bold text-indigo-500 mt-1 uppercase tracking-wider">
                                                                {client.acquisitionSource}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-700">{client.email || "—"}</span>
                                                        <span className="text-xs text-slate-400 font-medium tracking-normal">
                                                            {["Печатник", "Дизайнер"].includes(userRoleName || "")
                                                                ? "HIDDEN"
                                                                : client.phone}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={client.managerId || ""}
                                                        onChange={(e) => handleUpdateField(client.id, "managerId", e.target.value)}
                                                        className="bg-transparent border-none text-[11px] font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-primary transition-colors max-w-[120px] truncate outline-none"
                                                    >
                                                        <option value="">Общий</option>
                                                        {managers.map(m => (
                                                            <option key={m.id} value={m.id}>{m.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{client.totalOrders || 0}</span>
                                                        <span className="text-[10px] text-slate-400 font-medium">{pluralize(client.totalOrders || 0, 'заказ', 'заказа', 'заказов')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                                                    {client.lastOrderDate ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                                                {new Date(client.lastOrderDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                {(() => {
                                                                    const diffDays = Math.floor((Date.now() - new Date(client.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
                                                                    if (diffDays > 90) {
                                                                        return (
                                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-600">
                                                                                LOST
                                                                            </span>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })()}
                                                            </span>
                                                            <span className="text-xs text-slate-400 font-medium">
                                                                {Math.floor((Date.now() - new Date(client.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))} дн. назад
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Нет заказов</span>
                                                    )}
                                                </td>
                                                {showFinancials && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">
                                                        {Math.round(Number(client.totalSpent) || 0)} {currencySymbol}
                                                    </td>
                                                )}
                                                <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all"
                                                            title="Просмотреть"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingClient(client)}
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all"
                                                            title="Редактировать"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        renderCard={(client) => {
                            const isSelected = selectedIds.includes(client.id);
                            const lastOrderDate = client.lastOrderDate ? new Date(client.lastOrderDate) : null;
                            const diffDays = lastOrderDate ? Math.floor((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
                            const isLost = diffDays !== null && diffDays > 90;

                            return (
                                <div
                                    key={client.id}
                                    onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                    className={cn(
                                        "group relative flex items-center justify-between p-4 transition-all duration-300 cursor-pointer active:bg-slate-50",
                                        isSelected ? "bg-primary/5" : "bg-white"
                                    )}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                                            <input
                                                type="checkbox"
                                                className="rounded-[6px] border-slate-300 text-primary focus:ring-0 cursor-pointer h-5 w-5"
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(client.id)}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-black text-slate-900 truncate leading-tight">
                                                    {client.lastName} {client.firstName}
                                                </span>
                                                {isLost && (
                                                    <span className="inline-flex px-1.5 py-0.5 rounded-[4px] text-[8px] font-black bg-rose-50 text-rose-600 uppercase tracking-tighter">
                                                        Lost
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                <span className="truncate">{client.company || "Частное лицо"}</span>
                                                <span className="text-slate-200">•</span>
                                                <span className="bg-slate-50 px-1.5 py-0.5 rounded-[4px] shrink-0">
                                                    {client.totalOrders || 0} {pluralize(client.totalOrders || 0, 'зак.', 'зак.', 'зак.')}
                                                </span>
                                                {showFinancials && (
                                                    <>
                                                        <span className="text-slate-200">•</span>
                                                        <span className="text-emerald-600">{Math.round(Number(client.totalSpent) || 0)} {currencySymbol}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                        <div className="text-right hidden sm:block">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Активность</div>
                                            <div className="text-xs font-bold text-slate-900">
                                                {diffDays !== null ? `${diffDays} дн. назад` : "—"}
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>

                {
                    sortedAndFilteredClients.length === 0 && (
                        <div className="text-center py-20 text-slate-400">
                            <p className="text-lg font-medium">По вашему запросу ничего не найдено</p>
                            <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
                        </div>
                    )
                }
                <ClientProfileDrawer
                    clientId={selectedClientId || ""}
                    isOpen={!!selectedClientId}
                    onClose={() => setSelectedClientId(null)}
                    onEdit={() => {
                        const client = clients.find(c => c.id === selectedClientId);
                        if (client) {
                            setEditingClient(client);
                            setSelectedClientId(null);
                        }
                    }}
                    showFinancials={showFinancials}
                    userRoleName={userRoleName}
                />

                {
                    editingClient && (
                        <EditClientDialog
                            client={editingClient}
                            isOpen={!!editingClient}
                            onClose={() => {
                                setEditingClient(null);
                                fetchClients();
                            }}
                        />
                    )
                }

                {
                    deletingClient && (
                        <DeleteClientDialog
                            client={deletingClient}
                            isOpen={!!deletingClient}
                            onClose={() => {
                                setDeletingClient(null);
                                fetchClients();
                            }}
                        />
                    )
                }
            </div>

            {
                sortedAndFilteredClients.length > 0 && (
                    <PremiumPagination
                        totalItems={sortedAndFilteredClients.length}
                        pageSize={10}
                        currentPage={currentPage}
                        itemNames={['клиент', 'клиента', 'клиентов']}
                    />
                )
            }

            <AnimatePresence>
                {selectedIds.length > 0 && mounted && createPortal(
                    <>
                        {/* Bottom Progressive Gradient Blur Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="fixed inset-x-0 bottom-0 h-80 pointer-events-none z-[80]"
                            style={{
                                maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                background: 'linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 40%, transparent 100%)'
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                            exit={{ opacity: 0, y: 100, x: "-50%", scale: 0.9 }}
                            transition={{ type: "spring", damping: 20, stiffness: 200 }}
                            className="fixed bottom-10 left-1/2 z-[100] flex items-center bg-white p-2.5 px-8 gap-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200"
                        >
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20 text-white">
                                    {selectedIds.length}
                                </div>
                                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Клиентов выбрано</span>
                            </div>

                            <div className="w-px h-8 bg-slate-200 mx-2" />

                            <div className="flex items-center gap-1">
                                {/* Export */}
                                {["Администратор", "Управляющий", "Отдел продаж"].includes(userRoleName || "") && (
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-slate-100 transition-all group"
                                    >
                                        <Download className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Экспорт</span>
                                    </button>
                                )}

                                {/* Manager Change */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowManagerSelect(!showManagerSelect)}
                                        className={cn(
                                            "h-11 px-6 rounded-full text-[11px] font-bold transition-all active:scale-95 flex items-center gap-2",
                                            showManagerSelect ? "bg-slate-900 text-white" : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                                        )}
                                    >
                                        <UsersIcon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">Назначить менеджера</span>
                                    </button>

                                    {showManagerSelect && (
                                        <div className="absolute bottom-full left-0 mb-4 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                            <div className="p-3 border-b border-slate-200 bg-slate-50/50">
                                                <div className="text-[10px] font-semibold text-slate-400">Выберите менеджера</div>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto p-2">
                                                <button
                                                    onClick={async () => {
                                                        setIsBulkUpdating(true);
                                                        const res = await bulkUpdateClientManager(selectedIds, "");
                                                        setIsBulkUpdating(false);
                                                        if (res.success) {
                                                            toast("Менеджеры обновлены", "success");
                                                            playSound("client_updated");
                                                            setShowManagerSelect(false);
                                                            setSelectedIds([]);
                                                            fetchClients();
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-900 transition-colors"
                                                >
                                                    Без менеджера
                                                </button>
                                                {managers.map(m => (
                                                    <button
                                                        key={m.id}
                                                        onClick={async () => {
                                                            setIsBulkUpdating(true);
                                                            const res = await bulkUpdateClientManager(selectedIds, m.id);
                                                            setIsBulkUpdating(false);
                                                            if (res.success) {
                                                                toast(`Назначен: ${m.name}`, "success");
                                                                playSound("client_updated");
                                                                setShowManagerSelect(false);
                                                                setSelectedIds([]);
                                                                fetchClients();
                                                            }
                                                        }}
                                                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-900 transition-colors"
                                                    >
                                                        {m.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Archive/Restore */}
                                {["Администратор", "Управляющий"].includes(userRoleName || "") && (
                                    <button
                                        onClick={handleBulkArchive}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-amber-500 hover:text-white transition-all group"
                                    >
                                        <Archive className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors">Архив</span>
                                    </button>
                                )}

                                {userRoleName === "Администратор" && (
                                    <button
                                        onClick={async () => {
                                            if (confirm(`Вы уверены что хотите удалить ${selectedIds.length} ${pluralize(selectedIds.length, 'клиента', 'клиентов', 'клиентов')}? Это действие необратимо и удалит все связанные заказы.`)) {
                                                setIsBulkUpdating(true);
                                                const res = await bulkDeleteClients(selectedIds);
                                                setIsBulkUpdating(false);
                                                if (res.success) {
                                                    toast(`База очищена (${selectedIds.length} ${pluralize(selectedIds.length, 'человек', 'человека', 'человек')})`, "success", {
                                                        action: {
                                                            label: "Отменить",
                                                            onClick: async () => {
                                                                const undoRes = await undoLastAction();
                                                                if (undoRes.success) {
                                                                    toast("Действие отменено", "success");
                                                                    playSound("notification_success");
                                                                    fetchClients();
                                                                } else {
                                                                    toast(undoRes.error || "Не удалось отменить", "error");
                                                                    playSound("notification_error");
                                                                }
                                                            }
                                                        }
                                                    });
                                                    playSound("client_deleted");
                                                    setSelectedIds([]);
                                                    fetchClients();
                                                } else {
                                                    toast(res.error || "Ошибка удаления", "error");
                                                    playSound("notification_error");
                                                }
                                            }
                                        }}
                                        disabled={isBulkUpdating}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-full btn-destructive-ghost transition-all group"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-xs font-bold">Удалить</span>
                                    </button>
                                )}

                                <div className="w-px h-8 bg-slate-200 mx-2" />

                                <button
                                    onClick={() => {
                                        setSelectedIds([]);
                                        setShowManagerSelect(false);
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </>,
                    document.body
                )}
            </AnimatePresence>

        </div>
    );
}
