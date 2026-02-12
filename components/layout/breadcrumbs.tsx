"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBreadcrumbs } from "./breadcrumbs-context";
import { useMediaQuery } from "@/hooks/use-media-query";

const routeLabels: Record<string, string> = {
    dashboard: "Главная",
    orders: "Заказы",
    clients: "Клиенты",
    warehouse: "Склад",
    categories: "Категории",
    items: "Товары",
    production: "Производство",
    design: "Дизайн",
    tasks: "Задачи",
    finance: "Финансы",
    "knowledge-base": "База знаний",
    admin: "Администрирование",
    branding: "Внешний вид",
    users: "Сотрудники",
    roles: "Роли",
    departments: "Отделы",
    promocodes: "Промокоды",
    monitoring: "Мониторинг",
    storage: "Хранилище",
    characteristics: "Характеристики",
    history: "История",
    archive: "Архив",
    new: "Создание",
    profile: "Профиль",
    salary: "Зарплата",
    funds: "Фонды",
    transactions: "Транзакции",
    expenses: "Расходы",
    pl: "P&L отчет",
    sales: "Продажи",
};

export function Breadcrumbs() {
    const pathname = usePathname();
    const { labels, customTrail } = useBreadcrumbs();
    const isMobile = useMediaQuery("(max-width: 1023px)");

    const paths = pathname.split("/").filter(Boolean);

    // If custom trail is provided, render it instead of pathname logic
    if (customTrail) {
        const displayTrail = (isMobile && customTrail.length > 2)
            ? [
                { label: "...", isEllipsis: true },
                customTrail[customTrail.length - 2],
                customTrail[customTrail.length - 1]
            ]
            : customTrail.map(item => ({ ...item, isEllipsis: false }));

        return (
            <nav className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-left-2 duration-500">
                <Link
                    href="/dashboard"
                    className="text-slate-400 hover:text-primary transition-all hover:scale-125 active:scale-90"
                >
                    <Home className="w-3.5 h-3.5" />
                </Link>

                {displayTrail.map((item, index) => {
                    const isLast = index === displayTrail.length - 1;

                    return (
                        <div key={item.label + index} className="flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                            {item.isEllipsis ? (
                                <span className="text-[12px] font-bold text-slate-400 opacity-60">...</span>
                            ) : item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="text-[12px] font-bold tracking-tight text-slate-400 hover:text-primary transition-all hover:scale-[1.05] inline-block active:scale-95"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className={cn(
                                    "text-[12px] font-bold tracking-tight transition-all",
                                    isLast ? "text-slate-900" : "text-slate-400"
                                )}>
                                    {item.label}
                                </span>
                            )}
                        </div>
                    );
                })}
            </nav>
        );
    }

    if (paths.length <= 1) return null;

    const breadcrumbItems = paths.slice(1)
        .map((path, index) => {
            const href = `/${paths.slice(0, index + 2).join("/")}`;
            const label = labels.get(path) || routeLabels[path] || path;
            const isLast = index === paths.length - 2;
            return { href, label, isLast, isEllipsis: false, path };
        })
        .filter(item => item.path !== 'items');

    const displayItems = (isMobile && breadcrumbItems.length > 2)
        ? [
            { label: "...", isEllipsis: true, href: "#", isLast: false },
            breadcrumbItems[breadcrumbItems.length - 2],
            breadcrumbItems[breadcrumbItems.length - 1]
        ]
        : breadcrumbItems;

    return (
        <nav className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-left-2 duration-500">
            <Link
                href="/dashboard"
                className="text-slate-400 hover:text-primary transition-all hover:scale-125 active:scale-90"
            >
                <Home className="w-3.5 h-3.5" />
            </Link>

            {displayItems.map((item, index) => {
                return (
                    <div key={item.href + index} className="flex items-center gap-2">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                        {item.isEllipsis ? (
                            <span className="text-[12px] font-bold text-slate-400 opacity-60">...</span>
                        ) : (
                            <Link
                                href={item.href}
                                className={cn(
                                    "text-[12px] font-bold tracking-tight transition-all",
                                    item.isLast
                                        ? "text-slate-900"
                                        : "text-slate-400 hover:text-primary hover:scale-[1.05] active:scale-95"
                                )}
                            >
                                {item.label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}
