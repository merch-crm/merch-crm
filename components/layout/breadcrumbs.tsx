"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useBreadcrumbs } from "./breadcrumbs-context";
import { Breadcrumbs as BreadcrumbsUI } from "@/components/ui/breadcrumbs";

const routeLabels: Record<string, string> = {
    // Main sections
    dashboard: "Главная",
    orders: "Заказы",
    clients: "Клиенты",
    warehouse: "Склад",
    production: "Производство",
    design: "Дизайн",
    finance: "Финансы",
    analytics: "Аналитика",
    settings: "Настройки",
    profile: "Профиль",
    tasks: "Задачи",
    communications: "Коммуникации",
    admin: "Администрирование",
    "admin-panel": "Админ-панель",

    // Sub-sections & Actions
    archive: "Архив",
    attributes: "Атрибуты",
    "application-types": "Типы нанесения",
    branding: "Брендинг",
    calendar: "Календарь",
    categories: "Категории",
    characteristics: "Характеристики",
    characteristic: "Характеристики",
    departments: "Отделы",
    defects: "Брак",
    docs: "Документация",
    edit: "Редактирование",
    editor: "Редактор",
    equipment: "Оборудование",
    expenses: "Расходы",
    funds: "Фонды",
    history: "История",
    inventory: "Инвентаризация",
    items: "Товары",
    kanban: "Канбан",
    "knowledge-base": "База знаний",
    lines: "Линии",
    list: "Список",
    locations: "Места хранения",
    logs: "Логи",
    loyalty: "Лояльность",
    monitoring: "Мониторинг",
    new: "Создание",
    notifications: "Уведомления",
    overview: "Обзор",
    performance: "Производительность",
    pl: "P&L",
    prints: "Принты",
    promocodes: "Промокоды",
    queue: "Очередь",
    references: "Справочники",
    reports: "Отчеты",
    rfm: "RFM-анализ",
    roles: "Роли",
    salary: "Зарплаты",
    sales: "Продажи",
    security: "Безопасность",
    s3: "S3",
    "s3-manager": "S3 Хранилище",
    staff: "Персонал",
    stock: "Остатки",
    storage: "Хранение",
    "storage-preview": "Просмотр склада",
    transactions: "Операции",
    users: "Пользователи",
    view: "Просмотр",

    // Calculators
    calculators: "Калькуляторы",
    dtf: "DTF-печать",
    sublimation: "Сублимация",
    dtg: "DTG-печать",
    "uv-dtf": "UV DTF-печать",
    thermotransfer: "Термотрансфер",
    embroidery: "Вышивка",
    silkscreen: "Шелкография",
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
        .map(({ href, label, isLast }) => ({ href, label, isLast, className: isLast ? "text-primary" : "" }));

    return <BreadcrumbsUI items={breadcrumbItems} />;
}
