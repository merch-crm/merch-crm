"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, MapPin, Book, History, Clock, Plus, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, useState, useEffect, useCallback } from "react";
import { AddCategoryDialog } from "./add-category-dialog";
import { AddStorageLocationDialog } from "./add-storage-location-dialog";
import { MoveInventoryDialog } from "./move-inventory-dialog";
import { AddAttributeTypeDialog } from "./add-attribute-type-dialog";
import { QRScanner } from "@/components/ui/qr-scanner";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { findItemBySKU, clearInventoryHistory, getInventoryItems, getStorageLocations, getAllUsers, getInventoryHistory, getSession } from "./actions";
import { playSound } from "@/lib/sounds";
import { InventoryItem, StorageLocation, Category } from "./types";
import { Session } from "@/lib/auth";

const TABS = [
    { id: "categories", label: "Категории", icon: LayoutGrid, href: "/dashboard/warehouse/categories" },
    { id: "storage", label: "Хранение", icon: MapPin, href: "/dashboard/warehouse/storage" },
    { id: "characteristics", label: "Характеристики", icon: Book, href: "/dashboard/warehouse/characteristics" },
    { id: "history", label: "История", icon: History, href: "/dashboard/warehouse/history" },
    { id: "archive", label: "Архив", icon: Clock, href: "/dashboard/warehouse/archive", activeColor: "bg-amber-500", shadowColor: "shadow-amber-500/25" }
];

const TAB_INFO: Record<string, { title: string; description: string }> = {
    "/dashboard/warehouse/categories": { title: "Складской учет", description: "Управление категориями товаров и актуальными остатками" },
    "/dashboard/warehouse/storage": { title: "Места хранения", description: "Мониторинг складов, ячеек и перемещений продукции" },
    "/dashboard/warehouse/characteristics": { title: "Характеристики", description: "Настройка характеристик, типов атрибутов и параметров SKU" },
    "/dashboard/warehouse/history": { title: "Журнал операций", description: "Детальная история всех складских транзакций и изменений" },
    "/dashboard/warehouse/archive": { title: "Архив продукции", description: "Список позиций, выведенных из эксплуатации или удаленных" }
};

interface HistoryEntry {
    id: string;
    type: string;
    changeAmount: number;
    createdAt: Date;
}

