"use client";

import { usePathname } from "next/navigation";
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
    storage: "Места хранения",
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
    overview: "Обзор",
};

export function Breadcrumbs() {
    const pathname = usePathname();
    const { labels, customTrail } = useBreadcrumbs();

    const paths = pathname.split("/").filter(Boolean);

    // If custom trail is provided, render it instead of pathname logic
    if (customTrail) {
        return <BreadcrumbsUI items={customTrail} />;
    }

    if (paths.length <= 1) return null;

    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    const breadcrumbItems = paths.slice(1)
        .map((path, index) => {
            const href = `/${paths.slice(0, index + 2).join("/")}`;
            const label = labels.get(path) || routeLabels[path] || path;
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
