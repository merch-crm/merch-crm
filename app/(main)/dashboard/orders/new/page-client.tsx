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
    CreditCard,
    AlertCircle
} from "lucide-react";
import { cn, formatUnit } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { createOrder, searchClients } from "../actions";
import { ActionResult } from "@/lib/types";
import { validatePromocode } from "../../finance/actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumSelect } from "@/components/ui/premium-select";
import { useBranding } from "@/components/branding-provider";
import { Switch } from "@/components/ui/switch";

interface Client {
    id: string;
    name: string | null;
    company?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    telegram?: string | null;
    instagram?: string | null;
}

interface OrderInventoryItem {
    id: string;
    name: string | null;
    quantity: number;
    unit: string | null;
    sellingPrice?: number | string | null;
    price?: number;
    orderQuantity?: number;
}

interface CreateOrderPageClientProps {
    initialInventory: OrderInventoryItem[];
    userRoleName?: string | null;
}

export function CreateOrderPageClient({ initialInventory, userRoleName }: CreateOrderPageClientProps) {
    const { currencySymbol } = useBranding();
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
    const [searchHistory, setSearchHistory] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const history = localStorage.getItem("client_search_history");
                if (history) {
                    setSearchHistory(JSON.parse(history));
                }
            } catch (e) {
                console.error("Failed to parse search history", e);
            }
        }
    }, []);
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

        if (!res.success) {
            toast(res.error || "Промокод не найден", "error");
        } else if (res.data) {
            setDetails({
                ...details,
                appliedPromo: {
                    ...res.data,
                    id: res.data.id || "",
                    code: res.data.code || "",
                    discountType: res.data.discountType || "percentage",
                    value: String(res.data.value || "0")
                },
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
                if (res.success && res.data) {
                    setSearchResults(res.data.map(c => ({
                        id: c.id,
                        name: c.name,
                        company: c.company,
                        phone: c.phone,
                        email: c.email,
                        address: c.address,
                        telegram: c.telegram,
                        instagram: c.instagram
                    })));
                } else {
                    setSearchResults([]);
                }
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
        if (!selectedClient) {
            toast("Выберите клиента", "destructive");
            setLoading(false);
            return;
        }
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
            description: item.name || ""
        }))));

        const res: ActionResult = await createOrder(formData);
        setLoading(false);

        if (!res.success) {
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
        <div className="flex-1 flex flex-col md:h-[calc(100vh-130px)] overflow-hidden bg-muted/50">
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
                <aside className="crm-card w-full lg:w-[320px] flex-shrink-0 h-fit sticky top-6 z-10 hidden lg:block overflow-hidden h-auto lg:h-full">
                    <div className="p-6 shrink-0">
                        <Button variant="ghost" onClick={handleBack} className="pl-0 gap-2 text-muted-foreground hover:text-foreground font-bold mb-4 group h-auto hover:bg-transparent">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Назад
                        </Button>
                        <h1 className="text-2xl font-bold text-foreground leading-tight">Новый заказ</h1>
                        <p className="text-[11px] text-muted-foreground font-bold opacity-60 mt-1  tracking-wider">Оформление в CRM</p>
                    </div>

                    <div className="flex-1 px-4 space-y-1 overflow-y-auto pb-10">
                        {steps.map((s, idx) => (
                            <Button
                                key={idx}
                                asChild
                                variant="ghost"
                                className="p-0 border-none bg-transparent hover:bg-transparent shadow-none w-full h-auto"
                            >
                                <button
                                    onClick={() => {
                                        if (s.id < step || validateStep(step)) {
                                            setStep(s.id);
                                            setValidationError("");
                                        }
                                    }}
                                    className={cn(
                                        "relative w-full text-left p-4 rounded-[var(--radius)] transition-all duration-300 flex items-center gap-4 group",
                                        step === s.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-muted active:scale-[0.98]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-10 h-10 rounded-[var(--radius)] flex items-center justify-center shrink-0 border-2 transition-all duration-300",
                                        step === s.id ? "bg-white/10 border-white/20" : step > s.id ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-muted border-border"
                                    )}>
                                        {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={cn("text-xs font-bold leading-none mb-1", step === s.id ? "text-primary-foreground" : "text-foreground")}>{s.title}</div>
                                        <div className={cn("text-[10px] font-bold truncate", step === s.id ? "text-primary-foreground/60" : "text-muted-foreground")}>{s.desc}</div>
                                    </div>
                                </button>
                            </Button>
                        ))}
                    </div>

                    <div className="h-[80px] border-t border-border bg-card px-7 flex items-center">
                        <div className="text-[10px] font-bold text-muted-foreground tracking-normal">
                            {selectedClient ? selectedClient.name : "Клиент не выбран"}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-visible lg:overflow-hidden h-full flex flex-col gap-[var(--crm-grid-gap)]">
                    <div className="crm-card flex-1 min-w-0 flex flex-col h-full min-h-[400px]">
                        <div className="flex-1 overflow-y-auto p-6 md:p-10">
                            {step === 0 && (
                                <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h4 className="text-lg font-bold text-foreground">Выберите клиента</h4>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Search className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <Input
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
                                            className="pl-12"
                                        />
                                        {showHistory && searchHistory.length > 0 && !selectedClient && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                <div className="px-6 py-3 bg-muted border-b border-border flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-muted-foreground tracking-normal">Недавние поиски</span>
                                                </div>
                                                <div className="p-2">
                                                    {searchHistory.map((h, i) => (
                                                        <Button
                                                            key={i}
                                                            variant="ghost"
                                                            asChild
                                                            className="w-full h-auto p-0 hover:bg-transparent"
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setSearchQuery(h);
                                                                    setShowHistory(false);
                                                                }}
                                                                className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-2xl text-sm font-bold text-slate-600 transition-colors flex items-center gap-3"
                                                            >
                                                                <RotateCcw className="w-4 h-4 text-slate-300" />
                                                                {h}
                                                            </button>
                                                        </Button>
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
                                        <div className="border border-border rounded-2xl shadow-xl bg-card overflow-hidden">
                                            {searchResults.map((client) => (
                                                <Button
                                                    key={client.id}
                                                    asChild
                                                    variant="ghost"
                                                    className="w-full h-auto p-0 hover:bg-transparent rounded-none border-b border-border last:border-0"
                                                >
                                                    <button
                                                        onClick={() => {
                                                            setSelectedClient(client);
                                                            setSearchQuery("");
                                                            setSearchResults([]);
                                                        }}
                                                        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-muted transition-colors"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-bold ">{client.name?.charAt(0)}</div>
                                                        <div className="text-left">
                                                            <p className="font-bold text-foreground">{client.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {client.company} • {["Печатник", "Дизайнер"].includes(userRoleName || "") ? "HIDDEN" : client.phone}
                                                            </p>
                                                        </div>
                                                    </button>
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    {selectedClient && (
                                        <div className="p-6 rounded-2xl bg-primary text-primary-foreground flex items-center justify-between shadow-lg shadow-primary/20">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-xl ">{selectedClient.name?.[0] || "?"}</div>
                                                <div>
                                                    <p className="font-bold">{selectedClient.name || "Unnamed Client"}</p>
                                                    <p className="text-xs text-primary-foreground/60 tracking-normal">{selectedClient.company || "Личный заказ"}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" onClick={() => setSelectedClient(null)} className="text-xs font-bold bg-white/10 hover:bg-white/20 hover:text-white px-4 py-2 rounded-2xl h-auto">Изменить</Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-bold text-foreground">Выберите товары из каталога</h4>
                                        <div className="text-xs font-bold text-muted-foreground">ВЫБРАНО: {selectedItems.length}</div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                        {/* Catalog */}
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input placeholder="Поиск товара..." className="pl-9" />
                                            </div>
                                            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                                                {inventory.map(item => (
                                                    <Button
                                                        key={item.id}
                                                        asChild
                                                        variant="ghost"
                                                        disabled={selectedItems.some(i => i.id === item.id)}
                                                        className="w-full h-auto p-0 hover:bg-transparent"
                                                    >
                                                        <button
                                                            onClick={() => addItem(item)}
                                                            className="flex items-center justify-between p-3 rounded-2xl border border-border hover:bg-muted transition-all text-left disabled:opacity-50"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground font-bold"><Package className="w-5 h-5" /></div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                                                                    <p className="text-[10px] text-muted-foreground font-bold tracking-wider">Остаток: {item.quantity} {formatUnit(item.unit)}</p>
                                                                </div>
                                                            </div>
                                                            <Plus className="w-4 h-4 text-muted-foreground" />
                                                        </button>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Selected */}
                                        <div className="bg-muted/50 rounded-2xl p-6 border border-border space-y-4">
                                            <p className="text-xs font-bold text-muted-foreground tracking-normal">Выбранные позиции</p>
                                            {selectedItems.length === 0 ? (
                                                <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
                                                    <ShoppingCart className="w-8 h-8 opacity-50" />
                                                    <p className="text-xs font-bold">Список пуст</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {selectedItems.map(item => (
                                                        <div key={item.id} className="bg-card p-4 rounded-2xl shadow-sm border border-border space-y-4">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-sm font-bold">{item.name}</p>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeItem(item.id)}
                                                                    className="text-muted-foreground hover:text-destructive font-bold text-xs h-auto p-0 hover:bg-transparent"
                                                                >
                                                                    Удалить
                                                                </Button>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-sm font-bold text-muted-foreground ml-1">Кол-во</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={item.orderQuantity || 0}
                                                                        onChange={(e) => updateItem(item.id, { orderQuantity: Number(e.target.value) })}
                                                                        className="h-10"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-sm font-bold text-muted-foreground ml-1">Цена ({currencySymbol})</label>
                                                                    <Input
                                                                        type="number"
                                                                        value={item.price || 0}
                                                                        onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
                                                                        className="h-10"
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
                                    <h4 className="text-lg font-bold text-foreground">Детали заказа</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--crm-grid-gap)]">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Приоритет</label>
                                            <PremiumSelect
                                                value={details.priority}
                                                onChange={(val) => setDetails({ ...details, priority: val })}
                                                options={[
                                                    { id: "low", title: "Низкий" },
                                                    { id: "medium", title: "Средний" },
                                                    { id: "high", title: "Высокий" }
                                                ]}
                                                placeholder="Выберите приоритет"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Дедлайн</label>
                                            <Input
                                                type="date"
                                                value={details.deadline}
                                                onChange={(e) => setDetails({ ...details, deadline: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--crm-grid-gap)]">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Срочный заказ</label>
                                            <div
                                                className={cn(
                                                    "w-full h-12 px-4 rounded-[var(--radius)] border flex items-center justify-between transition-all",
                                                    details.isUrgent ? "bg-rose-50 border-rose-200 text-rose-700 font-bold" : "bg-muted/50 border-border text-muted-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className={cn("w-4 h-4", details.isUrgent ? "text-rose-500" : "text-muted-foreground/40")} />
                                                    <span className="text-sm">{details.isUrgent ? "ДА, СРОЧНО" : "Обычный заказ"}</span>
                                                </div>
                                                <Switch
                                                    checked={details.isUrgent}
                                                    onCheckedChange={(val) => setDetails({ ...details, isUrgent: val })}
                                                    variant="success"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-muted-foreground ml-1">Способ оплаты</label>
                                            <PremiumSelect
                                                value={details.paymentMethod}
                                                onChange={(val) => setDetails({ ...details, paymentMethod: val })}
                                                options={[
                                                    { id: "cash", title: "Наличные" },
                                                    { id: "bank", title: "Безнал (Карта)" },
                                                    { id: "online", title: "Онлайн-касса" },
                                                    { id: "account", title: "Расчетный счет" }
                                                ]}
                                                placeholder="Выберите способ оплаты"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-muted-foreground ml-1">Предоплата ({currencySymbol})</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                value={details.advanceAmount}
                                                onChange={(e) => setDetails({ ...details, advanceAmount: e.target.value })}
                                                className="pl-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-bold text-muted-foreground tracking-normal ml-1">Промокод</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="text"
                                                    placeholder="Введите промокод..."
                                                    value={promoInput}
                                                    onChange={(e) => setPromoInput(e.target.value)}
                                                    className="pl-12"
                                                />
                                            </div>
                                            <Button
                                                onClick={handleApplyPromo}
                                                disabled={isApplyingPromo || !promoInput}
                                                variant="secondary"
                                                className="h-12 px-6"
                                            >
                                                {isApplyingPromo ? "..." : "Применить"}
                                            </Button>
                                        </div>
                                        {details.appliedPromo && (
                                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-2">
                                                <p className="text-xs font-bold text-emerald-700 flex items-center justify-between">
                                                    <span>Промокод: {details.appliedPromo.code}</span>
                                                    <span className="uppercase">
                                                        {details.appliedPromo.discountType === 'percentage' ? `-${details.appliedPromo.value}%` :
                                                            details.appliedPromo.discountType === 'fixed' ? `-${details.appliedPromo.value} ${currencySymbol}` :
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
                                    <h4 className="text-xl font-bold text-foreground">Подтверждение заказа</h4>

                                    <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
                                        <div className="flex justify-between border-b border-border pb-4">
                                            <span className="text-muted-foreground font-bold text-xs tracking-wider">Клиент</span>
                                            <span className="font-bold">{selectedClient?.name}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-muted-foreground font-bold text-xs tracking-wider">Товары</span>
                                            {selectedItems.map(item => (
                                                <div key={item.id} className="flex justify-between text-sm py-1">
                                                    <span>{item.name} x {item.orderQuantity || 0}</span>
                                                    <span className="font-bold">{(item.price || 0) * (item.orderQuantity || 0)} {currencySymbol}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between pt-4 border-t border-border text-xl font-bold">
                                            <span>ИТОГО</span>
                                            <div className="text-right">
                                                {details.appliedPromo ? (
                                                    <>
                                                        <span className="text-sm text-muted-foreground line-through mr-2 font-bold">
                                                            {selectedItems.reduce((acc, i) => acc + ((i.price || 0) * (i.orderQuantity || 0)), 0)} {currencySymbol}
                                                        </span>
                                                        <span>
                                                            {(() => {
                                                                const total = selectedItems.reduce((acc, i) => acc + ((i.price || 0) * (i.orderQuantity || 0)), 0);
                                                                const discount = details.appliedPromo?.calculatedDiscount ?? 0;
                                                                return Math.max(0, Math.round(total - discount));
                                                            })()} {currencySymbol}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span>{selectedItems.reduce((acc, i) => acc + ((i.price || 0) * (i.orderQuantity || 0)), 0)} {currencySymbol}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--crm-grid-gap)]">
                                        <div className="p-4 bg-card border border-border rounded-2xl">
                                            <p className="text-[10px] font-bold text-muted-foreground tracking-normal mb-1">Приоритет</p>
                                            <p className="font-bold text-xs">{details.priority === 'low' ? 'Низкий' : details.priority === 'medium' ? 'Средний' : 'Высокий'}</p>
                                        </div>
                                        <div className="p-4 bg-card border border-border rounded-2xl">
                                            <p className="text-[10px] font-bold text-muted-foreground tracking-normal mb-1">Оплата</p>
                                            <p className="font-bold text-xs">
                                                {details.paymentMethod === 'cash' ? 'Наличные' :
                                                    details.paymentMethod === 'bank' ? 'Безнал (Карта)' :
                                                        details.paymentMethod === 'online' ? 'Онлайн-касса' : 'Расчетный счет'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 md:px-10 py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center bg-muted/30 gap-4">
                            <div className="flex flex-col">
                                {validationError && (
                                    <span className="text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-left-2">{validationError}</span>
                                )}
                            </div>
                            <div className="flex gap-4">
                                <Button variant="outline" onClick={handleBack} className="bg-background">Назад</Button>
                                {step < 3 ? (
                                    <Button onClick={handleNext} variant="btn-dark" className="px-8 shadow-lg gap-2">
                                        Далее <ChevronRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={loading} variant="btn-dark" className="px-12 shadow-lg">
                                        {loading ? "Создание..." : "Подтвердить и создать"}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
}
