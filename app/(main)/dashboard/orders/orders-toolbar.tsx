"use client";

import { Plus, Archive, ArchiveRestore, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DateRangeFilter } from "./date-range-filter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            <div className="crm-filter-tray p-1.5">
                {/* Search Box */}
                <div className="relative flex-1 min-w-0 group/search">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 group-focus-within/search:text-primary transition-colors" />
                    <Input
                        type="search"
                        placeholder="Поиск по заказам..."
                        aria-label="Поиск по заказам"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="crm-filter-tray-search w-full pl-12 pr-10 focus:outline-none text-sm border-none bg-transparent shadow-none h-11"
                    />
                    {searchQuery && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 w-8 h-8 rounded-full transition-all"
                            aria-label="Очистить поиск"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                <div className="flex-1 min-w-0 flex items-center">
                    <div className="flex items-center p-1 gap-1 overflow-x-auto no-scrollbar flex-nowrap w-full">
                        {[
                            { id: "base", label: "База", active: !showArchived, icon: ArchiveRestore },
                            { id: "archived", label: "Архив", active: showArchived, icon: Archive }
                        ].map((tab) => (
                            <Button
                                key={tab.id}
                                variant="ghost"
                                onClick={() => handleTabChange(tab.id === "archived")}
                                className={cn(
                                    "crm-filter-tab shrink-0",
                                    tab.active && "active"
                                )}
                            >
                                {tab.active && (
                                    <motion.div
                                        layoutId="activeOrderTab"
                                        className={cn(
                                            "absolute inset-0 rounded-[10px] z-0",
                                            tab.id === "archived" ? "bg-amber-500 shadow-lg shadow-amber-500/20" : "bg-primary"
                                        )}
                                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    />
                                )}
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <tab.icon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="hidden md:block w-px h-6 bg-slate-200 mx-2" />

                {/* Create Order - Desktop ONLY */}
                <div className="hidden md:flex items-center">
                    <Button
                        asChild
                        className="crm-filter-tray-tab !bg-primary text-white gap-2 !px-6 !rounded-[10px] h-auto"
                    >
                        <Link href="/dashboard/orders/new">
                            <Plus className="w-4 h-4" />
                            Создать заказ
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Mobile-only Row: Archive Tabs + Create Button */}
            <div className="flex md:hidden items-center gap-3">
                <div className="flex items-center p-1 gap-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                    {[
                        { id: "base", label: "База", active: !showArchived, icon: ArchiveRestore },
                        { id: "archived", label: "Архив", active: showArchived, icon: Archive }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(tab.id === "archived")}
                            aria-pressed={tab.active}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-sm font-bold transition-all relative",
                                tab.active ? "bg-white text-primary shadow-sm" : "text-slate-500"
                            )}
                        >
                            <tab.icon className="w-4 h-4" aria-hidden="true" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <Button
                    asChild
                    variant="btn-dark"
                    className="w-11 h-11 flex items-center justify-center rounded-full sm:rounded-2xl shadow-lg shadow-primary/20 shrink-0 p-0"
                    aria-label="Создать новый заказ"
                >
                    <Link
                        href="/dashboard/orders/new"
                        title="Создать заказ"
                    >
                        <Plus className="w-5 h-5" />
                    </Link>
                </Button>
            </div>

            {/* Date Range Filter - Separate Row */}
            <DateRangeFilter />
        </div>
    );
}
