"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Check,
    ShoppingCart,
    User,
    Package,
    Clock,
    ChevronRight
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { createOrder, searchClients } from "../actions/core.actions";
import { ActionResult, Client, ClientType } from "@/lib/types";
import { validatePromocode } from "../../finance/actions";
import { useToast } from "@/components/ui/toast";
import { playSound } from "@/lib/sounds";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/components/branding-provider";
import { OrderSidebar } from "./components/OrderSidebar";
import { StepClientSelection } from "./components/StepClientSelection";
import { StepItemSelection } from "./components/StepItemSelection";
import { StepOrderDetails } from "./components/StepOrderDetails";
import { StepConfirmation } from "./components/StepConfirmation";

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
    const branding = useBranding();
    const currencySymbol = branding?.currencySymbol || "₽";
    const router = useRouter();
    const { toast } = useToast();
    // Consolidated UI & Process state
    const [uiState, setUiState] = useState({
        step: 0,
        loading: false,
        validationError: "",
        isSearching: false,
        isApplyingPromo: false,
        showHistory: false
    });

    // Consolidated Order Data
    const [orderData, setOrderData] = useState({
        selectedClient: null as Client | null,
        selectedItems: [] as OrderInventoryItem[],
        details: {
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
        },
        promoInput: ""
    });

    // Consolidated Search state
    const [searchState, setSearchState] = useState({
        query: "",
        results: [] as Client[],
        history: [] as string[]
    });

    const handleApplyPromo = async () => {
        if (!orderData.promoInput) return;
        setUiState(prev => ({ ...prev, isApplyingPromo: true }));
        const cartTotal = orderData.selectedItems.reduce((acc, i) => acc + ((i.price || 0) * (i.orderQuantity || 0)), 0);
        const res = await validatePromocode(orderData.promoInput, cartTotal, orderData.selectedItems.map(i => ({
            inventoryId: i.id,
            price: i.price || 0,
            quantity: i.orderQuantity || 0
        })));
        setUiState(prev => ({ ...prev, isApplyingPromo: false }));

        if (!res.success) {
            toast(res.error || "Промокод не найден", "error");
        } else if (res.success && res.data) {
            const data = res.data;
            setOrderData(prev => ({
                ...prev,
                details: {
                    ...prev.details,
                    appliedPromo: {
                        id: String(data.id || ""),
                        code: String(data.code || ""),
                        discountType: String(data.discountType || "percentage"),
                        value: String(data.value || "0"),
                        message: data.message as string | undefined,
                        calculatedDiscount: data.calculatedDiscount as number | undefined
                    },
                    promocodeId: String(data.id || "")
                }
            }));
            const message = data.message || `Промокод ${orderData.promoInput} применен!`;
            toast(message, "success");
        }
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchState.query.length >= 2) {
                setUiState(prev => ({ ...prev, isSearching: true }));
                const res = await searchClients(searchState.query);
                if (res.success && res.data) {
                    const data = res.data;
                    setSearchState(prev => ({
                        ...prev,
                        results: (data || []).map((c) => ({
                            ...c,
                            type: (c.clientType === "b2b" ? "b2b" : "b2c") as ClientType,
                            status: "active",
                            firstName: c.firstName || "",
                            lastName: c.lastName || "",
                            displayName: c.name || [c.lastName, c.firstName].filter(Boolean).join(' ') || "Unnamed",
                            fullName: [c.lastName, c.firstName].filter(Boolean).join(' ') || "Unnamed",
                            company: c.company ? (typeof c.company === 'object' ? c.company : { name: String(c.company) }) : undefined,
                        } as unknown as Client))
                    }));
                } else {
                    setSearchState(prev => ({ ...prev, results: [] }));
                }
                setUiState(prev => ({ ...prev, isSearching: false }));
            } else {
                setSearchState(prev => ({ ...prev, results: [] }));
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchState.query]);

    const handleBack = () => {
        if (uiState.step > 0) setUiState(prev => ({ ...prev, step: prev.step - 1 }));
        else router.back();
    };

    const validateStep = (s: number) => {
        setUiState(prev => ({ ...prev, validationError: "" }));
        if (s === 0 && !orderData.selectedClient) {
            setUiState(prev => ({ ...prev, validationError: "Выберите клиента" }));
            return false;
        }
        if (s === 1 && orderData.selectedItems.length === 0) {
            setUiState(prev => ({ ...prev, validationError: "Добавьте хотя бы один товар" }));
            return false;
        }
        if (s === 2 && orderData.details.deadline) {
            const d = new Date(orderData.details.deadline);
            d.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (d < today) {
                setUiState(prev => ({ ...prev, validationError: "Дедлайн не может быть в прошлом" }));
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(uiState.step)) setUiState(prev => ({ ...prev, step: prev.step + 1 }));
    };

    const handleSubmit = async () => {
        if (!validateStep(uiState.step)) return;
        setUiState(prev => ({ ...prev, loading: true }));

        const formData = new FormData();
        if (!orderData.selectedClient) {
            toast("Выберите клиента", "destructive");
            setUiState(prev => ({ ...prev, loading: false }));
            return;
        }
        formData.append("clientId", orderData.selectedClient.id);
        formData.append("priority", orderData.details.priority);
        formData.append("isUrgent", orderData.details.isUrgent ? "true" : "false");
        formData.append("advanceAmount", orderData.details.advanceAmount);
        formData.append("paymentMethod", orderData.details.paymentMethod);
        formData.append("promocodeId", orderData.details.promocodeId);
        formData.append("deadline", orderData.details.deadline);
        formData.append("items", JSON.stringify(orderData.selectedItems.map((item: OrderInventoryItem) => ({
            inventoryId: item.id,
            quantity: item.orderQuantity || 0,
            price: item.price || 0,
            description: item.name || ""
        }))));

        const res: ActionResult = await createOrder(formData);
        setUiState(prev => ({ ...prev, loading: false }));

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

    const [inventory] = useState<OrderInventoryItem[]>(initialInventory);

    useEffect(() => {
        const h = localStorage.getItem("order_client_search_history");
        if (h) {
            try {
                const history = JSON.parse(h);
                // Use setTimeout to avoid synchronous setState inside effect which triggers audit error
                const t = setTimeout(() => {
                    setSearchState(prev => ({ ...prev, history }));
                }, 0);
                return () => clearTimeout(t);
            } catch (e) {
                console.error("Failed to parse search history", e);
            }
        }
    }, []);

    /* addToHistory removed */

    const addItem = (item: OrderInventoryItem) => {
        if (orderData.selectedItems.find(i => i.id === item.id)) return;
        setOrderData(prev => ({
            ...prev,
            selectedItems: [...prev.selectedItems, {
                ...item,
                orderQuantity: 1,
                price: Number(item.sellingPrice) || 0
            }]
        }));
    };

    const removeItem = (id: string) => {
        setOrderData(prev => ({
            ...prev,
            selectedItems: prev.selectedItems.filter(i => i.id !== id)
        }));
    };

    const updateItem = (id: string, updates: Partial<OrderInventoryItem>) => {
        setOrderData(prev => ({
            ...prev,
            selectedItems: prev.selectedItems.map(i => i.id === id ? { ...i, ...updates } : i)
        }));
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

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 gap-3 px-4 sm:px-8 pb-8 pt-4 overflow-y-auto lg:overflow-hidden">
                {/* Sidebar */}
                <OrderSidebar
                    steps={steps}
                    currentStep={uiState.step}
                    onStepClick={(sid) => {
                        if (sid < uiState.step || validateStep(uiState.step)) {
                            setUiState(prev => ({ ...prev, step: sid, validationError: "" }));
                        }
                    }}
                    onBack={handleBack}
                    selectedClientName={orderData.selectedClient ? (orderData.selectedClient.displayName || orderData.selectedClient.fullName) : ""}
                />

                {/* Main Content */}
                <main className="flex-1 overflow-visible lg:overflow-hidden h-full flex flex-col gap-[var(--crm-grid-gap)]">
                    <div className="crm-card flex-1 min-w-0 flex flex-col h-full min-h-[400px]">
                        <div className="flex-1 overflow-y-auto p-6 md:p-10">
                            {uiState.step === 0 && (
                                <StepClientSelection
                                    searchQuery={searchState.query}
                                    onSearchChange={(q) => setSearchState(prev => ({ ...prev, query: q }))}
                                    searchResults={searchState.results}
                                    selectedClient={orderData.selectedClient}
                                    onSelectClient={(client) => {
                                        setOrderData(prev => ({ ...prev, selectedClient: client }));
                                        setSearchState(prev => ({ ...prev, query: "", results: [] }));
                                    }}
                                    showHistory={uiState.showHistory}
                                    searchHistory={searchState.history}
                                    isSearching={uiState.isSearching}
                                    userRoleName={userRoleName || null}
                                />
                            )}

                            {uiState.step === 1 && (
                                <StepItemSelection
                                    inventory={inventory}
                                    selectedItems={orderData.selectedItems}
                                    onAddItem={addItem}
                                    onRemoveItem={removeItem}
                                    onUpdateItem={updateItem}
                                    currencySymbol={currencySymbol}
                                />
                            )}

                            {uiState.step === 2 && (
                                <StepOrderDetails
                                    details={orderData.details}
                                    onUpdateDetails={(updates) => setOrderData(prev => ({
                                        ...prev,
                                        details: { ...prev.details, ...updates }
                                    }))}
                                    promoInput={orderData.promoInput}
                                    onPromoInputChange={(val) => setOrderData(prev => ({ ...prev, promoInput: val }))}
                                    onApplyPromo={handleApplyPromo}
                                    isApplyingPromo={uiState.isApplyingPromo}
                                    currencySymbol={currencySymbol}
                                />
                            )}

                            {uiState.step === 3 && (
                                <StepConfirmation
                                    selectedClient={orderData.selectedClient}
                                    selectedItems={orderData.selectedItems}
                                    details={orderData.details}
                                    currencySymbol={currencySymbol}
                                />
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 md:px-10 py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center bg-muted/30 gap-3">
                            <div className="flex flex-col">
                                {uiState.validationError && (
                                    <span className="text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-left-2">{uiState.validationError}</span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={handleBack} className="bg-background">Назад</Button>
                                {uiState.step < 3 ? (
                                    <Button type="button" onClick={handleNext} variant="btn-dark" className="px-8 shadow-lg gap-2">
                                        Далее <ChevronRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleSubmit} disabled={uiState.loading} variant="btn-dark" className="px-12 shadow-lg">
                                        {uiState.loading ? "Создание..." : "Подтвердить и создать"}
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
