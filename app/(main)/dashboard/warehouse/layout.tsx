"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, MapPin, Book, History, Clock, Plus, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, useState, useEffect } from "react";
import { AddCategoryDialog } from "./add-category-dialog";
import { AddStorageLocationDialog } from "./add-storage-location-dialog";
import { MoveInventoryDialog } from "./move-inventory-dialog";
import { AddAttributeTypeDialog } from "./add-attribute-type-dialog";
import { QRScanner } from "@/components/ui/qr-scanner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { findItemBySKU, clearInventoryHistory, getInventoryItems, getStorageLocations, getInventoryCategories, getAllUsers, getInventoryHistory, getSession } from "./actions";
import { playSound } from "@/lib/sounds";

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

export default function WarehouseLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();

    const [items, setItems] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [session, setSession] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

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

    useEffect(() => {
        // Only fetch session for UI permission checks
        const fetchSession = async () => {
            if (!session) {
                const s = await getSession();
                setSession(s);
            }
        };
        fetchSession();
    }, [pathname]);

    // Simple helper to load data for dialogs only when needed
    const loadDialogData = async (type: string) => {
        if (type === 'storage' && !locations.length) {
            const [i, l, u] = await Promise.all([getInventoryItems(), getStorageLocations(), getAllUsers()]);
            setItems(i.data || []); setLocations(l.data || []); setUsers(u.data || []);
        }
        if (type === 'history' && !history.length) {
            const h = await getInventoryHistory();
            setHistory(h.data || []);
        }
    };

    const renderActions = () => {
        switch (activeTab) {
            case "categories":
                return (
                    <div className="flex items-center gap-3">
                        <AddCategoryDialog />
                        <Link
                            href="/dashboard/warehouse/items/new"
                            className="h-11 btn-primary rounded-[var(--radius-inner)] px-6 gap-2 font-bold inline-flex items-center justify-center text-sm whitespace-nowrap border-none shadow-lg shadow-primary/20 hover:shadow-primary/30"
                        >
                            <Plus className="w-5 h-5" />
                            Добавить позицию
                        </Link>
                    </div>
                );
            case "storage":
                return (
                    <div className="flex items-center gap-3" onMouseEnter={() => loadDialogData('storage')}>
                        <MoveInventoryDialog items={items} locations={locations} />
                        <AddStorageLocationDialog users={users} />
                    </div>
                );
            case "characteristics":
                return (
                    <div className="flex items-center gap-3">
                        <AddAttributeTypeDialog categories={categories} />
                    </div>
                );
            case "history":
                return (
                    <div className="flex items-center gap-3" onMouseEnter={() => loadDialogData('history')}>
                        {session?.roleName === "Администратор" && (
                            <button
                                onClick={() => setIsClearHistoryOpen(true)}
                                disabled={history.length === 0}
                                className="h-11 btn-destructive rounded-[var(--radius-inner)] px-6 gap-2 font-bold text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            {isRootPage && (
                <>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                {currentInfo.title}
                            </h1>
                            <p className="text-slate-500 text-[13px] font-medium mt-1.5">
                                {currentInfo.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {renderActions()}
                        </div>
                    </div>

                    <div className="flex w-full h-[58px] items-center gap-2 p-[6px] !rounded-[22px] glass-panel transition-all">
                        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar xl:no-scrollbar flex-1 h-full relative z-0">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href}
                                        className={cn(
                                            "flex-1 h-full relative flex items-center justify-center gap-2.5 px-6 !rounded-[16px] text-[13px] font-bold group min-w-[140px] whitespace-nowrap transition-all duration-300",
                                            isActive ? "text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeWarehouseTab"
                                                className={cn(
                                                    "absolute inset-0 !rounded-[16px] z-0 shadow-lg",
                                                    tab.activeColor || "bg-primary shadow-primary/20",
                                                    tab.shadowColor
                                                )}
                                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                            />
                                        )}
                                        <tab.icon className={cn("w-4 h-4 relative z-10 transition-transform duration-300", isActive && "scale-110")} />
                                        <span className="relative z-10">{tab.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            <div className="relative min-h-[400px]">
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
