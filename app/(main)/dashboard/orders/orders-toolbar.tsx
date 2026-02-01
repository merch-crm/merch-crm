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
        <div className="crm-filter-tray gap-6 mb-8">
            {/* Search Box */}
            <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Поиск по заказам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 bg-white border-none rounded-[14px] pl-12 pr-10 text-[13px] font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
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

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 px-1">
                {/* Database/Archive Tabs */}
                <div className="flex items-center p-1 gap-1">
                    {[
                        { id: "base", label: "База", active: !showArchived, icon: ArchiveRestore },
                        { id: "archived", label: "Архив", active: showArchived, icon: Archive }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id === "archived")}
                            className={cn(
                                "relative flex items-center gap-2.5 px-6 py-2.5 rounded-[14px] text-[13px] font-bold transition-all duration-300 group",
                                tab.active ? "text-white" : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {tab.active && (
                                <motion.div
                                    layoutId="activeOrderTab"
                                    className={cn(
                                        "absolute inset-0 rounded-[14px] shadow-lg shadow-primary/25",
                                        tab.id === "archived" ? "bg-amber-500" : "bg-primary"
                                    )}
                                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                />
                            )}
                            <tab.icon className="w-3.5 h-3.5 relative z-10" />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="w-px h-6 bg-slate-200 mx-2" />

                <DateRangeFilter />

                <div className="w-px h-6 bg-slate-200 mx-2" />

                <Link
                    href="/dashboard/orders/new"
                    className="h-11 bg-primary text-white rounded-[14px] px-6 gap-2 font-bold transition-all active:scale-95 inline-flex items-center shadow-lg shadow-primary/20 text-[13px]"
                >
                    <Plus className="w-4 h-4" />
                    Создать заказ
                </Link>
            </div>
        </div>
    );
}