export default function WarehouseLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [locations, setLocations] = useState<StorageLocation[]>([]);
    const [categories] = useState<Category[]>([]);
    const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
    const [session, setSession] = useState<Session | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isClearHistoryOpen, setIsClearHistoryOpen] = useState(false);
    const [isClearingHistory, setIsClearingHistory] = useState(false);

    let activeTab = "categories";
    if (pathname.includes("/categories")) activeTab = "categories";
    else if (pathname.includes("/storage")) activeTab = "storage";
    else if (pathname.includes("/characteristics")) activeTab = "characteristics";
    else if (pathname.includes("/history")) activeTab = "history";
    else if (pathname.includes("/archive")) activeTab = "archive";

    const isRootPage = TABS.some(tab => pathname === tab.href);
    const currentInfo = TAB_INFO[pathname] || TAB_INFO["/dashboard/warehouse/categories"];

    const fetchSession = useCallback(async () => {
        if (!session) {
            const s = await getSession();
            setSession(s);
        }
    }, [session]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    // Simple helper to load data for dialogs only when needed
    const loadDialogData = useCallback(async (type: string) => {
        if (type === 'storage' && !locations.length) {
            const [i, l, u] = await Promise.all([getInventoryItems(), getStorageLocations(), getAllUsers()]);
            setItems(i.data || []); setLocations(l.data || []); setUsers(u.data || []);
        }
        if (type === 'history' && !history.length) {
            const h = await getInventoryHistory();
            setHistory(h.data || []);
        }
    }, [locations.length, history.length]);

    // Pre-load data when tab changes to avoid "disabled" state on buttons
    useEffect(() => {
        if (activeTab === 'storage' || activeTab === 'history') {
            loadDialogData(activeTab);
        }
    }, [activeTab, loadDialogData]);

    const renderActions = () => {
        switch (activeTab) {
            case "categories":
                return (
                    <>
                        <AddCategoryDialog className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 rounded-full sm:rounded-[18px] shadow-lg shadow-primary/20" buttonText="Категория" iconOnly />
                        <Link
                            href="/dashboard/warehouse/items/new"
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 rounded-full sm:rounded-[18px] border-none shadow-lg shadow-primary/20 transition-all active:scale-95"
                            )}
                        >
                            <Plus className="w-5 h-5 text-white" />
                            <span className="hidden sm:inline">Добавить позицию</span>
                        </Link>
                    </>
                );
            case "storage":
                return (
                    <div
                        className="flex items-center gap-2 w-auto"
                        onMouseEnter={() => loadDialogData('storage')}
                        onTouchStart={() => loadDialogData('storage')}
                        onClick={() => loadDialogData('storage')}
                    >
                        <MoveInventoryDialog items={items} locations={locations} className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6" />
                        <AddStorageLocationDialog users={users} className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6" />
                    </div>
                );
            case "characteristics":
                return (
                    <div className="flex items-center gap-2 w-auto">
                        <AddAttributeTypeDialog categories={categories} className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6" />
                    </div>
                );
            case "history":
                return (
                    <div
                        className="flex items-center gap-2 w-auto"
                        onMouseEnter={() => loadDialogData('history')}
                        onTouchStart={() => loadDialogData('history')}
                        onClick={() => loadDialogData('history')}
                    >
                        {session?.roleName === "Администратор" && (
                            <button
                                onClick={() => setIsClearHistoryOpen(true)}
                                disabled={history.length === 0}
                                className="h-10 w-10 sm:h-11 sm:w-auto btn-destructive rounded-full sm:rounded-[18px] sm:px-6 gap-2 font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20"
                            >
                                <Eraser className="w-5 h-5 text-white" />
                                <span className="hidden sm:inline">Очистить историю</span>
                            </button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            {isRootPage && (
                <>
                    {/* Header */}
                    <div className="flex flex-row items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">
                                {currentInfo.title}
                            </h1>
                            <p className="text-slate-500 text-[13px] font-medium mt-1.5 max-w-sm md:max-w-md hidden sm:block">
                                {currentInfo.description}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            {renderActions()}
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="glass-panel w-full p-1.5 rounded-[22px]">
                        {/* Mobile Navigation (Icons Only) */}
                        <div className="flex sm:hidden items-center justify-between gap-1 w-full bg-slate-50/50 p-1 rounded-[18px]">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href}
                                        className={cn(
                                            "flex-1 h-11 relative flex items-center justify-center rounded-[14px] transition-all duration-300",
                                            isActive ? "text-white" : "text-slate-400 hover:text-slate-600 active:scale-90"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="mobileActiveTab"
                                                className={cn(
                                                    "absolute inset-0 rounded-[14px] z-0 shadow-md",
                                                    tab.activeColor || "bg-primary shadow-primary/20",
                                                    tab.shadowColor
                                                )}
                                                transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                                            />
                                        )}
                                        <Icon className={cn("w-5 h-5 relative z-10", isActive && "scale-110")} />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Desktop / Tablet Navigation (Full Labels) */}
                        <div className="hidden sm:flex sm:items-center gap-1.5 sm:gap-2 w-full overflow-x-auto no-scrollbar">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href}
                                        className={cn(
                                            "flex-1 h-10 sm:h-11 relative flex items-center justify-center gap-2 px-3 sm:px-5 shrink-0 rounded-[16px] text-[12px] sm:text-[13px] font-bold group whitespace-nowrap transition-all duration-300",
                                            isActive ? "text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeWarehouseTab"
                                                className={cn(
                                                    "absolute inset-0 rounded-[16px] z-0 shadow-sm",
                                                    tab.activeColor || "bg-primary shadow-primary/20",
                                                    tab.shadowColor
                                                )}
                                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                            />
                                        )}
                                        <tab.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 transition-transform duration-300", isActive && "scale-110")} />
                                        <span className="relative z-10 hidden md:inline-block">{tab.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            <div className="relative">
                {children}
            </div>

            <QRScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onResult={async (sku) => {
                    toast(`Поиск SKU: ${sku}...`, "info");
                    const foundId = await findItemBySKU(sku);
                    if (foundId) {
                        toast("Товар найден, переходим...", "success");
                        playSound("scan_success");
                        router.push(`/dashboard/warehouse/items/${foundId}`);
                    } else {
                        toast(`Товар с SKU «${sku}» не найден`, "error");
                        playSound("scan_error");
                    }
                }}
            />

            <ConfirmDialog
                isOpen={isClearHistoryOpen}
                onClose={() => setIsClearHistoryOpen(false)}
                onConfirm={async () => {
                    setIsClearingHistory(true);
                    try {
                        const res = await clearInventoryHistory();
                        if (res.success) {
                            toast("История очищена", "success");
                            playSound("notification_success");
                            setIsClearHistoryOpen(false);
                            router.refresh();
                        } else {
                            toast(res.error || "Ошибка при очистке", "error");
                            playSound("notification_error");
                        }
                    } finally {
                        setIsClearingHistory(false);
                    }
                }}
                isLoading={isClearingHistory}
                title="Очистка всей истории"
                description="Вы собираетесь полностью удалить все записи из журнала истории склада. Это действие необратимо и будет зафиксировано в системном логе."
                confirmText="Очистить всё"
                variant="destructive"
            />
        </div>
    );
}
