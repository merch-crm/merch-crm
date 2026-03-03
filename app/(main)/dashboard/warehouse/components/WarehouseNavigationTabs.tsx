"use client";

import Link from"next/link";
import { cn } from"@/lib/utils";
import { motion } from"framer-motion";
import { LayoutGrid, MapPin, Book, History, Clock, Layers } from"lucide-react";

export const WAREHOUSE_TABS = [
    { id:"overview", label:"Обзор", icon: LayoutGrid, href:"/dashboard/warehouse/overview" },
    { id:"categories", label:"Категории", icon: Layers, href:"/dashboard/warehouse/categories" },
    { id:"storage", label:"Хранение", icon: MapPin, href:"/dashboard/warehouse/storage" },
    { id:"characteristics", label:"Характеристики", icon: Book, href:"/dashboard/warehouse/characteristics" },
    { id:"history", label:"История", icon: History, href:"/dashboard/warehouse/history", activeColor:"bg-[#550bf5]", shadowColor:"shadow-[#550bf5]/25" },
    { id:"archive", label:"Архив", icon: Clock, href:"/dashboard/warehouse/archive", activeColor:"bg-amber-500", shadowColor:"shadow-amber-500/25" }
];

export const WAREHOUSE_TAB_INFO: Record<string, { title: string; description: string }> = {"/dashboard/warehouse/overview": { title:"Обзор склада", description:"Сводные показатели, активность и критические остатки" },"/dashboard/warehouse/categories": { title:"Категории", description:"Управление структурой каталога, категориями и актуальными остатками" },"/dashboard/warehouse/storage": { title:"Места хранения", description:"Мониторинг складов, ячеек и перемещений продукции" },"/dashboard/warehouse/characteristics": { title:"Характеристики", description:"Настройка характеристик, типов атрибутов и параметров SKU" },"/dashboard/warehouse/history": { title:"Журнал операций", description:"Детальная история всех складских транзакций и изменений" },"/dashboard/warehouse/archive": { title:"Архив продукции", description:"Список позиций, выведенных из эксплуатации или удаленных" },"/dashboard/warehouse/items/new": { title:"Новая позиция", description:"Создание новой карточки товара в системе" }
};

interface WarehouseNavigationTabsProps {
    activeTab: string;
}

export function WarehouseNavigationTabs({ activeTab }: WarehouseNavigationTabsProps) {
    return (
        <div className="crm-card flex w-full h-[52px] sm:h-[58px] items-center gap-1 sm:gap-2 !p-[4px] sm:!p-[6px] !rounded-[18px] sm:!rounded-[22px] !overflow-x-auto scrollbar-hide">
            {/* Mobile Navigation (Icons Only) */}
            <nav
                role="tablist"
                aria-label="Навигация по разделам склада (мобильная)"
                className="flex sm:hidden items-center justify-between gap-1 w-full"
            >
                {WAREHOUSE_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            role="tab"
                            aria-selected={isActive}
                            aria-label={tab.label}
                            className={cn("flex-1 h-[44px] relative flex items-center justify-center !rounded-[14px] transition-all duration-300",
                                isActive ?"text-white" :"text-slate-400 hover:text-slate-900 active:scale-90"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobileActiveTab"
                                    className={cn("absolute inset-0 !rounded-[14px] z-0 shadow-md",
                                        tab.activeColor ||"bg-slate-900 shadow-slate-900/10",
                                        tab.shadowColor
                                    )}
                                    transition={{ type:"spring", bounce: 0.1, duration: 0.5 }}
                                />
                            )}
                            <Icon className={cn("w-4.5 h-4.5 relative z-10", isActive &&"scale-105")} />
                        </Link>
                    );
                })}
            </nav>

            {/* Desktop / Tablet Navigation (Full Labels) */}
            <nav
                role="tablist"
                aria-label="Навигация по разделам склада"
                className="hidden sm:flex sm:items-center gap-1.5 sm:gap-2 h-full w-max min-w-full"
            >
                {WAREHOUSE_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            role="tab"
                            aria-selected={isActive}
                            className={cn("flex-auto h-full px-3 sm:px-4 shrink-0 text-[12px] sm:text-[14px] font-bold relative flex items-center justify-center gap-2 group transition-colors duration-200 !rounded-[16px]",
                                isActive ?"text-white hover:text-white" :"text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeWarehouseTab"
                                    className={cn("absolute inset-0 !rounded-[16px] z-0 shadow-lg",
                                        tab.activeColor ||"bg-slate-900 shadow-slate-900/10",
                                        tab.shadowColor
                                    )}
                                    transition={{ type:"spring", bounce: 0, duration: 0.4 }}
                                />
                            )}
                            <tab.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 relative z-10 shrink-0" />
                            <span className="relative z-10 hidden lg:inline-block whitespace-nowrap">{tab.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
