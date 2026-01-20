"use client";

import { useEffect, useState, useMemo } from "react";
import { getClients, getManagers, bulkDeleteClients, bulkUpdateClientManager, updateClientField } from "./actions";
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
    Download,
    Mail,
    Phone,
    Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ClientProfileDrawer } from "./client-profile-drawer";
import { EditClientDialog } from "./edit-client-dialog";
import { DeleteClientDialog } from "./delete-client-dialog";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

function FilterSelect({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options: { value: string, label: string }[] }) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
            <div className="relative group">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-slate-100 text-slate-900 text-[13px] rounded-[14px] focus:ring-4 focus:ring-primary/5 focus:border-primary/20 block p-4 pr-12 font-bold cursor-pointer group-hover:border-slate-200 transition-all uppercase tracking-tight shadow-sm"
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none transition-colors group-hover:text-slate-600" />
            </div>
        </div>
    );
}

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
    const currentPage = Number(searchParams.get("page")) || 1;

    // Filter & Sort State
    const [sortBy, setSortBy] = useState<"alphabet" | "last_order" | "order_count" | "revenue">("alphabet");
    const [filterPeriod, setFilterPeriod] = useState<string>("all");
    const [filterOrderCount, setFilterOrderCount] = useState<string>("any");
    const [filterRegion, setFilterRegion] = useState<string>("all");
    const [showFilters, setShowFilters] = useState(false);

    // Mass Actions State
    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const [isBulkUpdating, setIsBulkUpdating] = useState(false);
    const [showManagerSelect, setShowManagerSelect] = useState(false);
    const { toast } = useToast();

    const fetchClients = () => {
        getClients().then(res => {
            if (res.data) setClients(res.data as Client[]);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchClients();
        getManagers().then(res => {
            if (res.data) setManagers(res.data);
        });
    }, []);

    const handleUpdateField = async (clientId: string, field: string, value: string | number | boolean | null) => {
        const res = await updateClientField(clientId, field, value);
        if (res.success) {
            toast("Обновлено", "success");
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

        return result.sort(sortClients);
    }, [clients, searchQuery, filterPeriod, filterOrderCount, filterRegion, sortClients]);

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
            {/* --- PREMIUM FILTER PANEL --- */}
            <div className="glass-panel border-white/80 shadow-crm-xl overflow-hidden relative z-20 group/filter">
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-full bg-primary/5 -skew-x-12 translate-x-32 group-hover/filter:translate-x-24 transition-transform duration-1000 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:h-24 relative z-10">
                    <div className="relative flex-1 group/search w-full">
                        <div className="absolute inset-0 bg-primary/5 rounded-[20px] scale-95 opacity-0 group-focus-within/search:scale-105 group-focus-within/search:opacity-100 transition-all duration-500 blur-xl" />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within/search:text-primary transition-colors z-10" />
                        <input
                            type="text"
                            placeholder="Поиск по клиентской базе (имя, компания, телефон)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-16 pr-8 bg-white/50 border border-slate-100/50 rounded-[20px] text-base font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-0 focus:border-primary/30 transition-all outline-none relative z-10 shadow-inner-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "flex items-center justify-center gap-4 px-10 h-16 rounded-[20px] text-[11px] font-black uppercase tracking-[0.25em] transition-all duration-500 w-full md:w-auto",
                                showFilters
                                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/40 translate-y-[-2px]"
                                    : "bg-white text-slate-500 border border-slate-100 hover:text-slate-900 hover:border-slate-300 shadow-crm-sm hover:scale-105"
                            )}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Параметры
                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-500", showFilters && "rotate-180")} />
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={selectedIds.length === 0}
                            className="h-16 w-16 flex items-center justify-center bg-white border border-slate-100 rounded-[20px] text-slate-400 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all disabled:opacity-30 shadow-crm-sm group/export">
                            <Download className="w-6 h-6 group-hover/export:scale-125 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                {/* Collapsible Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden bg-slate-50/50 border-t border-slate-100/80"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 p-10">
                                <FilterSelect
                                    label="Период активности"
                                    value={filterPeriod}
                                    onChange={setFilterPeriod}
                                    options={[
                                        { value: "all", label: "За все время" },
                                        { value: "month", label: "Последний месяц" },
                                        { value: "quarter", label: "За квартал" },
                                        { value: "year", label: "За год" }
                                    ]}
                                />
                                <FilterSelect
                                    label="Уровень лояльности"
                                    value={filterOrderCount}
                                    onChange={setFilterOrderCount}
                                    options={[
                                        { value: "any", label: "Все типы" },
                                        { value: "0", label: "Новые (0)" },
                                        { value: "1-5", label: "Средние (1-5)" },
                                        { value: "5+", label: "Постоянные (5+)" }
                                    ]}
                                />
                                <FilterSelect
                                    label="Регион / Город"
                                    value={filterRegion}
                                    onChange={setFilterRegion}
                                    options={[
                                        { value: "all", label: "Все локации" },
                                        ...regions.map(r => ({ value: r, label: r }))
                                    ]}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-6 w-[3px] bg-primary rounded-full shadow-[0_0_8px_rgba(93,0,255,0.5)]" />
                    <p className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">
                        Результаты поиска: <span className="text-primary ml-2">{sortedAndFilteredClients.length}</span>
                    </p>
                </div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    Live Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* --- TABLE AREA --- */}
            <div className="crm-card border-none bg-transparent shadow-none overflow-hidden relative z-10">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-3 px-2">
                        <thead>
                            <tr className="text-slate-400">
                                <th className="w-[60px] px-5 py-4 text-left first:rounded-l-2xl last:rounded-r-2xl">
                                    <input
                                        type="checkbox"
                                        className="rounded-[6px] border-slate-300 text-primary focus:ring-primary/20 cursor-pointer h-5 w-5 transition-all"
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.25em] cursor-pointer group hover:text-primary transition-colors" onClick={() => setSortBy("alphabet")}>
                                    <div className="flex items-center gap-3">
                                        Контрагент
                                        <div className={cn("p-1.5 rounded-lg bg-slate-50 transition-all", sortBy === "alphabet" && "bg-primary/10")}>
                                            <ChevronDown className={cn("h-3 w-3", sortBy === "alphabet" ? "text-primary rotate-0" : "opacity-0 group-hover:opacity-50")} />
                                        </div>
                                    </div>
                                </th>
                                <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.25em]">
                                    Контакты
                                </th>
                                <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.25em]">
                                    Куратор
                                </th>
                                <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.25em] cursor-pointer group hover:text-primary transition-colors w-[110px]" onClick={() => setSortBy("order_count")}>
                                    Заказы
                                </th>
                                <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.25em] cursor-pointer group hover:text-primary transition-colors w-[140px]" onClick={() => setSortBy("last_order")}>
                                    Активность
                                </th>
                                {showFinancials && (
                                    <th className="px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.25em] cursor-pointer group hover:text-primary transition-colors w-[150px]" onClick={() => setSortBy("revenue")}>
                                        Финансы
                                    </th>
                                )}
                                <th className="px-5 py-4 text-right text-[11px] font-black uppercase tracking-[0.25em] w-[140px]">Опции</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {currentPageItems.map((client, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.5 }}
                                    key={client.id}
                                    onClick={() => setSelectedClientId(client.id)}
                                    className={cn(
                                        "group cursor-pointer transition-all duration-500 relative bg-white/60 backdrop-blur-md border border-white/80 shadow-crm-sm hover:shadow-crm-lg hover:scale-[1.01] hover:bg-white z-10",
                                        selectedIds.includes(client.id) ? 'bg-primary/5 ring-2 ring-primary/20' : ''
                                    )}
                                >
                                    <td className="px-5 py-6 first:rounded-l-[24px] last:rounded-r-[24px]" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-4">
                                            {/* Vertical Accent Bar */}
                                            <div className={cn(
                                                "absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-500",
                                                selectedIds.includes(client.id) ? "bg-primary h-full top-0 bottom-0" : "bg-slate-100 group-hover:bg-primary/40"
                                            )} />
                                            <input
                                                type="checkbox"
                                                className="rounded-[6px] border-slate-300 text-primary focus:ring-primary/20 cursor-pointer h-5 w-5 transition-all"
                                                checked={selectedIds.includes(client.id)}
                                                onChange={() => handleSelectRow(client.id)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-5 py-6">
                                        <div className="flex flex-col max-w-[180px]">
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span className="text-[14px] font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight line-clamp-1">
                                                    {client.lastName} {client.firstName}
                                                </span>
                                                {client.clientType === "b2b" && (
                                                    <div className="px-1.5 py-0.5 rounded-full bg-slate-900 text-white text-[7px] font-black uppercase tracking-[0.1em] flex items-center gap-1 flex-shrink-0">
                                                        <Crown className="w-2 h-2 text-primary" />
                                                        B2B
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 truncate">
                                                <Building2 className="w-3 h-3 opacity-40 flex-shrink-0" />
                                                {client.company || "Частное лицо"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-6">
                                        <div className="flex flex-col gap-1.5 max-w-[200px]">
                                            <div className="flex items-center gap-2.5 text-slate-500 group-hover:text-slate-900 transition-colors">
                                                <Mail className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                                                <span className="text-[11px] font-bold tracking-tight lowercase truncate">{client.email || "no-email@crm.com"}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-slate-500 group-hover:text-slate-900 transition-colors">
                                                <Phone className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
                                                <span className="text-[11px] font-bold tracking-tighter truncate">
                                                    {["Печатник", "Дизайнер"].includes(userRoleName || "")
                                                        ? "•••-••-••"
                                                        : client.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50/50 rounded-xl border border-slate-100 group/manager hover:border-primary/30 transition-all backdrop-blur-sm">
                                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(93,0,255,0.4)]" />
                                            <select
                                                value={client.managerId || ""}
                                                onChange={(e) => handleUpdateField(client.id, "managerId", e.target.value)}
                                                className="bg-transparent border-none text-[9px] font-black text-slate-500 focus:ring-0 cursor-pointer hover:text-primary transition-colors max-w-[100px] truncate outline-none p-0 uppercase tracking-widest"
                                            >
                                                <option value="">Без куратора</option>
                                                {managers.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td className="px-5 py-6 whitespace-nowrap">
                                        <div className="flex items-center gap-2 bg-slate-50/50 px-3 py-2 rounded-xl border border-slate-100 w-fit">
                                            <span className="text-xl font-black text-slate-900 tracking-tighter">{client.totalOrders || 0}</span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest opacity-60">Ord</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-6 whitespace-nowrap">
                                        {client.lastOrderDate ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.3)]" />
                                                    <span className="text-[13px] font-black text-slate-900 tracking-tight">
                                                        {new Date(client.lastOrderDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest ml-4 opacity-50">
                                                    {Math.floor((Date.now() - new Date(client.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24))}д. назад
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Нет заказов</span>
                                        )}
                                    </td>
                                    {showFinancials && (
                                        <td className="px-5 py-6 whitespace-nowrap">
                                            <div className="text-[15px] font-black text-slate-900 tracking-tighter">
                                                {Math.round(Number(client.totalSpent) || 0).toLocaleString()} <span className="text-[9px] text-primary uppercase ml-0.5">₽</span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-5 py-6 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => setSelectedClientId(client.id)}
                                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all shadow-sm"
                                                title="Full Profile"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingClient(client)}
                                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
                                                title="Quick Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingClient(client)}
                                                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
                                                title="Delete Contact"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
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

            {/* --- PREMIUM PAGINATION --- */}
            {sortedAndFilteredClients.length > 0 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4 py-8 border-t border-slate-100 mt-8">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-6 py-3 rounded-full border border-slate-100/50 shadow-sm">
                        Show <span className="text-slate-900 mx-1">{Math.min(currentPage * 10, sortedAndFilteredClients.length)}</span>
                        of <span className="text-slate-900 ml-1">{sortedAndFilteredClients.length}</span> entries
                    </div>

                    <div className="glass-panel p-2 flex items-center gap-1 border-white/60 shadow-crm-md">
                        <Pagination
                            totalItems={sortedAndFilteredClients.length}
                            pageSize={10}
                            currentPage={currentPage}
                            itemName="клиентов"
                        />
                    </div>
                </div>
            )}

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
