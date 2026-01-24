"use client";

import { LayoutGrid, History, MapPin, Plus, Book, Clock, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { InventoryItem, Category } from "./inventory-client";

import { StorageLocation } from "./storage-locations-tab";
import { Transaction } from "./history-table";
import { WarehouseWidgets } from "./warehouse-widgets";
import { Session } from "@/lib/auth";
import { WarehouseDictionary } from "./warehouse-dictionary";
import { InventoryAttribute, AttributeType } from "./types";
import { QRScanner } from "@/components/ui/qr-scanner";
import { findItemBySKU } from "./actions";
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
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-8">
            {/* Sub Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/50 backdrop-blur-xl rounded-[var(--radius-inner)] w-fit border border-slate-200/60 shadow-sm">
                    <button
                        onClick={() => handleTabChange("inventory")}
                        className={cn(
                            "flex items-center gap-2.5 px-6 py-2.5 rounded-[var(--radius)] text-[11px] font-bold transition-all duration-300",
                            activeTab === "inventory"
                                ? "bg-white text-primary shadow-md shadow-primary/10"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        Категории
                    </button>
                    <button
                        onClick={() => handleTabChange("storage")}
                        className={cn(
                            "flex items-center gap-2.5 px-6 py-2.5 rounded-[var(--radius)] text-[11px] font-bold transition-all duration-300",
                            activeTab === "storage"
                                ? "bg-white text-primary shadow-md shadow-primary/10"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        Хранение
                    </button>
                    <button
                        onClick={() => handleTabChange("dictionary")}
                        className={cn(
                            "flex items-center gap-2.5 px-6 py-2.5 rounded-[var(--radius)] text-[11px] font-bold transition-all duration-300",
                            activeTab === "dictionary"
                                ? "bg-white text-primary shadow-md shadow-primary/10"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        <Book className="w-3.5 h-3.5" />
                        Справочник
                    </button>
                    <button
                        onClick={() => handleTabChange("history")}
                        className={cn(
                            "flex items-center gap-2.5 px-6 py-2.5 rounded-[var(--radius)] text-[11px] font-bold transition-all duration-300",
                            activeTab === "history"
                                ? "bg-white text-primary shadow-md shadow-primary/10"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        <History className="w-3.5 h-3.5" />
                        История
                    </button>
                    <button
                        onClick={() => handleTabChange("archive")}
                        className={cn(
                            "flex items-center gap-2.5 px-6 py-2.5 rounded-[var(--radius)] text-[11px] font-bold transition-all duration-300",
                            activeTab === "archive"
                                ? "bg-white text-rose-600 shadow-md shadow-rose-100"
                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                        )}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Архив
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {activeTab === "storage" ? (
                        <>
                            <MoveInventoryDialog items={items} locations={storageLocations} />
                            <AddStorageLocationDialog users={users} />
                        </>
                    ) : activeTab === "inventory" ? (
                        <>
                            <AddCategoryDialog categories={categories} />
                            <Link
                                href="/dashboard/warehouse/items/new"
                                className="h-12 btn-primary rounded-[var(--radius)] px-6 gap-2 font-bold inline-flex items-center justify-center text-sm whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" />
                                Добавить позицию
                            </Link>

                            <button
                                onClick={() => setIsScannerOpen(true)}
                                className="h-12 w-12 bg-white border border-slate-200 text-slate-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 rounded-[var(--radius)] flex items-center justify-center transition-all shadow-sm"
                                title="Сканировать SKU"
                            >
                                <QrCode className="w-5 h-5" />
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative">
                {activeTab === "inventory" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-5">
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
                            user={user}
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
                        toast(`Товар с SKU "${sku}" не найден`, "error");
                    }
                }}
            />
        </div >
    );
}
