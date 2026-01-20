"use client";

import { useEffect, useState, useMemo } from "react";
import { getClients, getManagers, bulkDeleteClients, bulkUpdateClientManager, updateClientField, toggleClientArchived } from "./actions";
import { undoLastAction } from "../undo-actions";
import {
    Search,
    SlidersHorizontal,
    Eye,
    Pencil,
    Trash2,
    ChevronDown,
    Building2,
    Users as UsersIcon,
    Check,
    Download,
    Undo2,
    Archive,
    ArchiveRestore,
    RotateCcw
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ClientProfileDrawer } from "./client-profile-drawer";
import { EditClientDialog } from "./edit-client-dialog";
import { DeleteClientDialog } from "./delete-client-dialog";
import { useSearchParams, useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

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
}

export function ClientsTable({ userRoleName, showFinancials }: { userRoleName?: string | null, showFinancials?: boolean }) {
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

    // Filter & Sort State
    const [sortBy, setSortBy] = useState<"alphabet" | "last_order" | "order_count" | "revenue">("alphabet");
    const [filterPeriod, setFilterPeriod] = useState<string>("all");
    const [filterOrderCount, setFilterOrderCount] = useState<string>("any");
    const [filterRegion, setFilterRegion] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all"); // "all" | "lost"
    const [showRegionFilter, setShowRegionFilter] = useState(false);
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

    const fetchClients = () => {
        getClients(showArchived).then(res => {
            if (res.data) setClients(res.data as Client[]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchClients();
    }, [showArchived]);

    useEffect(() => {
        fetchClients();
        getManagers().then(res => {
            if (res.data) setManagers(res.data);
        });
    }, []);

    const handleUpdateField = async (clientId: string, field: string, value: string | number | boolean | null) => {
        const res = await updateClientField(clientId, field, value);
        if (res.success) {
            toast("Обновлено", "success", { mutation: true });
            fetchClients();
        } else {
            toast(res.error || "Ошибка обновления", "error");
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
        const headers = ["ID", "Тип", "Фамилия", "Имя", "Компания", "Email", "Телефон", "Город", "Заказов", "Потрачено"];
        const csvContent = [
            headers.join(","),
            ...selectedClients.map(c => [
                c.id,
                c.clientType,
                `"${c.lastName}"`,
                `"${c.firstName}"`,
                `"${c.company || ""}"`,
                c.email || "",
                c.phone,
                `"${c.city || ""}"`,
                c.totalOrders,
                c.totalSpent
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast("Экспорт завершен", "success");
    };

    if (loading) return <div className="text-slate-400 p-12 text-center">Загрузка клиентов...</div>;

    return (
        <div className="space-y-6">
            {/* New Filter Panel */}
            <div className="bg-white border border-slate-200/60 rounded-[var(--radius-inner)] shadow-sm transition-all overflow-hidden">
                {/* Top: Search and Toggle */}
                <div className="flex items-center gap-2 p-1 pl-5 pr-1.5 h-14">
                    <Search className="h-4 w-4 text-slate-400" />
                    <div className="flex-1 relative">
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
                            className="w-full py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-[13px] font-semibold text-slate-900 placeholder:text-slate-400"
                        />
                        {showHistory && searchHistory.length > 0 && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                <div className="px-4 py-2 bg-slate-50 border-b border-slate-50 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Недавние поиски</span>
                                    <button
                                        onClick={() => {
                                            setSearchHistory([]);
                                            localStorage.removeItem("client_search_history");
                                        }}
                                        className="text-[9px] font-bold text-rose-400 hover:text-rose-600 uppercase"
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
                                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-600 transition-colors flex items-center gap-2"
                                        >
                                            <RotateCcw className="w-3 h-3 text-slate-300" />
                                            {h}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            "flex items-center gap-2.5 px-5 py-2.5 rounded-[10px] text-[11px] font-bold transition-all",
                            showFilters ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Параметры
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-all duration-300", showFilters && "rotate-180")} />
                    </button>
                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={cn(
                            "flex items-center gap-2.5 px-5 py-2.5 rounded-[10px] text-[11px] font-bold transition-all",
                            showArchived ? "bg-amber-100 text-amber-700 shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        {showArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                        {showArchived ? "Архив" : "База"}
                    </button>
                </div>

                {/* Collapsible Content */}
                {showFilters && (
                    <div className="bg-slate-50/50 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                            {/* Period Filter */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-slate-500 ml-1">Период</label>
                                <div className="relative group">
                                    <select
                                        value={filterPeriod}
                                        onChange={(e) => setFilterPeriod(e.target.value)}
                                        className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-[13px] rounded-[10px] focus:ring-2 focus:ring-slate-100 focus:border-slate-500 block p-3 pr-10 font-semibold cursor-pointer group-hover:border-slate-300 transition-all"
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
                                        className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-[13px] rounded-[10px] focus:ring-2 focus:ring-slate-100 focus:border-slate-500 block p-3 pr-10 font-semibold cursor-pointer group-hover:border-slate-300 transition-all"
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
                                        className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-[13px] rounded-[10px] focus:ring-2 focus:ring-slate-100 focus:border-slate-500 block p-3 pr-10 font-semibold cursor-pointer group-hover:border-slate-300 transition-all"
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
                                        className="w-full appearance-none bg-white border border-slate-200 text-slate-900 text-[13px] rounded-[10px] focus:ring-2 focus:ring-slate-100 focus:border-slate-500 block p-3 pr-10 font-semibold cursor-pointer group-hover:border-slate-300 transition-all"
                                    >
                                        <option value="all">Все клиенты</option>
                                        <option value="lost">Потерянные (3+ мес)</option>
                                    </select>
                                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-colors group-hover:text-slate-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-1 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-slate-500">Найдено клиентов: <span className="text-slate-900">{sortedAndFilteredClients.length}</span></p>
                <div className="text-[10px] font-medium text-slate-400 italic">Обновлено: {new Date().toLocaleTimeString()}</div>
            </div>

            {/* Table */}
            <div className="crm-card border-none bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="w-[60px] px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded-[6px] border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer h-4 w-4"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 cursor-pointer group hover:text-indigo-600 transition-colors" onClick={() => setSortBy("alphabet")}>
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
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 cursor-pointer group hover:text-indigo-600 transition-colors" onClick={() => setSortBy("order_count")}>
                                    <div className="flex items-center gap-1.5">
                                        Заказы
                                        <ChevronDown className={`h-3 w-3 ${sortBy === "order_count" ? "text-indigo-600 opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all`} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 cursor-pointer group hover:text-indigo-600 transition-colors" onClick={() => setSortBy("last_order")}>
                                    <div className="flex items-center gap-1.5">
                                        Активность
                                        <ChevronDown className={`h-3 w-3 ${sortBy === "last_order" ? "text-indigo-600 opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all`} />
                                    </div>
                                </th>
                                {showFinancials && (
                                    <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 cursor-pointer group hover:text-indigo-600 transition-colors" onClick={() => setSortBy("revenue")}>
                                        <div className="flex items-center gap-1.5">
                                            LTV (Выручка)
                                            <ChevronDown className={`h-3 w-3 ${sortBy === "revenue" ? "text-indigo-600 opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all`} />
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
                                    className={`hover:bg-gray-50 transition-colors group cursor-pointer ${selectedIds.includes(client.id) ? 'bg-indigo-50/30' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                                            checked={selectedIds.includes(client.id)}
                                            onChange={() => handleSelectRow(client.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700">{client.email || "—"}</span>
                                            <span className="text-xs text-slate-400 font-medium tracking-tight">
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
                                            className="bg-transparent border-none text-[11px] font-bold text-slate-600 focus:ring-0 cursor-pointer hover:text-indigo-600 transition-colors max-w-[120px] truncate outline-none"
                                        >
                                            <option value="">Общий</option>
                                            {managers.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{client.totalOrders || 0}</span>
                                            <span className="text-[10px] text-slate-400 font-medium">заказов</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {client.lastOrderDate ? (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {new Date(client.lastOrderDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                                            {Math.round(Number(client.totalSpent) || 0)} ₽
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Просмотреть"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingClient(client)}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                title="Редактировать"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {userRoleName === "Администратор" && (
                                                <>
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const res = await toggleClientArchived(client.id, !showArchived);
                                                            if (res.success) {
                                                                toast(showArchived ? "Клиент восстановлен" : "Клиент архивирован", "success");
                                                                fetchClients();
                                                            }
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                        title={showArchived ? "Восстановить" : "Архивировать"}
                                                    >
                                                        {showArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeletingClient(client);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                    <Pagination
                        totalItems={sortedAndFilteredClients.length}
                        pageSize={10}
                        currentPage={currentPage}
                        itemName="клиентов"
                    />
                )
            }

            {/* Mass Actions Panel */}
            {
                selectedIds.length > 0 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-5 bg-slate-950 text-white rounded-[24px] shadow-2xl shadow-slate-900/40 border border-slate-800 z-50 animate-in slide-in-from-bottom-10 duration-500">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-800 font-black text-xs border border-slate-700">
                                {selectedIds.length}
                            </div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Клиентов выбрано</div>
                                <div className="text-xs font-bold">Действия с группой</div>
                            </div>
                        </div>

                        <div className="w-[1px] h-8 bg-slate-800" />

                        <div className="flex items-center gap-2">
                            {/* Export */}
                            <button
                                onClick={handleExport}
                                className="bg-slate-800 hover:bg-slate-700 h-11 px-6 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center gap-2 text-white"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Экспорт (CSV)
                            </button>

                            {/* Manager Change */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowManagerSelect(!showManagerSelect)}
                                    className={cn(
                                        "h-11 px-6 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center gap-2",
                                        showManagerSelect ? "bg-white text-slate-900" : "bg-slate-800 hover:bg-slate-700 text-white"
                                    )}
                                >
                                    <UsersIcon className="w-3.5 h-3.5" />
                                    Назначить менеджера
                                </button>

                                {showManagerSelect && (
                                    <div className="absolute bottom-full left-0 mb-4 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                        <div className="p-3 border-b border-slate-800 bg-slate-800/50">
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
                                                        setShowManagerSelect(false);
                                                        setSelectedIds([]);
                                                        fetchClients();
                                                    }
                                                }}
                                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800 text-sm font-bold transition-colors"
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
                                                            setShowManagerSelect(false);
                                                            setSelectedIds([]);
                                                            fetchClients();
                                                        }
                                                    }}
                                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800 text-sm font-bold transition-colors"
                                                >
                                                    {m.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {userRoleName === "Администратор" && (
                                <button
                                    onClick={async () => {
                                        if (confirm(`Вы уверены что хотите удалить ${selectedIds.length} клиентов? Это действие необратимо и удалит все связанные заказы.`)) {
                                            setIsBulkUpdating(true);
                                            const res = await bulkDeleteClients(selectedIds);
                                            setIsBulkUpdating(false);
                                            if (res.success) {
                                                toast(`База очищена (${selectedIds.length})`, "success", {
                                                    action: {
                                                        label: "Отменить",
                                                        onClick: async () => {
                                                            const undoRes = await undoLastAction();
                                                            if (undoRes.success) {
                                                                toast("Действие отменено", "success");
                                                                fetchClients();
                                                            } else {
                                                                toast(undoRes.error || "Не удалось отменить", "error");
                                                            }
                                                        }
                                                    }
                                                });
                                                setSelectedIds([]);
                                                fetchClients();
                                            } else {
                                                toast(res.error || "Ошибка удаления", "error");
                                            }
                                        }
                                    }}
                                    disabled={isBulkUpdating}
                                    className="bg-rose-500/10 hover:bg-rose-500 hover:text-white h-11 px-6 rounded-xl text-[11px] font-bold transition-all active:scale-95 flex items-center gap-2 text-rose-500 disabled:opacity-50"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Удалить группу
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedIds([]);
                                    setShowManagerSelect(false);
                                }}
                                className="h-11 px-4 text-slate-400 hover:text-white transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                )
            }

        </div>
    );
}
