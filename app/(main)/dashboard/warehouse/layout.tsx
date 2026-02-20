"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, MapPin, Book, History, Clock, Plus, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ReactNode, useEffect } from "react";
import { AddCategoryDialog } from "./add-category-dialog";
import { AddStorageLocationDialog } from "./add-storage-location-dialog";
import { MoveInventoryDialog } from "./move-inventory-dialog";
import { AddAttributeTypeDialog } from "./add-attribute-type-dialog";
import { QRScanner } from "@/components/ui/qr-scanner";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { findItemBySKU } from "./warehouse-stats-actions";
import { clearInventoryHistory } from "./history-actions";;

import { playSound } from "@/lib/sounds";
import { useWarehouseLayout } from "./hooks/useWarehouseLayout";

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

    let activeTab = "categories";
    if (pathname.includes("/categories")) activeTab = "categories";
    else if (pathname.includes("/storage")) activeTab = "storage";
    else if (pathname.includes("/characteristics")) activeTab = "characteristics";
    else if (pathname.includes("/history")) activeTab = "history";
    else if (pathname.includes("/archive")) activeTab = "archive";

    const { state, actions } = useWarehouseLayout(activeTab);
    const { items, locations, categories, users, session, history, isScannerOpen, isClearHistoryOpen, isClearingHistory } = state;
    const { setIsScannerOpen, setIsClearHistoryOpen, setIsClearingHistory, loadDialogData } = actions;

    const isRootPage = TABS.some(tab => pathname === tab.href);
    const currentInfo = TAB_INFO[pathname] || TAB_INFO["/dashboard/warehouse/categories"];

    // Update document title immediately on client-side navigation
    useEffect(() => {
        if (currentInfo?.title) {
            document.title = `${currentInfo.title} | Склад`;
        }
    }, [pathname, currentInfo]);

    const renderActions = () => {
        switch (activeTab) {
            case "categories":
                return (
                    <>
                        <AddCategoryDialog className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 rounded-full sm:rounded-2xl shadow-lg shadow-primary/20" buttonText="Категория" />
                        <Link
                            href="/dashboard/warehouse/items/new"
                            className={cn(
                                buttonVariants({ variant: "default" }),
                                "h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 rounded-full sm:rounded-2xl border-none shadow-lg shadow-primary/20 transition-all active:scale-95"
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
                        <MoveInventoryDialog
                            items={items}
                            locations={locations}
                            className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 border-none"
                        />
                        <AddStorageLocationDialog
                            users={users}
                            className="h-10 w-10 sm:h-11 sm:w-auto p-0 sm:px-6 bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 border-none"
                        />
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
                            <Button
                                variant="destructive"
                                onClick={() => setIsClearHistoryOpen(true)}
                                disabled={history.length === 0}
                                className="h-10 w-10 sm:h-11 sm:w-auto rounded-full sm:rounded-2xl sm:px-6 gap-2 font-bold flex items-center justify-center shadow-lg shadow-rose-500/20"
                            >
                                <Eraser className="w-5 h-5 text-white" />
                                <span className="hidden sm:inline">Очистить историю</span>
                            </Button>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-700">
            {isRootPage && (
                <>
                    {/* Header */}
                    <div className="flex flex-row items-center justify-between gap-3">
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
                    <div className="crm-card w-full !p-1.5 !rounded-[var(--radius-inner)]">
                        {/* Mobile Navigation (Icons Only) */}
                        <nav
                            role="tablist"
                            aria-label="Навигация по разделам склада (мобильная)"
                            className="flex sm:hidden items-center justify-between gap-1 w-full bg-slate-50/50 p-1 rounded-2xl"
                        >
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href}
                                        role="tab"
                                        aria-selected={isActive}
                                        aria-label={tab.label}
                                        className={cn(
                                            "flex-1 h-11 relative flex items-center justify-center rounded-[10px] transition-all duration-300",
                                            isActive ? "text-white" : "text-slate-400 hover:text-slate-600 active:scale-90"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="mobileActiveTab"
                                                className={cn(
                                                    "absolute inset-0 rounded-[10px] z-0 shadow-md",
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
                        </nav>

                        {/* Desktop / Tablet Navigation (Full Labels) */}
                        <nav
                            role="tablist"
                            aria-label="Навигация по разделам склада"
                            className="hidden sm:flex sm:items-center gap-1.5 sm:gap-2 w-full overflow-x-auto no-scrollbar"
                        >
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <Link
                                        key={tab.id}
                                        href={tab.href}
                                        role="tab"
                                        aria-selected={isActive}
                                        className={cn(
                                            "crm-filter-tab flex-1 h-10 sm:h-11 px-3 sm:px-5 shrink-0 text-[12px] sm:text-[13px] gap-2 group",
                                            isActive ? "active text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeWarehouseTab"
                                                className={cn(
                                                    "absolute inset-0 rounded-[10px] z-0 shadow-sm",
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
                        </nav>
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
