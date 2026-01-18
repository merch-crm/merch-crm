"use client";

import { LayoutGrid, History, MapPin, Plus, Book } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { InventoryClient } from "./inventory-client";
import { HistoryTable } from "./history-table";
import { AddCategoryDialog } from "./add-category-dialog";
import { StorageLocationsTab } from "./storage-locations-tab";
import { AddStorageLocationDialog } from "./add-storage-location-dialog";
import { MoveInventoryDialog } from "./move-inventory-dialog";
import { InventoryItem, Category } from "./inventory-client";
import { StorageLocation } from "./storage-locations-tab";
import { Transaction } from "./history-table";
import { WarehouseWidgets } from "./warehouse-widgets";
import { Session } from "@/lib/auth";
import { WarehouseDictionary } from "./warehouse-dictionary";

interface WarehouseClientProps {
    items: InventoryItem[];
    categories: Category[];
    history: Transaction[];
    storageLocations: StorageLocation[];
    users: { id: string; name: string }[];
    user: Session | null;
    attributes: any[];
    attributeTypes: any[];
}

export function WarehouseClient({ items, categories, history, storageLocations, users, user, attributes, attributeTypes }: WarehouseClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<"inventory" | "storage" | "history" | "dictionary">("inventory");

    // Persist tab state in URL
    useEffect(() => {
        const tab = searchParams.get("tab") as any;
        if (tab && ["inventory", "storage", "history", "dictionary"].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handleTabChange = (tab: "inventory" | "storage" | "history" | "dictionary") => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="space-y-8">
            {/* Sub Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 backdrop-blur-xl rounded-[14px] w-fit border border-slate-200/60 transition-all hover:bg-slate-100/80 hover:border-slate-300">
                    <button
                        onClick={() => handleTabChange("inventory")}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-[13px] font-black tracking-wider transition-all duration-300 ease-out",
                            activeTab === "inventory"
                                ? "bg-white text-indigo-600 shadow-md shadow-indigo-100 scale-100 ring-1 ring-black/5"
                                : "text-slate-500 hover:text-indigo-600 hover:bg-white/50 bg-transparent active:scale-95"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Категории
                    </button>
                    <button
                        onClick={() => handleTabChange("storage")}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-[13px] font-black tracking-wider transition-all duration-300 ease-out",
                            activeTab === "storage"
                                ? "bg-white text-indigo-600 shadow-md shadow-indigo-100 scale-100 ring-1 ring-black/5"
                                : "text-slate-500 hover:text-indigo-600 hover:bg-white/50 bg-transparent active:scale-95"
                        )}
                    >
                        <MapPin className="w-4 h-4" />
                        Хранение
                    </button>
                    <button
                        onClick={() => handleTabChange("dictionary")}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-[13px] font-black tracking-wider transition-all duration-300 ease-out",
                            activeTab === "dictionary"
                                ? "bg-white text-indigo-600 shadow-md shadow-indigo-100 scale-100 ring-1 ring-black/5"
                                : "text-slate-500 hover:text-indigo-600 hover:bg-white/50 bg-transparent active:scale-95"
                        )}
                    >
                        <Book className="w-4 h-4" />
                        Справочник
                    </button>
                    <button
                        onClick={() => handleTabChange("history")}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-[13px] font-black tracking-wider transition-all duration-300 ease-out",
                            activeTab === "history"
                                ? "bg-white text-indigo-600 shadow-md shadow-indigo-100 scale-100 ring-1 ring-black/5"
                                : "text-slate-500 hover:text-indigo-600 hover:bg-white/50 bg-transparent active:scale-95"
                        )}
                    >
                        <History className="w-4 h-4" />
                        История
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
                                className="h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[14px] px-6 gap-2 font-black shadow-xl shadow-indigo-200 transition-all active:scale-95 inline-flex items-center justify-center text-sm whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5" />
                                Добавить позицию
                            </Link>
                        </>
                    ) : null}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative">
                {activeTab === "inventory" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-6">
                        <WarehouseWidgets items={items} categories={categories} history={history} />
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
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <HistoryTable
                            transactions={history}
                            isAdmin={user?.roleName === "Администратор"}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
