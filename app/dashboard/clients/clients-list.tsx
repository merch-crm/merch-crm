"use client";

import { useEffect, useState, useMemo } from "react";
import { getClients } from "./actions";
import {
    Search,
    SlidersHorizontal,
    Eye,
    Pencil,
    Trash2,
    ChevronDown
} from "lucide-react";
import { ClientProfileDrawer } from "./client-profile-drawer";
import { EditClientDialog } from "./edit-client-dialog";
import { DeleteClientDialog } from "./delete-client-dialog";
import { useSearchParams } from "next/navigation";
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
    const currentPage = Number(searchParams.get("page")) || 1;

    // Filter & Sort State
    const [sortBy, setSortBy] = useState<"alphabet" | "last_order" | "order_count" | "revenue">("alphabet");
    const [filterPeriod, setFilterPeriod] = useState<string>("all");
    const [filterOrderCount, setFilterOrderCount] = useState<string>("any");
    const [filterRegion, setFilterRegion] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);

    const fetchClients = () => {
        getClients().then(res => {
            if (res.data) setClients(res.data as Client[]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchClients();
    }, []);

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

        return result.sort(sortClients);
    }, [clients, searchQuery, filterPeriod, filterOrderCount, filterRegion, sortClients]);

    const currentPageItems = useMemo(() =>
        sortedAndFilteredClients.slice((currentPage - 1) * 20, currentPage * 20),
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

    if (loading) return <div className="text-slate-400 p-12 text-center">Загрузка клиентов...</div>;

    return (
        <div className="space-y-6">
            {/* New Filter Panel */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm transition-all">
                {/* Top: Search and Toggle */}
                <div className="flex items-center gap-2 p-1 pl-4 pr-1">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по имени, email или телефону..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-sm font-medium placeholder:text-slate-400"
                    />
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${showFilters ? 'bg-slate-100 text-slate-900' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        Фильтры
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Collapsible Content */}
                {showFilters && (
                    <>
                        <div className="h-px bg-slate-100" />

                        {/* Bottom: Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                            {/* Period Filter */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Период заказа</label>
                                <div className="relative">
                                    <select
                                        value={filterPeriod}
                                        onChange={(e) => setFilterPeriod(e.target.value)}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-0 focus:border-indigo-500 block p-2.5 pr-8 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <option value="all">Все время</option>
                                        <option value="month">За последний месяц</option>
                                        <option value="quarter">За последние 3 месяца</option>
                                        <option value="year">За последний год</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Order Count Filter */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Количество заказов</label>
                                <div className="relative">
                                    <select
                                        value={filterOrderCount}
                                        onChange={(e) => setFilterOrderCount(e.target.value)}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-0 focus:border-indigo-500 block p-2.5 pr-8 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <option value="any">Любое количество</option>
                                        <option value="0">Без заказов</option>
                                        <option value="1-5">1 - 5 заказов</option>
                                        <option value="5+">Более 5 заказов</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Region Filter */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Регион</label>
                                <div className="relative">
                                    <select
                                        value={filterRegion}
                                        onChange={(e) => setFilterRegion(e.target.value)}
                                        className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-0 focus:border-indigo-500 block p-2.5 pr-8 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <option value="all">Все регионы</option>
                                        {regions.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="px-1">
                <p className="text-sm font-bold text-slate-400">Найдено клиентов: <span className="text-slate-900">{sortedAndFilteredClients.length}</span></p>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="w-[50px] px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group hover:text-slate-900 transition-colors" onClick={() => setSortBy("alphabet")}>
                                    <div className="flex items-center gap-1">
                                        Клиент
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <div className="flex items-center gap-1">
                                        Контакты
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group hover:text-slate-900 transition-colors" onClick={() => setSortBy("order_count")}>
                                    <div className="flex items-center gap-1">
                                        Заказы
                                        <ChevronDown className={`h-3 w-3 ${sortBy === "order_count" ? "text-indigo-600 opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`} />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group hover:text-slate-900 transition-colors" onClick={() => setSortBy("last_order")}>
                                    <div className="flex items-center gap-1">
                                        Последний заказ
                                        <ChevronDown className={`h-3 w-3 ${sortBy === "last_order" ? "text-indigo-600 opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`} />
                                    </div>
                                </th>
                                {showFinancials && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group hover:text-slate-900 transition-colors" onClick={() => setSortBy("revenue")}>
                                        <div className="flex items-center gap-1">
                                            Сумма покупок
                                            <ChevronDown className={`h-3 w-3 ${sortBy === "revenue" ? "text-indigo-600 opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`} />
                                        </div>
                                    </th>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentPageItems.map(client => (
                                <tr
                                    key={client.id}
                                    onClick={() => setSelectedClientId(client.id)}
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
                                            <span className="font-bold text-slate-900 text-[15px]">{client.lastName} {client.firstName}</span>
                                            <span className="text-xs text-slate-400 font-medium">{client.city || "Город не указан"}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700">{client.email || "—"}</span>
                                            <span className="text-xs text-slate-400 font-medium">{client.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{client.totalOrders || 0}</span>
                                            <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">заказов</span>
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
                                            <span className="text-xs text-slate-400 italic">Нет заказов</span>
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
                                                onClick={() => setSelectedClientId(client.id)}
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
                                                <button
                                                    onClick={() => setDeletingClient(client)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Удалить"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {sortedAndFilteredClients.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <p className="text-lg font-medium">По вашему запросу ничего не найдено</p>
                        <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
                    </div>
                )}
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
                />

                {editingClient && (
                    <EditClientDialog
                        client={editingClient}
                        isOpen={!!editingClient}
                        onClose={() => {
                            setEditingClient(null);
                            fetchClients();
                        }}
                    />
                )}

                {deletingClient && (
                    <DeleteClientDialog
                        client={deletingClient}
                        isOpen={!!deletingClient}
                        onClose={() => {
                            setDeletingClient(null);
                            fetchClients();
                        }}
                    />
                )}
            </div>

            {sortedAndFilteredClients.length > 0 && (
                <Pagination
                    totalItems={sortedAndFilteredClients.length}
                    pageSize={20}
                    currentPage={currentPage}
                    itemName="клиентов"
                />
            )}

        </div>
    );
}
