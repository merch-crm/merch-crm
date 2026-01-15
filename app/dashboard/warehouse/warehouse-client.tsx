"use client";

import { useState } from "react";
import { LayoutGrid, History, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface WarehouseClientProps {
    items: InventoryItem[];
    categories: Category[];
    history: Transaction[];
    storageLocations: StorageLocation[];
    users: { id: string; name: string }[];
    measurementUnits: { id: string, name: string }[];
    user: Session | null;
}

export function WarehouseClient({ items, categories, history, storageLocations, users, measurementUnits, user }: WarehouseClientProps) {
    console.log(`WarehouseClient render: ${history.length} history items`);
    const [activeTab, setActiveTab] = useState<"inventory" | "storage" | "history">("inventory");

    return (
        <div className="space-y-8">
            {/* Sub Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 backdrop-blur-xl rounded-[20px] w-fit border border-slate-200/60 transition-all hover:bg-slate-100/80 hover:border-slate-300">
                    <button
                        onClick={() => setActiveTab("inventory")}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all duration-300 ease-out",
                            activeTab === "inventory"
                                ? "bg-white text-indigo-600 shadow-md shadow-indigo-100 scale-100 ring-1 ring-black/5"
                                : "text-slate-500 hover:text-indigo-600 hover:bg-white/50 bg-transparent active:scale-95"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Категории
                    </button>
                    <button
                        onClick={() => setActiveTab("storage")}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all duration-300 ease-out",
                            activeTab === "storage"
                                ? "bg-white text-indigo-600 shadow-md shadow-indigo-100 scale-100 ring-1 ring-black/5"
                                : "text-slate-500 hover:text-indigo-600 hover:bg-white/50 bg-transparent active:scale-95"
                        )}
                    >
                        <MapPin className="w-4 h-4" />
                        Хранение
                    </button>
                    <button
                        onClick={() => setActiveTab("history")}
                        className={cn(
                            "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-black uppercase tracking-wider transition-all duration-300 ease-out",
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
                        <AddCategoryDialog categories={categories} />
                    ) : null}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative">
                {activeTab === "inventory" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col gap-6">
                        <WarehouseWidgets items={items} categories={categories} history={history} />
                        <InventoryClient items={items} categories={categories} />
                    </div>
                ) : activeTab === "storage" ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <StorageLocationsTab locations={storageLocations} users={users} />
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
