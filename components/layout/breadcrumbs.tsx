"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useBreadcrumbs } from "./breadcrumbs-context";
import { Breadcrumbs as BreadcrumbsUI } from "@/components/ui/breadcrumbs";

const routeLabels: Record<string, string> = {
    dashboard: "Главная",
    orders: "Заказы",
    clients: "Клиенты",
    warehouse: "Склад",
    categories: "Категории",
    items: "Товары",
    production: "Производство",
    sales: "Продажи",
    overview: "Обзор",
    prints: "Принты",
    new: "Создание",
    design: "Дизайн",
    tasks: "Задачи",
    calculators: "Калькулятор расчета",
};

export function Breadcrumbs() {
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const { labels, customTrail } = useBreadcrumbs();

    useEffect(() => {
        setMounted(true);
    }, []);

    const paths = pathname.split("/").filter(Boolean);

    if (!mounted) return null;

    // If custom trail is provided, render it instead of pathname logic
    if (customTrail) {
        return <BreadcrumbsUI items={customTrail} />;
    }

    if (paths.length <= 1) return null;

    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const breadcrumbItems = paths.slice(1)
        .map((path, index) => {
            let href = `/${paths.slice(0, index + 2).join("/")}`;
            if (path === 'warehouse') href = "/dashboard/warehouse/overview";
            const label = labels.get(path) || routeLabels[path.toLowerCase()] || path;
            const isLast = index === paths.length - 2;
            return { href, label, isLast, path };
        })
        .filter(item => {
            // Filter out 'items' segment and any raw UUIDs that don't have a label yet
            if (item.path === 'items') return false;
            if (isUuid(item.path) && item.label === item.path) return false;
            return true;
        })
        .map(({ href, label, isLast }) => ({ href, label, isLast }));

    return <BreadcrumbsUI items={breadcrumbItems} />;
}
