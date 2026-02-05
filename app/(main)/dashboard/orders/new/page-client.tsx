"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Check,
    ShoppingCart,
    User,
    Package,
    Clock,
    RotateCcw,
    Search,
    ChevronRight,
    Plus,
    Tag,
    CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { createOrder, searchClients } from "../actions";
import { validatePromocode } from "../../finance/actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";

interface Client {
    id: string;
    name: string;
    company?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    telegram?: string | null;
    instagram?: string | null;
}

interface OrderInventoryItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    sellingPrice?: number | string | null;
    price?: number;
    orderQuantity?: number;
}

interface CreateOrderPageClientProps {
    initialInventory: OrderInventoryItem[];
    userRoleName?: string | null;
}

export function CreateOrderPageClient({ initialInventory, userRoleName }: CreateOrderPageClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState("");

    // Step 1: Client
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const history = localStorage.getItem("client_search_history");
            return history ? JSON.parse(history) : [];
        }
        return [];
    });
    const [showHistory, setShowHistory] = useState(false);

    const addToHistory = (query: string) => {
        if (!query || query.length < 2) return;
        const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem("client_search_history", JSON.stringify(newHistory));
    };

    // Step 2: Items
    const [selectedItems, setSelectedItems] = useState<OrderInventoryItem[]>([]);
    const [inventory] = useState<OrderInventoryItem[]>(initialInventory);

    // Step 3: Details
    const [details, setDetails] = useState({
        priority: "medium",
        isUrgent: false,
        deadline: "",
        advanceAmount: "0",
        promocodeId: "",
        paymentMethod: "cash",
        appliedPromo: null as {
            id: string;
            code: string;
            discountType: string;
            value: string;
            message?: string;
            calculatedDiscount?: number;
        } | null
    });
    const [promoInput, setPromoInput] = useState("");
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    const handleApplyPromo = async () => {
        if (!promoInput) return;
        setIsApplyingPromo(true);
        const cartTotal = selectedItems.reduce((acc, i) => acc + ((i.price || 0) * (i.orderQuantity || 0)), 0);
        const res = await validatePromocode(promoInput, cartTotal, selectedItems.map(i => ({
            inventoryId: i.id,
            price: i.price || 0,
            quantity: i.orderQuantity || 0
        })));
        setIsApplyingPromo(false);
        if (res.error || !res.data) {
            toast(res.error || "Промокод не найден", "error");
        } else {
            setDetails({
                ...details,
                appliedPromo: res.data ? {
                    ...res.data,
                    id: res.data.id || "",
                    code: res.data.code || "",
                    discountType: res.data.discountType || "percentage",
                    value: String(res.data.value || "0")
                } : null,
                promocodeId: res.data.id || ""
            });
            const message = res.data.message || `Промокод ${promoInput} применен!`;
            toast(message, "success");
        }
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                const res = await searchClients(searchQuery);
                setSearchResults(res.data || []);
                setIsSearching(false);
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
        else router.back();
    };

    const validateStep = (s: number) => {
        setValidationError("");
        if (s === 0 && !selectedClient) {
            setValidationError("Выберите клиента");
            return false;
        }
        if (s === 1 && selectedItems.length === 0) {
            setValidationError("Добавьте хотя бы один товар");
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) setStep(step + 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(step)) return;
        setLoading(true);

        const formData = new FormData();
        if (!selectedClient) return;
        formData.append("clientId", selectedClient.id);
        formData.append("priority", details.priority);
        formData.append("isUrgent", details.isUrgent ? "true" : "false");
        formData.append("advanceAmount", details.advanceAmount);
        formData.append("paymentMethod", details.paymentMethod);
        formData.append("promocodeId", details.promocodeId);
        formData.append("deadline", details.deadline);
        formData.append("items", JSON.stringify(selectedItems.map(item => ({
            inventoryId: item.id,
            quantity: item.orderQuantity || 0,
            price: item.price || 0,
            description: item.name
        }))));

        const res = await createOrder(formData);
        setLoading(false);

        if (res.error) {
            toast(res.error, "error");
            playSound("notification_error");
        } else {
            playSound("order_created");
            toast("Заказ успешно создан", "success");
            router.push("/dashboard/orders");
            router.refresh();
        }
    };

    const addItem = (item: OrderInventoryItem) => {
        if (selectedItems.find(i => i.id === item.id)) return;
        setSelectedItems([...selectedItems, {
            ...item,
            orderQuantity: 1,
            price: Number(item.sellingPrice) || 0
        }]);
    };

    const removeItem = (id: string) => {
        setSelectedItems(selectedItems.filter(i => i.id !== id));
    };

    const updateItem = (id: string, updates: Partial<OrderInventoryItem>) => {
        setSelectedItems(selectedItems.map(i => i.id === id ? { ...i, ...updates } : i));
    };

    const steps = [
        { id: 0, title: "Клиент", desc: "Кто заказывает", icon: User },
        { id: 1, title: "Товары", desc: "Что заказывают", icon: Package },
        { id: 2, title: "Детали", desc: "Сроки и оплата", icon: Clock },
        { id: 3, title: "Обзор", desc: "Проверка данных", icon: Check }
    ];

    return (
        <div className="flex-1 flex flex-col md:h-[calc(100vh-130px)] overflow-hidden bg-slate-50/50">
            <div className="px-8 pt-6 shrink-0">
                <Breadcrumbs
                    items={[
                        { label: "Заказы", href: "/dashboard/orders", icon: ShoppingCart },
                        { label: "Новый заказ" }
                    ]}
                />
            </div>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-4 px-4 sm:px-8 pb-8 pt-4 overflow-y-auto lg:overflow-hidden">
                {/* Sidebar */}
                <aside className="w-full lg:w-[320px] bg-white border border-slate-200 rounded-[24px] flex flex-col shrink-0 relative z-20 shadow-lg overflow-hidden h-auto lg:h-full">
                    <div className="p-6 shrink-0">
                        <button onClick={handleBack} className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold mb-4 transition-all group text-sm">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Назад
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 leading-tight">Новый заказ</h1>
                        <p className="text-[11px] text-slate-500 font-bold opacity-60 mt-1  tracking-wider">Оформление в CRM</p>
                    </div>

                    <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
                        {steps.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    if (s.id < step || validateStep(step)) {
                                        setStep(s.id);
                                        setValidationError("");
                                    }
                                }}
                                className={cn(
                                    "relative w-full text-left p-4 rounded-[var(--radius)] transition-all duration-300 flex items-center gap-4 group",
                                    step === s.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-slate-50 active:scale-[0.98]"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-[var(--radius)] flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                                    step === s.id ? "bg-white/10 border-white/20" : step > s.id ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-slate-50 border-slate-200"
                                )}>
                                    {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                </div>
                                <div className="min-w-0">
                                    <div className={cn("text-xs font-bold leading-none mb-1", step === s.id ? "text-white" : "text-slate-900")}>{s.title}</div>
                                    <div className={cn("text-[10px] font-bold truncate", step === s.id ? "text-white/60" : "text-slate-400")}>{s.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="h-[80px] border-t border-slate-200 bg-white px-7 flex items-center">
                        <div className="text-[10px] font-bold text-slate-400  tracking-normal">
                            {selectedClient ? selectedClient.name : "Клиент не выбран"}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-visible lg:overflow-hidden h-full flex flex-col gap-[var(--crm-grid-gap)]">
                    <div className="bg-white rounded-[24px] shadow-lg border border-slate-200/60 overflow-hidden flex flex-col h-full min-h-[400px]">
                        <div className="flex-1 overflow-y-auto p-6 md:p-10">
                            {step === 0 && (
                                <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h4 className="text-lg font-bold text-slate-900">Выберите клиента</h4>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Поиск по имени, email или телефону..."
                                            value={searchQuery}
                                            onFocus={() => setShowHistory(true)}
                                            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    addToHistory(searchQuery);
                                                }
                                            }}
                                            className="w-full h-12 pl-12 pr-4 rounded-[18px] border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:border-slate-900 transition-all outline-none"
                                        />
                                        {showHistory && searchHistory.length > 0 && !selectedClient && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-200 rounded-[18px] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                                                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-slate-400  tracking-normal">Недавние поиски</span>
                                                </div>
                                                <div className="p-2">
                                                    {searchHistory.map((h, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                setSearchQuery(h);
                                                                setShowHistory(false);
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-[18px] text-sm font-bold text-slate-600 transition-colors flex items-center gap-3"
                                                        >
                                                            <RotateCcw className="w-4 h-4 text-slate-300" />
                                                            {h}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {isSearching && (
                                            <div className="absolute right-4 top-4.5">
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900 border-t-transparent" />
                                            </div>
                                        )}
                                    </div>

                                    {searchResults.length > 0 && !selectedClient && (
                                        <div className="border border-slate-200 rounded-[18px] shadow-xl bg-white overflow-hidden">
                                            {searchResults.map((client) => (
                                                <button
                                                    key={client.id}
                                                    onClick={() => {
                                                        setSelectedClient(client);
                                                        setSearchQuery("");
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors border-b last:border-0"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 font-bold ">{client.name?.charAt(0)}</div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-slate-900">{client.name}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {client.company} • {["Печатник", "Дизайнер"].includes(userRoleName || "") ? "HIDDEN" : client.phone}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {selectedClient && (
                                        <div className="p-6 rounded-[18px] bg-primary text-white flex items-center justify-between shadow-lg shadow-primary/20">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-[18px] bg-white/10 flex items-center justify-center font-bold text-xl ">{selectedClient.name[0]}</div>
                                                <div>
                                                    <p className="font-bold">{selectedClient.name}</p>
                                                    <p className="text-xs text-white/60  tracking-normal">{selectedClient.company || "Личный заказ"}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedClient(null)} className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-[18px] transition-all">Изменить</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-bold text-slate-900">Выберите товары из каталога</h4>
                                        <div className="text-xs font-bold text-slate-400">ВЫБРАНО: {selectedItems.length}</div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {/* Catalog */}
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                                <input placeholder="Поиск товара..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border-slate-200 rounded-[18px] text-sm outline-none" />
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                                                {inventory.map(item => (
                                                    <button
                                                        key={item.id}
                                                        disabled={selectedItems.some(i => i.id === item.id)}
                                                        onClick={() => addItem(item)}
                                                        className="flex items-center justify-between p-3 rounded-[18px] border border-slate-200 hover:bg-slate-50 transition-all text-left disabled:opacity-50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-100 rounded-[18px] flex items-center justify-center text-slate-400 font-bold"><Package className="w-5 h-5" /></div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                                                <p className="text-[10px] text-slate-500  font-bold tracking-wider">Остаток: {item.quantity} {item.unit}</p>
                                                            </div>
                                                        </div>
                                                        <Plus className="w-4 h-4 text-slate-400" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Selected */}
                                        <div className="bg-slate-50/50 rounded-[18px] p-6 border border-slate-200 space-y-4">
                                            <p className="text-xs font-bold text-slate-400  tracking-normal">Выбранные позиции</p>
                                            {selectedItems.length === 0 ? (
                                                <div className="h-40 flex flex-col items-center justify-center text-slate-300 gap-2">
                                                    <ShoppingCart className="w-8 h-8 opacity-20" />
                                                    <p className="text-xs font-bold">Список пуст</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {selectedItems.map(item => (
                                                        <div key={item.id} className="bg-white p-4 rounded-[18px] shadow-sm border border-slate-200 space-y-4">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-sm font-bold">{item.name}</p>
                                                                <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 font-bold">Удалить</button>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-sm font-bold text-slate-700 ml-1">Кол-во</label>
                                                                    <input
                                                                        type="number"
                                                                        value={item.orderQuantity || 0}
                                                                        onChange={(e) => updateItem(item.id, { orderQuantity: Number(e.target.value) })}
                                                                        className="w-full bg-slate-50 border-none rounded-[18px] px-3 py-2 text-sm"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-sm font-bold text-slate-700 ml-1">Цена (₽)</label>
                                                                    <input
                                                                        type="number"
                                                                        value={item.price || 0}
                                                                        onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                                                                        className="w-full bg-slate-50 border-none rounded-[18px] px-3 py-2 text-sm"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h4 className="text-lg font-bold text-slate-900">Детали заказа</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--crm-grid-gap)]">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Приоритет</label>
                                            <select
                                                value={details.priority}
                                                onChange={(e) => setDetails({ ...details, priority: e.target.value })}
                                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 font-bold text-sm focus:bg-white outline-none appearance-none"
                                            >
                                                <option value="low">Низкий</option>
                                                <option value="medium">Средний</option>
                                                <option value="high">Высокий</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Дедлайн</label>
                                            <input
                                                type="date"
                                                value={details.deadline}
                                                onChange={(e) => setDetails({ ...details, deadline: e.target.value })}
                                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 font-bold text-sm focus:bg-white outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--crm-grid-gap)]">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Срочный заказ</label>
                                            <div
                                                onClick={() => setDetails({ ...details, isUrgent: !details.isUrgent })}
                                                className={cn(
                                                    "w-full h-12 px-4 rounded-[18px] border flex items-center justify-between cursor-pointer transition-all",
                                                    details.isUrgent ? "bg-rose-50 border-rose-200 text-rose-700 font-bold" : "bg-slate-50 border-slate-200 text-slate-400"
                                                )}
                                            >
                                                <span>{details.isUrgent ? "ДА, СРОЧНО" : "НЕТ"}</span>
                                                <div className={cn("w-2 h-2 rounded-full", details.isUrgent ? "bg-rose-500" : "bg-slate-300")} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Способ оплаты</label>
                                            <select
                                                value={details.paymentMethod}
                                                onChange={(e) => setDetails({ ...details, paymentMethod: e.target.value })}
                                                className="w-full h-12 px-4 rounded-[18px] border border-slate-200 bg-slate-50 font-bold text-sm focus:bg-white outline-none appearance-none"
                                            >
                                                <option value="cash">Наличные</option>
                                                <option value="bank">Безнал (Карта)</option>
                                                <option value="online">Онлайн-касса</option>
                                                <option value="account">Расчетный счет</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-700 ml-1">Предоплата (₽)</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                                            <input
                                                type="number"
                                                value={details.advanceAmount}
                                                onChange={(e) => setDetails({ ...details, advanceAmount: e.target.value })}
                                                className="w-full h-12 pl-12 pr-4 rounded-[18px] border border-slate-200 bg-slate-50 font-bold text-lg focus:bg-white focus:border-slate-900 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-bold text-slate-400  tracking-normal ml-1">Промокод</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Введите промокод..."
                                                    value={promoInput}
                                                    onChange={(e) => setPromoInput(e.target.value)}
                                                    className="w-full h-12 pl-12 pr-4 rounded-[18px] border border-slate-200 bg-slate-50 font-bold text-sm focus:bg-white focus:border-slate-900 outline-none "
                                                />
                                            </div>
                                            <button
                                                onClick={handleApplyPromo}
                                                disabled={isApplyingPromo || !promoInput}
                                                className="h-12 px-6 rounded-[18px] bg-slate-100 font-bold text-slate-900 hover:bg-slate-200 transition-all disabled:opacity-50"
                                            >
                                                {isApplyingPromo ? "..." : "Применить"}
                                            </button>
                                        </div>
                                        {details.appliedPromo && (
                                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-[18px] animate-in fade-in slide-in-from-top-2">
                                                <p className="text-xs font-bold text-emerald-700 flex items-center justify-between">
                                                    <span>Промокод: {details.appliedPromo.code}</span>
                                                    <span className="uppercase">
                                                        {details.appliedPromo.discountType === 'percentage' ? `-${details.appliedPromo.value}%` :
                                                            details.appliedPromo.discountType === 'fixed' ? `-${details.appliedPromo.value} ₽` :
                                                                details.appliedPromo.discountType === 'free_shipping' ? "БЕСПЛ. ДОСТАВКА" : "ПОДАРОК"}
                                                    </span>
                                                </p>
                                                {details.appliedPromo.message && (
                                                    <p className="text-[10px] text-emerald-600 font-medium mt-1 uppercase italic">{details.appliedPromo.message}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h4 className="text-xl font-bold text-slate-900">Подтверждение заказа</h4>

                                    <div className="bg-slate-50 rounded-[18px] p-6 space-y-4">
                                        <div className="flex justify-between border-b pb-4">
                                            <span className="text-slate-500 font-bold text-xs  tracking-wider">Клиент</span>
                                            <span className="font-bold">{selectedClient?.name}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-slate-500 font-bold text-xs  tracking-wider">Товары</span>
                                            {selectedItems.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm py-1">
                                                    <span>{item.name} x {item.orderQuantity || 0}</span>
                                                    <span className="font-bold">{(item.price || 0) * (item.orderQuantity || 0)} ₽</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between pt-4 border-t text-xl font-bold">
                                            <span>ИТОГО</span>
                                            <div className="text-right">
                                                {details.appliedPromo ? (
                                                    <>
                                                        <span className="text-sm text-slate-400 line-through mr-2 font-bold">
                                                            {selectedItems.reduce((acc, i) => acc + ((i.price || 0) * (i.orderQuantity || 0)), 0)} ₽
                                                        </span>
                                                        <span>
                                                            {(() => {
                                                                const total = selectedItems.reduce((acc, i) => acc + ((i.price || 0) * (i.orderQuantity || 0)), 0);
                                                                const disc = details.appliedPromo?.calculatedDiscount || 0;
                                                                return Math.max(0, Math.round(total - disc));
                                                            })()} ₽
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span>{selectedItems.reduce((acc, i) => acc + ((i.price || 0) * (i.orderQuantity || 0)), 0)} ₽</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--crm-grid-gap)]">
                                        <div className="p-4 bg-white border rounded-[18px]">
                                            <p className="text-[10px] font-bold text-slate-400  tracking-normal mb-1">Приоритет</p>
                                            <p className="font-bold  text-xs">{details.priority}</p>
                                        </div>
                                        <div className="p-4 bg-white border rounded-[18px]">
                                            <p className="text-[10px] font-bold text-slate-400  tracking-normal mb-1">Оплата</p>
                                            <p className="font-bold  text-xs">{details.paymentMethod}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 md:px-10 py-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50/30 gap-4">
                            <div className="flex flex-col">
                                {validationError && (
                                    <span className="text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-left-2">{validationError}</span>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleBack} className="px-6 py-3 rounded-[var(--radius-inner)] border border-slate-200 text-sm font-bold text-slate-400 hover:text-slate-900 bg-white transition-all">Назад</button>
                                {step < 3 ? (
                                    <button onClick={handleNext} className="px-8 py-3 btn-dark rounded-[var(--radius-inner)] text-sm font-bold shadow-lg transition-all flex items-center gap-2 border-none">
                                        Далее <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={handleSubmit} disabled={loading} className="px-12 py-3 btn-dark rounded-[var(--radius-inner)] text-sm font-bold shadow-lg disabled:opacity-50 transition-all border-none">
                                        {loading ? "Создание..." : "Подтвердить и создать"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
