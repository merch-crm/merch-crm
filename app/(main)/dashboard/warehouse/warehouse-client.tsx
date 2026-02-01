"use client";

import { LayoutGrid, History, MapPin, Plus, Book, Clock, QrCode, RefreshCw, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { InventoryClient } from "./inventory-client";
import { HistoryTable } from "./history-table";
import { AddCategoryDialog } from "./add-category-dialog";
import { StorageLocationsTab } from "./storage-locations-tab";
import { AddStorageLocationDialog } from "./add-storage-location-dialog";
import { MoveInventoryDialog } from "./move-inventory-dialog";
import { ArchiveTable } from "./archive-table";
import { InventoryItem, Category } from "./types";

import { StorageLocation } from "./storage-locations-tab";
import { Transaction } from "./history-table";
import { WarehouseWidgets } from "./warehouse-widgets";
import { Session } from "@/lib/auth";
import { WarehouseDictionary } from "./warehouse-dictionary";
import { InventoryAttribute, AttributeType } from "./types";
import { QRScanner } from "@/components/ui/qr-scanner";
import { AddAttributeTypeDialog } from "./add-attribute-type-dialog";
import { findItemBySKU, seedSystemCategories, regenerateAllItemSKUs, clearInventoryHistory, syncAllInventoryQuantities } from "./actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

interface WarehouseClientProps {
    items: InventoryItem[];
    archivedItems: InventoryItem[];
    categories: Category[];
    history: Transaction[];
    storageLocations: StorageLocation[];
    users: { id: string; name: string }[];
    user: Session | null;
    attributes: InventoryAttribute[];
    attributeTypes: AttributeType[];
}

export function WarehouseClient({ items, archivedItems, categories, history, storageLocations, users, user, attributes, attributeTypes }: WarehouseClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isSyncingCategories, setIsSyncingCategories] = useState(false);
    const [isClearHistoryOpen, setIsClearHistoryOpen] = useState(false);
    const [isClearingHistory, setIsClearingHistory] = useState(false);

    // Initialize tab from URL
    const tabParam = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState<"inventory" | "storage" | "history" | "dictionary" | "archive">(
        (tabParam && ["inventory", "storage", "history", "dictionary", "archive"].includes(tabParam))
            ? tabParam as "inventory" | "storage" | "history" | "dictionary" | "archive"
            : "inventory"
    );

    const handleTabChange = (tab: "inventory" | "storage" | "history" | "dictionary" | "archive") => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        window.history.replaceState(null, '', `?${params.toString()}`);
    };

    const TAB_INFO = {
        inventory: { title: "Складской учет", description: "Управление категориями товаров и актуальными остатками" },
        storage: { title: "Места хранения", description: "Мониторинг складов, ячеек и перемещений продукции" },
        dictionary: { title: "Характеристики", description: "Настройка характеристик, типов атрибутов и параметров SKU" },
        history: { title: "Журнал операций", description: "Детальная история всех складских транзакций и изменений" },
        archive: { title: "Архив продукции", description: "Список позиций, выведенных из эксплуатации или удаленных" }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* 1. Page Header & Dynamic Actions */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        {TAB_INFO[activeTab].title}
                    </h1>
                    <p className="text-slate-500 text-[13px] font-medium mt-1">
                        {TAB_INFO[activeTab].description}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === "storage" ? (
                        <div key="storage-actions" className="flex items-center gap-3">
                            <MoveInventoryDialog items={items} locations={storageLocations} />
                            <AddStorageLocationDialog users={users} />
                        </div>
                    ) : activeTab === "dictionary" ? (
                        <div key="dictionary-actions" className="flex items-center gap-3">
                            {/* Dev tools hidden
                            <button
                                onClick={async () => {
                                    setIsSyncingCategories(true);
                                    toast("Синхронизация категорий...", "info");
                                    try {
                                        const res = await seedSystemCategories();
                                        if (res.success) {
                                            toast("Категории обновлены", "success");
                                            router.refresh();
                                        } else {
                                            toast(res.error || "Ошибка синхронизации", "error");
                                        }
                                    } catch {
                                        toast("Ошибка синхронизации", "error");
                                    } finally {
                                        setIsSyncingCategories(false);
                                    }
                                }}
                                disabled={isSyncingCategories}
                                className="h-11 btn-dark rounded-[var(--radius-inner)] px-6 gap-2 font-bold inline-flex items-center justify-center text-sm whitespace-nowrap disabled:opacity-50 border-none shadow-none"
                            >
                                <RefreshCw className={cn("w-5 h-5", isSyncingCategories && "animate-spin")} />
                                <span className="hidden sm:inline">Синхронизировать категории</span>
                            </button>

                            <button
                                onClick={async () => {
                                    toast("Обновление артикулов...", "info");
                                    try {
                                        const res = await regenerateAllItemSKUs();
                                        if (res.success) {
                                            toast(`Обновлено ${res.updatedCount} артикулов`, "success");
                                            router.refresh();
                                        } else {
                                            toast("Ошибка при обновлении", "error");
                                        }
                                    } catch {
                                        toast("Ошибка при обновлении", "error");
                                    }
                                }}
                                className="h-11 btn-dark rounded-[var(--radius-inner)] px-6 gap-2 font-bold inline-flex items-center justify-center text-sm whitespace-nowrap border-none shadow-none"
                            >
                                <RefreshCw className="w-5 h-5" />
                                <span className="hidden sm:inline">Обновить SKU</span>
                            </button>

                            <button
                                onClick={async () => {
                                    toast("Синхронизация остатков...", "info");
                                    try {
                                        const res = await syncAllInventoryQuantities();
                                        if (res.success) {
                                            toast("Остатки синхронизированы", "success");
                                            router.refresh();
                                        } else {
                                            toast(res.error || "Ошибка синхронизации", "error");
                                        }
                                    } catch {
                                        toast("Ошибка синхронизации", "error");
                                    }
                                }}
                                className="h-11 btn-dark rounded-[var(--radius-inner)] px-6 gap-2 font-bold inline-flex items-center justify-center text-sm whitespace-nowrap border-none shadow-none"
                            >
                                <RefreshCw className="w-5 h-5" />
                                <span className="hidden sm:inline">Синхронизировать остатки</span>
                            </button>
                            */}

                            <AddAttributeTypeDialog categories={categories} />
                        </div>
                    ) : activeTab === "inventory" ? (
                        <div key="inventory-actions" className="flex items-center gap-3">
                            <AddCategoryDialog categories={categories} />
                            <Link
                                href="/dashboard/warehouse/items/new"
                                className="h-11 btn-primary rounded-[var(--radius-inner)] px-6 gap-2 font-bold inline-flex items-center justify-center text-sm whitespace-nowrap border-none shadow-lg shadow-primary/20 hover:shadow-primary/30"
                            >
                                <Plus className="w-5 h-5" />
                                Добавить позицию
                            </Link>
                        </div>
                    ) : activeTab === "history" ? (
                        <div key="history-actions" className="flex items-center gap-3">
                            {user?.roleName === "Администратор" && (
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
                    ) : null}
                </div>
            </div>

            {/* 2. Control Header: Navigation Tabs */}
            <div className="glass-panel !rounded-[22px] p-[6px] h-[58px] flex items-center relative">
                {/* Main Navigation Track */}
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar xl:no-scrollbar flex-1 h-full relative z-0">
                    {[
                        { id: "inventory", label: "Категории", icon: LayoutGrid },
                        { id: "storage", label: "Хранение", icon: MapPin },
                        { id: "dictionary", label: "Характеристики", icon: Book },
                        { id: "history", label: "История", icon: History },
                        { id: "archive", label: "Архив", icon: Clock, activeColor: "bg-amber-500", shadowColor: "shadow-amber-500/25" }
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as "inventory" | "storage" | "history" | "dictionary" | "archive")}
                                className={cn(
                                    "flex-1 h-full relative flex items-center justify-center gap-2.5 px-6 !rounded-[16px] text-[13px] font-bold group min-w-[140px] whitespace-nowrap",
                                    isActive ? "text-white" : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabWarehouseNav"
                                        className={cn(
                                            "absolute inset-0 !rounded-[16px] shadow-lg shadow-primary/20 z-0",
                                            tab.activeColor || "bg-primary",
                                            tab.shadowColor
                                        )}
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <tab.icon className="w-4 h-4 relative z-10" />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

            </div>

            {/* Content Area */}
            <div className="relative">
                {activeTab === "inventory" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                        <WarehouseWidgets items={items} archivedItems={archivedItems} categories={categories} history={history} />
                        <InventoryClient items={items} categories={categories} user={user} />
                    </div>
                ) : activeTab === "storage" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <StorageLocationsTab locations={storageLocations} users={users} />
                    </div>
                ) : activeTab === "dictionary" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <WarehouseDictionary attributes={attributes} attributeTypes={attributeTypes} categories={categories} user={user} />
                    </div>
                ) : activeTab === "archive" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ArchiveTable
                            items={archivedItems}
                        />
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <HistoryTable
                            transactions={history}
                            isAdmin={user?.roleName === "Администратор"}
                        />
                    </div>
                )}
            </div>

            <QRScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onResult={async (sku) => {
                    toast(`Поиск SKU: ${sku}...`, "info");
                    const foundId = await findItemBySKU(sku);
                    if (foundId) {
                        toast("Товар найден, переходим...", "success");
                        router.push(`/dashboard/warehouse/items/${foundId}`);
                    } else {
                        toast(`Товар с SKU «${sku}» не найден`, "error");
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
                            setIsClearHistoryOpen(false);
                            router.refresh();
                        } else {
                            toast(res.error || "Ошибка при очистке", "error");
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
        </div >
    );
}
