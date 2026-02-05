"use client";

import { Plus, Archive, ArchiveRestore, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRangeFilter } from "./date-range-filter";
import { useState, useEffect } from "react";

export function OrdersToolbar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const showArchived = searchParams.get("archived") === "true";
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (searchQuery) {
                params.set("search", searchQuery);
            } else {
                params.delete("search");
            }
            params.set("page", "1");
            router.push(`/dashboard/orders?${params.toString()}`);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, router, searchParams]);

    const handleTabChange = (archived: boolean) => {
        const params = new URLSearchParams(searchParams);
        if (archived) {
            params.set("archived", "true");
        } else {
            params.delete("archived");
        }
        params.set("page", "1");
        router.push(`/dashboard/orders?${params.toString()}`);
    };

    return (
        <div className="space-y-3">
            {/* Main Toolbar Row */}
            <div className="crm-filter-tray p-1.5 rounded-[22px]">
                {/* Search Box */}
                <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Поиск по заказам..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="crm-filter-tray-search w-full pl-12 pr-10 focus:outline-none text-[13px] md:text-sm"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex-1 min-w-0 flex items-center">
                    <div className="flex items-center p-1 gap-1 overflow-x-auto no-scrollbar flex-nowrap w-full">
                        {[
                            { id: "base", label: "База", active: !showArchived, icon: ArchiveRestore },
                            { id: "archived", label: "Архив", active: showArchived, icon: Archive }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id === "archived")}
                                className={cn(
                                    "crm-filter-tray-tab shrink-0",
                                    tab.active && "active"
                                )}
                            >
                                {tab.active && (
                                    <motion.div
                                        layoutId="activeOrderTab"
                                        className={cn(
                                            "absolute inset-0 rounded-[16px] z-0",
                                            tab.id === "archived" ? "bg-amber-500 shadow-lg shadow-amber-500/20" : "bg-primary"
                                        )}
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <tab.icon className="w-3.5 h-3.5 relative z-10" />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hidden md:block w-px h-6 bg-slate-200 mx-2" />

                {/* Create Order - Desktop ONLY */}
                <div className="hidden md:flex items-center">
                    <Link
                        href="/dashboard/orders/new"
                        className="crm-filter-tray-tab !bg-primary text-white gap-2 !px-6 rounded-[16px]"
                    >
                        <Plus className="w-4 h-4" />
                        Создать заказ
                    </Link>
                </div>
            </div>

            {/* Mobile-only Row: Archive Tabs + Create Button */}
            <div className="flex md:hidden items-center gap-3">
                <div className="flex items-center p-1 gap-1 bg-slate-100/50 rounded-[18px] border border-slate-200/50">
                    {[
                        { id: "base", label: "База", active: !showArchived, icon: ArchiveRestore },
                        { id: "archived", label: "Архив", active: showArchived, icon: Archive }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id === "archived")}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-[14px] text-sm font-bold transition-all relative",
                                tab.active ? "bg-white text-primary shadow-sm" : "text-slate-500"
                            )}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <Link
                    href="/dashboard/orders/new"
                    className="w-11 h-11 flex items-center justify-center bg-primary text-white rounded-full sm:rounded-[18px] shadow-lg shadow-primary/20 shrink-0"
                    title="Создать заказ"
                >
                    <Plus className="w-5 h-5" />
                </Link>
            </div>

            {/* Date Range Filter - Separate Row */}
            <DateRangeFilter />
        </div>
    );
}
