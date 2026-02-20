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

    const paths = pathname.split("/").filter(Boolean);

    // If custom trail is provided, render it instead of pathname logic
    if (customTrail) {
        return <BreadcrumbsUI items={customTrail} />;
    }

    if (paths.length <= 1) return null;

    const breadcrumbItems = paths.slice(1)
        .map((path, index) => {
            const href = `/${paths.slice(0, index + 2).join("/")}`;
            const label = labels.get(path) || routeLabels[path] || path;
            const isLast = index === paths.length - 2;
            return { href, label, isLast, path };
        })
        .filter(item => item.path !== 'items')
        .map(({ href, label, isLast }) => ({ href, label, isLast }));

    return <BreadcrumbsUI items={breadcrumbItems} />;
}
